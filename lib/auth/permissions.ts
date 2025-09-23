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

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return null;
    }

    // Get user details including role and plan
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role, plan')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      return null;
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