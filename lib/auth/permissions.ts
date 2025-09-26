import { createClient } from '@/lib/supabase/server';

export interface AuthUser {
  id: string;
  role: string;
  plan: string;
  email: string;
}

export async function getUserWithRole(): Promise<AuthUser | null> {
  try {
    const supabase = createClient();

    // Try getUser() first, fallback to getSession() for compatibility
    let user = null;
    let authError = null;

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      user = userData.user;
      authError = userError;
    } catch (e) {
      console.log('getUser() failed, trying getSession():', e);
      // Fallback to getSession for browser contexts
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      user = sessionData.session?.user || null;
      authError = sessionError;
    }

    if (authError || !user) {
      console.log('Authentication failed:', authError?.message || 'No user found');
      return null;
    }

    // HARDCODED ADMIN BYPASS - Skip database check for admin account
    if (user.email === 'evank8029@gmail.com' || user.id === 'a041dff2-d833-49e3-bdf3-1a5c02523ce1') {
      console.log('🔒 HARDCODED ADMIN BYPASS - Returning admin user without DB check');
      return {
        id: user.id,
        role: 'admin',
        plan: 'enterprise',
        email: user.email || ''
      };
    }

    // Try to get user details from database, fallback to session metadata
    let userData = null;
    let userError = null;

    try {
      const { data, error } = await supabase
        .from('users')
        .select('role, plan')
        .eq('id', user.id)
        .single();
      userData = data;
      userError = error;
    } catch (e) {
      userError = e;
      console.log('Database query failed, using fallback user data:', e);
    }

    if (userError || !userData) {
      // Fallback: Use session metadata or default values
      console.log('Using fallback user data due to DB error:', userError?.message);

      // Extract role from user metadata if available
      const metadataRole = user.user_metadata?.role || user.app_metadata?.role;
      const role = metadataRole && ['admin', 'buyer', 'seller'].includes(metadataRole) ? metadataRole : 'buyer';

      return {
        id: user.id,
        role: role,
        plan: 'free', // Default to free plan for fallback users
        email: user.email || ''
      };
    }

    return {
      id: user.id,
      role: (userData as any).role,
      plan: (userData as any).plan,
      email: user.email || ''
    };
  } catch (error) {
    console.error('Error getting user with role:', error);
    return null;
  }
}

export function isAdminUser(userRole: string): boolean {
  return userRole === 'admin';
}

export function hasFeatureAccess(userPlan: string, userRole: string): boolean {
  // Admin users bypass all restrictions
  if (isAdminUser(userRole)) return true;

  // Non-free users have basic access
  return userPlan !== 'free';
}