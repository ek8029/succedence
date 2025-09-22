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
  signInWithEmail: (email: string, password: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
  updateProfile: (profileData: any) => Promise<{ error?: string }>
  resetAuthState: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<AuthUser | null>(null)
  const [userProfile, setUserProfile] = useState<UserWithProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  // Helper function to extract role from session metadata
  const extractRoleFromSession = (sessionUser: any): 'buyer' | 'seller' | 'admin' => {
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

  // Ultra-aggressive fallback timeout to prevent permanent loading state
  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      console.warn('Auth initialization taking too long, forcing loading to false')
      if (isLoading) {
        setIsLoading(false)
        // If we still don't have a user but have a session, create emergency user
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (session?.user && !user) {
            console.log('Creating emergency user from session after timeout')
            // BULLETPROOF ADMIN ACCOUNT HANDLING
            if (session.user.email === 'evank8029@gmail.com' || session.user.id === 'a041dff2-d833-49e3-bdf3-1a5c02523ce1') {
              console.log('🔒 TIMEOUT ADMIN EMERGENCY - Using hardcoded admin data')
              setUser({
                id: 'a041dff2-d833-49e3-bdf3-1a5c02523ce1',
                email: 'evank8029@gmail.com',
                name: 'Evan Kim',
                role: 'admin',
                plan: 'free',
                status: 'active'
              })
            } else {
              setUser({
                id: session.user.id,
                email: session.user.email || 'user@example.com',
                name: session.user.user_metadata?.name || session.user.user_metadata?.full_name || 'User',
                role: extractRoleFromSession(session.user),
                plan: 'free',
                status: 'active'
              })
            }
          }
        })
      }
    }, 8000) // Reduced to 8 second fallback

    return () => clearTimeout(fallbackTimer)
  }, [])

  // Clear fallback timer when loading completes
  useEffect(() => {
    if (!isLoading) {
      // Loading completed successfully, no need for fallback
    }
  }, [isLoading])

  useEffect(() => {
    let isMounted = true

    // Get initial session with timeout protection
    const initializeAuth = async () => {
      try {
        console.log('Initializing auth...')

        // Simple session check without timeout race condition
        const { data: { session }, error } = await supabase.auth.getSession()

        console.log('Initial session check:', { session: !!session, error })

        if (!isMounted) return

        setSession(session)
        if (session?.user) {
          console.log('Found existing session, fetching profile...')
          await fetchUserProfile(session.user.id)
        } else {
          console.log('No existing session, setting loading to false')
          setIsLoading(false)
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
          // Always fetch profile on sign in to ensure we have the user data
          if (event === 'SIGNED_IN') {
            // Add timeout protection for profile fetching
            Promise.race([
              fetchUserProfile(session.user.id),
              new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Profile fetch timeout')), 5000)
              )
            ]).catch((error) => {
              console.error('Profile fetch failed or timed out:', error)
              // BULLETPROOF ADMIN ACCOUNT HANDLING
              if (session.user.email === 'evank8029@gmail.com' || session.user.id === 'a041dff2-d833-49e3-bdf3-1a5c02523ce1') {
                console.log('🔒 ADMIN ACCOUNT EMERGENCY - Using hardcoded admin data')
                setUser({
                  id: 'a041dff2-d833-49e3-bdf3-1a5c02523ce1',
                  email: 'evank8029@gmail.com',
                  name: 'Evan Kim',
                  role: 'admin',
                  plan: 'free',
                  status: 'active'
                })
              } else {
                // Create emergency fallback user to prevent hanging for non-admin
                setUser({
                  id: session.user.id,
                  email: session.user.email || 'user@example.com',
                  name: session.user.user_metadata?.name || session.user.user_metadata?.full_name || 'User',
                  role: extractRoleFromSession(session.user),
                  plan: 'free',
                  status: 'active'
                })
              }
              setIsLoading(false)
            })
          } else if (event === 'TOKEN_REFRESHED' && !user) {
            // Only fetch if we don't already have user data
            fetchUserProfile(session.user.id).catch((error) => {
              console.error('Profile refresh failed:', error)
            })
          }
        } else {
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

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('Fetching user profile for:', userId)

      // Check if we already have a valid user with the same ID to avoid unnecessary refetches
      if (user && user.id === userId) {
        console.log('User already exists with same ID, skipping fetch')
        setIsLoading(false)
        return
      }

      // Get current session for admin account detection
      const { data: sessionData } = await supabase.auth.getSession()
      const sessionUser = sessionData?.session?.user

      // BULLETPROOF ADMIN ACCOUNT HANDLING - Skip all database queries for admin
      if (sessionUser?.email === 'evank8029@gmail.com' || userId === 'a041dff2-d833-49e3-bdf3-1a5c02523ce1') {
        console.log('🔒 ADMIN ACCOUNT DETECTED - Using hardcoded admin data')
        const adminUser: AuthUser = {
          id: 'a041dff2-d833-49e3-bdf3-1a5c02523ce1',
          email: 'evank8029@gmail.com',
          name: 'Evan Kim',
          role: 'admin',
          plan: 'free',
          status: 'active'
        }
        console.log('✅ Admin user set:', adminUser)
        setUser(adminUser)
        setIsLoading(false)
        return
      }

      // For non-admin users, proceed with normal database queries
      console.log('📋 Regular user - fetching from database...')

      // More generous timeout for database operations
      const withTimeout = <T extends any>(promise: Promise<T>, timeoutMs: number = 10000): Promise<T> => {
        return new Promise((resolve, reject) => {
          const timer = setTimeout(() => {
            console.log(`Database operation timed out after ${timeoutMs}ms`)
            reject(new Error(`Database timeout after ${timeoutMs}ms`))
          }, timeoutMs)

          promise
            .then((result) => {
              clearTimeout(timer)
              resolve(result)
            })
            .catch((error) => {
              clearTimeout(timer)
              reject(error)
            })
        })
      }

      // Try to fetch user data with improved timeout and retry logic
      let userData = null
      let userError = null

      try {
        const userFetchPromise = supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single()

        const result = await withTimeout(userFetchPromise as unknown as Promise<any>, 10000)
        userData = result.data
        userError = result.error

        console.log('User data fetch completed:', { userData: !!userData, userError })
      } catch (fetchError) {
        console.error('User fetch failed with timeout or error:', fetchError)
        userError = fetchError
      }

      // Only create fallback if we really can't get user data AND don't already have a user
      if ((userError || !userData) && !user) {
        console.log('Creating fallback user due to fetch failure and no existing user')
        console.error('User fetch failed:', userError)

        // Create sensible fallback for non-admin users
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

      // Set user data immediately
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

      // Fetch additional profile data in background (completely non-blocking)
      setTimeout(async () => {
        try {
          console.log('Starting background profile fetch...')
          const [profileResult, preferencesResult] = await Promise.allSettled([
            withTimeout(supabase.from('profiles').select('*').eq('user_id', userId).single() as unknown as Promise<any>, 2000),
            withTimeout(supabase.from('preferences').select('*').eq('user_id', userId).single() as unknown as Promise<any>, 2000)
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
            plan: 'free',
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

  const signInWithEmail = async (email: string, password: string) => {
    try {
      console.log('Starting sign-in process for:', email)

      // Call Supabase auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      console.log('Sign-in response:', { data: !!data, error, session: !!data?.session, user: !!data?.user })

      if (error) {
        console.error('Sign-in error:', error)
        return { error: error.message }
      }

      if (data?.user && data?.session) {
        console.log('Sign-in successful - auth state change will handle the rest')
        showNotification('Login successful!', 'success')

        // Let the auth state change handler manage profile fetching
        // Don't wait here - return immediately to prevent hanging
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
      await fetch('/api/auth/signout', { method: 'POST' })
      await supabase.auth.signOut()
      showNotification('Successfully signed out', 'success')
      router.push('/')
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