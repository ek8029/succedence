import { createServiceClient } from '@/lib/supabase/server'

// Known admin emails - must match middleware and AuthContext
const KNOWN_ADMINS = [
  'evank8029@gmail.com',
  'succedence@gmail.com',
  'founder@succedence.com',
  'clydek627@gmail.com'
]

/**
 * Checks if a user is an admin
 * First checks hardcoded admin list, then falls back to database check
 */
export async function isAdmin(userId: string, userEmail: string | null | undefined): Promise<boolean> {
  // Check if user is a known admin (hardcoded)
  if (userEmail && KNOWN_ADMINS.includes(userEmail)) {
    console.log('🔒 Known admin access granted for:', userEmail)
    return true
  }

  // Fall back to database check
  try {
    const serviceSupabase = createServiceClient()
    const { data: userData, error: userError } = await serviceSupabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single()

    if (userError || !userData) {
      console.error('Admin database check failed:', { userError, userId, email: userEmail })
      return false
    }

    const isAdminRole = (userData as any).role === 'admin'
    console.log('Admin database check:', { userId, email: userEmail, role: (userData as any).role, isAdmin: isAdminRole })
    return isAdminRole
  } catch (error) {
    console.error('Admin check exception:', error)
    return false
  }
}

/**
 * Helper to get admin status with error response
 * Returns null if admin, or an error object if not admin
 * This is a synchronous check for known admins, avoiding database queries
 */
export function requireAdminSync(userEmail: string | null | undefined): { error: string, status: number } | null {
  // Check if user is a known admin (hardcoded)
  if (userEmail && KNOWN_ADMINS.includes(userEmail)) {
    console.log('🔒 Known admin access granted for:', userEmail)
    return null
  }

  return {
    error: 'Forbidden - Admin access required. Known admin email required.',
    status: 403
  }
}

/**
 * Helper to get admin status with error response
 * Returns null if admin, or an error object if not admin
 */
export async function requireAdmin(userId: string, userEmail: string | null | undefined): Promise<{ error: string, status: number } | null> {
  const adminStatus = await isAdmin(userId, userEmail)

  if (!adminStatus) {
    return {
      error: 'Forbidden - Admin access required',
      status: 403
    }
  }

  return null
}
