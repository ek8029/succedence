'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import type { UserWithProfile, AuthUser } from '../lib/types'
import { useRouter } from 'next/navigation'
import { showNotification } from '@/components/Notification'

interface AuthContextType {
  user: AuthUser | null
  session: Session | null
  userProfile: UserWithProfile | null
  isLoading: boolean
  signUp: (email: string, password: string, userData: { name: string; role: string }) => Promise<{ error?: string }>
  signIn: (userData?: any) => Promise<void>
  signInWithEmail: (email: string, password: string, rememberMe?: boolean) => Promise<{ error?: string }>
  signOut: () => Promise<void>
  updateProfile: (profileData: any) => Promise<{ error?: string }>
  resetAuthState: () => void
  refreshUser: () => Promise<void>
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ error?: string }>
  resetPassword: (email: string) => Promise<{ error?: string }>
  updatePassword: (password: string) => Promise<{ error?: string }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<AuthUser | null>(null)
  const [userProfile, setUserProfile] = useState<UserWithProfile | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  // Helper function to extract role from session metadata
  const extractRoleFromSession = (sessionUser: any): 'buyer' | 'seller' | 'admin' => {
    // HARDCODED ADMIN PROTECTION - Never allow admin account to be anything but admin
    if (sessionUser?.email === 'evank8029@gmail.com' || sessionUser?.id === 'a041dff2-d833-49e3-bdf3-1a5c02523ce1') {
      console.log('🔒 HARDCODED ADMIN DETECTION - Forcing admin role for:', sessionUser?.email)
      return 'admin'
    }

    // Check various places where role might be stored in session metadata
    const role = sessionUser?.user_metadata?.role ||
                 sessionUser?.app_metadata?.role ||
                 sessionUser?.user_metadata?.user_role ||
                 sessionUser?.app_metadata?.user_role

    // Validate the role is one we expect
    if (role && ['admin', 'buyer', 'seller'].includes(role)) {
      console.log('Extracted role from session metadata:', role)
      return role as 'buyer' | 'seller' | 'admin'
    }

    // Default to buyer if no valid role found
    console.log('No valid role found in session, defaulting to buyer')
    return 'buyer'
  }


  useEffect(() => {
    let isMounted = true

    // Get initial session with timeout protection
    const initializeAuth = async () => {
      try {
        console.log('Initializing auth...')

        // Check if this should be a non-persistent session
        const sessionPersist = sessionStorage.getItem('session-persist')
        if (sessionPersist === 'false') {
          console.log('Non-persistent session detected, ignoring stored session on browser refresh')
          // Clear session storage flag since it's served its purpose
          sessionStorage.removeItem('session-persist')
          setIsLoading(false)
          return
        }

        // Simple session check without timeout race condition
        const { data: { session }, error } = await supabase.auth.getSession()

        console.log('Initial session check:', { session: !!session, error })

        if (!isMounted) return

        setSession(session)
        if (session?.user) {
          console.log('Found existing session, fetching profile...')
          await fetchUserProfile(session.user.id, session.user)
        } else {
          console.log('No existing session, no loading needed')
        }
      } catch (error) {
        console.error('Error getting initial session:', error)
        if (isMounted) {
          setIsLoading(false)
          setUser(null)
          setUserProfile(null)
          setSession(null)
        }
      }
    }

    initializeAuth()

    // Listen for auth changes with error handling
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
      try {
        if (!isMounted) return

        console.log('Auth state change:', event, !!session?.user)
        setSession(session)
        if (session?.user) {
          if (event === 'SIGNED_IN') {
            console.log('🚪 User signed in - setting up user immediately')
            // Don't clear user state if we already have a user with the same ID
            if (user && user.id === session.user.id) {
              console.log('User already set with same ID, keeping existing state')
              return
            }

            // Set up user immediately to prevent auth delays
            const quickUser: AuthUser = {
              id: session.user.id,
              email: session.user.email || '',
              name: session.user.user_metadata?.name || session.user.user_metadata?.full_name || 'User',
              role: session.user.email === 'evank8029@gmail.com' ? 'admin' : 'buyer',
              plan: session.user.email === 'evank8029@gmail.com' ? 'enterprise' : 'free',
              status: 'active'
            }
            setUser(quickUser)

            // Fetch detailed profile in background
            setTimeout(() => {
              fetchUserProfile(session.user.id, session.user).catch(error => {
                console.log('Background profile fetch failed (non-critical):', error)
              })
            }, 100)
          } else if (event === 'TOKEN_REFRESHED' && !user) {
            // Only fetch if we don't already have user data
            fetchUserProfile(session.user.id).catch((error) => {
              console.error('Profile refresh failed:', error)
            })
          }
        } else {
          console.log('🚪 No session - clearing user state')
          setUser(null)
          setUserProfile(null)
          setIsLoading(false)
        }
      } catch (error) {
        console.error('Error in auth state change handler:', error)
        if (isMounted) {
          setIsLoading(false)
          setUser(null)
          setUserProfile(null)
        }
      }
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [supabase])

  const fetchUserProfile = async (userId: string, sessionUser?: any) => {
    try {
      console.log('Fetching user profile for:', userId)

      // Check if we already have a valid user with the same ID to avoid unnecessary refetches
      if (user && user.id === userId) {
        console.log('User already exists with same ID, skipping fetch')
        setIsLoading(false)
        return
      }

      // Use passed sessionUser or get session if not provided (only once)
      if (!sessionUser) {
        const { data: sessionData } = await supabase.auth.getSession()
        sessionUser = sessionData?.session?.user
      }

      // IMMEDIATE ADMIN AUTHENTICATION for known admin account
      if (sessionUser?.email === 'evank8029@gmail.com' || userId === 'a041dff2-d833-49e3-bdf3-1a5c02523ce1') {
        console.log('🔒 ADMIN ACCOUNT - Setting up admin user immediately')
        const adminUser: AuthUser = {
          id: 'a041dff2-d833-49e3-bdf3-1a5c02523ce1',
          email: 'evank8029@gmail.com',
          name: 'Evan Kim',
          role: 'admin',
          plan: 'enterprise',
          status: 'active'
        }
        setUser(adminUser)
        setIsLoading(false)
        console.log('✅ Admin authenticated immediately')

        // Still try to fetch from database in background to get latest data, but don't override hardcoded admin
        setTimeout(async () => {
          try {
            const { data: adminData } = await supabase.from('users').select('*').eq('id', userId).single()
            if (adminData) {
              console.log('📋 Got admin database data, but keeping hardcoded admin info to prevent account switching')
              // Only update plan from database, keep hardcoded name/role to prevent account switching issues
              setUser({
                id: 'a041dff2-d833-49e3-bdf3-1a5c02523ce1',
                email: 'evank8029@gmail.com',
                name: 'Evan Kim', // Keep hardcoded to prevent "User" override
                role: 'admin', // Keep hardcoded to prevent role switching
                plan: (adminData as any).plan || 'enterprise',
                status: (adminData as any).status || 'active',
              })
            }
          } catch (bgError) {
            console.log('Background admin data fetch failed (non-critical):', bgError)
          }
        }, 100)
        return
      }

      // For all other users, fetch from database with 1 second timeout
      console.log('📋 Fetching user from database...')
      let userData = null
      let userError = null

      try {
        const userFetchPromise = supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single()

        // Simple 1-second timeout
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Database timeout')), 1000)
        )

        const result = await Promise.race([userFetchPromise, timeoutPromise]) as any
        userData = result.data
        userError = result.error

        console.log('User data fetch completed:', { userData: !!userData, userError })
      } catch (fetchError) {
        console.error('User fetch failed:', fetchError)
        userError = fetchError
      }

      // Only create fallback if we really can't get user data AND don't already have a user
      if ((userError || !userData) && !user) {
        console.log('Creating fallback user due to fetch failure and no existing user')
        console.error('User fetch failed:', userError)

        // NEVER CREATE FALLBACK FOR ADMIN ACCOUNT - admin should always be hardcoded
        if (sessionUser?.email === 'evank8029@gmail.com' || userId === 'a041dff2-d833-49e3-bdf3-1a5c02523ce1') {
          console.log('🚫 BLOCKED FALLBACK - Admin account must use hardcoded data, not fallback')
          const hardcodedAdmin: AuthUser = {
            id: 'a041dff2-d833-49e3-bdf3-1a5c02523ce1',
            email: 'evank8029@gmail.com',
            name: 'Evan Kim',
            role: 'admin',
            plan: 'enterprise',
            status: 'active'
          }
          setUser(hardcodedAdmin)
          setIsLoading(false)
          return
        }

        // Create sensible fallback for non-admin users only
        const fallbackUser: AuthUser = {
          id: userId,
          email: sessionUser?.email || 'user@example.com',
          name: sessionUser?.user_metadata?.name || sessionUser?.user_metadata?.full_name || 'User',
          role: extractRoleFromSession(sessionUser),
          plan: 'free',
          status: 'active'
        }

        console.log('Created fallback user with session data:', fallbackUser)
        setUser(fallbackUser)
        setIsLoading(false)
        return
      } else if ((userError || !userData) && user) {
        // If we already have a user and fetch fails, just keep the existing user
        console.log('User fetch failed but keeping existing user data')
        setIsLoading(false)
        return
      }

      // FINAL ADMIN CHECK - Even if we got database data, use hardcoded for admin
      if (sessionUser?.email === 'evank8029@gmail.com' || userId === 'a041dff2-d833-49e3-bdf3-1a5c02523ce1') {
        console.log('🔐 FINAL ADMIN CHECK - Using hardcoded admin data even with database response')
        const finalAdminUser: AuthUser = {
          id: 'a041dff2-d833-49e3-bdf3-1a5c02523ce1',
          email: 'evank8029@gmail.com',
          name: 'Evan Kim', // Always hardcoded
          role: 'admin', // Always hardcoded
          plan: userData.plan || 'enterprise', // Use database plan if available
          status: userData.status || 'active',
        }
        console.log('✅ Final admin user set:', finalAdminUser)
        setUser(finalAdminUser)
        setIsLoading(false)
      } else {
        // Set user data immediately for non-admin users
        const authUser: AuthUser = {
          id: userData.id,
          email: userData.email,
          name: userData.name,
          role: userData.role,
          plan: userData.plan || 'free',
          status: userData.status || 'active',
        }

        console.log('Setting authenticated user:', authUser)
        setUser(authUser)
        setIsLoading(false) // Critical: Set loading false immediately after user is set
      }

      // Fetch additional profile data in background (completely non-blocking)
      setTimeout(async () => {
        try {
          console.log('Starting background profile fetch...')
          const [profileResult, preferencesResult] = await Promise.allSettled([
            supabase.from('profiles').select('*').eq('user_id', userId).single(),
            supabase.from('preferences').select('*').eq('user_id', userId).single()
          ])

          const profileData = profileResult.status === 'fulfilled' ? profileResult.value?.data : null
          const preferencesData = preferencesResult.status === 'fulfilled' ? preferencesResult.value?.data : null

          const userWithProfile: UserWithProfile = {
            ...userData,
            profile: profileData,
            preferences: preferencesData,
          }

          console.log('Background profile fetch completed')
          setUserProfile(userWithProfile)
        } catch (profileError) {
          console.log('Background profile fetch failed (non-critical):', profileError)
        }
      }, 100) // Small delay to ensure user state is set first

    } catch (error) {
      console.error('Critical error in fetchUserProfile:', error)

      // Try to get session data for emergency fallback
      try {
        const { data: sessionData } = await supabase.auth.getSession()
        const sessionUser = sessionData?.session?.user

        // BULLETPROOF ADMIN ACCOUNT HANDLING
        if (sessionUser?.email === 'evank8029@gmail.com' || userId === 'a041dff2-d833-49e3-bdf3-1a5c02523ce1') {
          console.log('🔒 FINAL ADMIN EMERGENCY - Using hardcoded admin data')
          const emergencyUser: AuthUser = {
            id: 'a041dff2-d833-49e3-bdf3-1a5c02523ce1',
            email: 'evank8029@gmail.com',
            name: 'Evan Kim',
            role: 'admin',
            plan: 'enterprise',
            status: 'active'
          }
          setUser(emergencyUser)
          setIsLoading(false)
          console.log('✅ Final admin emergency activated:', emergencyUser)
        } else {
          // Regular emergency fallback for non-admin users
          const emergencyUser: AuthUser = {
            id: userId,
            email: sessionUser?.email || 'user@example.com',
            name: sessionUser?.user_metadata?.name || sessionUser?.user_metadata?.full_name || 'User',
            role: extractRoleFromSession(sessionUser),
            plan: 'free',
            status: 'active'
          }
          setUser(emergencyUser)
          setIsLoading(false)
          console.log('Emergency user fallback activated with session data:', emergencyUser)
        }
      } catch (sessionError) {
        console.error('Failed to get session for emergency fallback:', sessionError)
        // Final fallback without session data - default to buyer
        const emergencyUser: AuthUser = {
          id: userId,
          email: 'user@example.com',
          name: 'User',
          role: 'buyer', // No session data available, defaulting to buyer
          plan: 'free',
          status: 'active'
        }
        setUser(emergencyUser)
        setIsLoading(false)
        console.log('Final emergency user fallback activated')
      }
    }
  }

  const signUp = async (email: string, password: string, userData: { name: string; role: string }) => {
    try {
      setIsLoading(true)
      console.log('Starting sign-up process for:', email)

      // Sign up with Supabase Auth
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
      })

      console.log('Sign-up response:', { data: !!data, authError, user: !!data?.user, session: !!data?.session })

      if (authError) {
        console.error('Sign-up error:', authError)
        return { error: authError.message }
      }

      if (data.user) {
        console.log('User created, creating profile...')
        // Create user profile via API
        try {
          const response = await fetch('/api/auth/create-profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: data.user.id,
              email: data.user.email,
              name: userData.name,
              role: userData.role
            })
          })

          const result = await response.json()
          console.log('Profile creation result:', { ok: response.ok, result })

          if (!response.ok) {
            return { error: result.error || 'Failed to create user profile' }
          }
        } catch (error) {
          console.error('Error creating user profile:', error)
          return { error: 'Failed to create user profile' }
        }

        // Check if email confirmation is required
        if (data.session) {
          console.log('User signed up and automatically signed in')
          showNotification('Account created and you are now signed in!', 'success')
        } else {
          console.log('Email confirmation required')
          showNotification('Account created successfully! Please check your email to verify your account before signing in.', 'success')
        }
      } else {
        console.warn('Sign-up succeeded but no user returned')
        return { error: 'Account creation failed - no user data returned' }
      }

      return {}
    } catch (error: any) {
      console.error('Sign-up exception:', error)
      return { error: error.message }
    } finally {
      setIsLoading(false)
    }
  }

  // Legacy support for the existing auth page
  const signIn = async (userData?: any) => {
    if (userData?.email && userData?.role) {
      // This is for the existing auth page compatibility
      showNotification(`Welcome ${userData.name || userData.email}!`, 'success')
      // Redirect based on role
      setTimeout(() => {
        if (userData.role === 'ADMIN') {
          router.push('/admin')
        } else {
          router.push('/')
        }
      }, 500)
    }
  }

  const signInWithEmail = async (email: string, password: string, rememberMe?: boolean) => {
    try {
      console.log('Starting sign-in process for:', email, 'rememberMe:', rememberMe)

      // Call Supabase auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error('Sign-in error:', error)
        return { error: error.message }
      }

      if (data?.user && data?.session) {
        console.log('Sign-in successful - setting up user immediately for:', data.user.email)

        // ACCOUNT SWITCHING PROTECTION: If switching to a different account, force a refresh
        if (user && user.email !== data.user.email) {
          console.log('🔄 ACCOUNT SWITCH DETECTED: Switching from', user.email, 'to', data.user.email, '- forcing page refresh')

          // Set temporary flag to identify account switch
          sessionStorage.setItem('account-switched', 'true')

          // Force page refresh to completely clear any cached state
          setTimeout(() => {
            window.location.reload()
          }, 100)
          return {}
        }

        // Configure session persistence
        if (rememberMe === false) {
          console.log('Configuring non-persistent session (expires on browser close)')
          sessionStorage.setItem('session-persist', 'false')
          localStorage.removeItem(`sb-${process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0]}-auth-token`)
        } else {
          console.log('Configuring persistent session (30 days)')
          sessionStorage.setItem('session-persist', 'true')
        }

        // IMMEDIATE USER SETUP - No complex database queries blocking the UI
        const quickUser: AuthUser = {
          id: data.user.id,
          email: data.user.email || email,
          name: data.user.user_metadata?.name || data.user.user_metadata?.full_name || 'User',
          role: data.user.email === 'evank8029@gmail.com' ? 'admin' : 'buyer',
          plan: data.user.email === 'evank8029@gmail.com' ? 'enterprise' : 'free',
          status: 'active'
        }

        console.log('Setting quick user for immediate access:', quickUser)
        setUser(quickUser)
        setSession(data.session)

        // Fetch detailed profile in background without blocking
        setTimeout(() => {
          fetchUserProfile(data.user.id, data.user).catch(error => {
            console.log('Background profile fetch failed (non-critical):', error)
          })
        }, 100)

        return {}
      } else {
        console.warn('Sign-in succeeded but no user/session returned')
        return { error: 'Sign-in succeeded but no session was created' }
      }
    } catch (error: any) {
      console.error('Sign-in exception:', error)
      return { error: error.message }
    }
  }

  const signOut = async () => {
    try {
      setIsLoading(true)

      // CRITICAL: Immediately clear user state to prevent permission persistence
      console.log('🚪 Signing out - immediately clearing user state')
      setUser(null)
      setUserProfile(null)
      setSession(null)

      // Clear session persistence flags
      sessionStorage.removeItem('session-persist')

      // Clear all Supabase auth storage to prevent cross-account contamination
      try {
        // Clear localStorage auth tokens
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0]
        if (supabaseUrl) {
          localStorage.removeItem(`sb-${supabaseUrl}-auth-token`)
          sessionStorage.removeItem(`sb-${supabaseUrl}-auth-token`)
        }
        console.log('🧹 CLEANUP: Cleared auth storage')
      } catch (cleanupError) {
        console.log('Auth storage cleanup failed (non-critical):', cleanupError)
      }

      await fetch('/api/auth/signout', { method: 'POST' })
      await supabase.auth.signOut()

      // Force a hard refresh of the page after signout to clear any cached state
      console.log('🔄 CLEANUP: Forcing page refresh to clear cached state')
      showNotification('Successfully signed out', 'success')

      // Use replace + reload to completely clear any cached state
      setTimeout(() => {
        window.location.replace('/')
      }, 500)

    } catch (error) {
      console.error('Error signing out:', error)
      showNotification('Error signing out', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const updateProfile = async (profileData: any) => {
    if (!user) return { error: 'Not authenticated' }

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          ...profileData,
          updated_at: new Date().toISOString(),
        })

      if (error) {
        return { error: error.message }
      }

      // Refresh profile
      await fetchUserProfile(user.id)
      showNotification('Profile updated successfully', 'success')
      return {}
    } catch (error: any) {
      return { error: error.message }
    }
  }

  const resetAuthState = () => {
    setIsLoading(false)
    setUser(null)
    setUserProfile(null)
    setSession(null)
  }

  const refreshUser = async () => {
    if (user?.id) {
      console.log('Refreshing user data...')
      // Don't clear user state - just update with fresh data
      try {
        const { data: userData, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single()

        if (!error && userData) {
          console.log('Refreshed user data successfully')
          setUser({
            id: (userData as any).id,
            email: (userData as any).email,
            name: (userData as any).name,
            role: (userData as any).role,
            plan: (userData as any).plan || 'free',
            status: (userData as any).status || 'active',
          })
        } else {
          console.log('User refresh failed, keeping existing user data:', error)
        }
      } catch (error) {
        console.log('User refresh exception, keeping existing user:', error)
      }
    }
  }

  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!user || !session) return { error: 'Not authenticated' }

    try {
      console.log('🔑 Changing password for user:', user.email)

      // First verify current password by signing in
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      })

      if (verifyError) {
        console.log('Current password verification failed:', verifyError)
        return { error: 'Current password is incorrect' }
      }

      // Update password
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) {
        console.error('Password update failed:', error)
        return { error: error.message }
      }

      console.log('✅ Password changed successfully')
      showNotification('Password updated successfully', 'success')
      return {}
    } catch (error: any) {
      console.error('Password change exception:', error)
      return { error: error.message || 'Failed to change password' }
    }
  }

  const resetPassword = async (email: string) => {
    try {
      console.log('🔑 Sending password reset email to:', email)

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) {
        console.error('Password reset request failed:', error)
        return { error: error.message }
      }

      console.log('✅ Password reset email sent successfully')
      return {}
    } catch (error: any) {
      console.error('Password reset exception:', error)
      return { error: error.message || 'Failed to send reset email' }
    }
  }

  const updatePassword = async (password: string) => {
    try {
      console.log('🔑 Updating password from reset token')

      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) {
        console.error('Password update from reset failed:', error)
        return { error: error.message }
      }

      console.log('✅ Password updated from reset successfully')
      showNotification('Password updated successfully! You can now sign in with your new password.', 'success')
      return {}
    } catch (error: any) {
      console.error('Password update exception:', error)
      return { error: error.message || 'Failed to update password' }
    }
  }

  const value = {
    user,
    session,
    userProfile,
    isLoading,
    signUp,
    signIn,
    signInWithEmail,
    signOut,
    updateProfile,
    resetAuthState,
    refreshUser,
    changePassword,
    resetPassword,
    updatePassword,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}