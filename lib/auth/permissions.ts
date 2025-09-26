import { createClient } from '@/lib/supabase/server';

export interface AuthUser {
  id: string;
  role: string;
  plan: string;
  email: string;
}

export async function getUserWithRole(): Promise<AuthUser | null> {
  try {
    // DEVELOPMENT MODE BYPASS - Skip auth in development for testing
    if (process.env.NODE_ENV === 'development' && process.env.DEV_BYPASS_AUTH === 'true') {
      console.log('🔧 DEV MODE: Bypassing authentication for testing');
      return {
        id: '00000000-0000-0000-0000-000000000000',
        role: 'admin',
        plan: 'enterprise',
        email: 'dev@test.com'
      };
    }

    const supabase = createClient();

    // Use getUser() which validates session with Supabase Auth server
    const { data: userData, error: authError } = await supabase.auth.getUser();
    const user = userData.user;

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
    let dbUserData = null;
    let userError = null;

    try {
      const { data, error } = await supabase
        .from('users')
        .select('role, plan')
        .eq('id', user.id)
        .single();
      dbUserData = data;
      userError = error;
    } catch (e) {
      userError = e;
      console.log('Database query failed, using fallback user data:', e);
    }

    if (userError || !dbUserData) {
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
      role: (dbUserData as any).role,
      plan: (dbUserData as any).plan,
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