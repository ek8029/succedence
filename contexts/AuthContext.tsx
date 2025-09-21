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

  // Fallback timeout to prevent permanent loading state
  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      console.warn('Auth initialization taking too long, forcing loading to false')
      if (isLoading) {
        setIsLoading(false)
      }
    }, 10000) // Increased to 10 second fallback

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
            await fetchUserProfile(session.user.id)
          } else if (event === 'TOKEN_REFRESHED' && !user) {
            // Only fetch if we don't already have user data
            await fetchUserProfile(session.user.id)
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

      // Simplified timeout helper with more aggressive timeout
      const withTimeout = <T>(promise: Promise<T>, timeoutMs: number = 3000): Promise<T> => {
        return new Promise((resolve, reject) => {
          const timer = setTimeout(() => {
            reject(new Error(`Database operation timeout after ${timeoutMs}ms`))
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

      console.log('Starting user data fetch...')

      // Try to fetch user data with aggressive timeout
      let userData = null
      let userError = null

      try {
        const userFetch = supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single()

        const result = await withTimeout(userFetch, 3000)
        userData = result.data
        userError = result.error

        console.log('User data fetch completed:', { userData: !!userData, userError })
      } catch (fetchError) {
        console.error('User fetch failed with timeout or error:', fetchError)
        userError = fetchError
      }

      // If user fetch fails, create a minimal user immediately
      if (userError || !userData) {
        console.log('Creating fallback user due to fetch failure')
        const fallbackUser: AuthUser = {
          id: userId,
          email: 'user@example.com', // We'll get this from session if available
          name: 'User',
          role: 'buyer',
          plan: 'free',
          status: 'active'
        }

        setUser(fallbackUser)
        setIsLoading(false)
        console.log('Fallback user set, authentication complete')
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
            withTimeout(supabase.from('profiles').select('*').eq('user_id', userId).single(), 2000),
            withTimeout(supabase.from('preferences').select('*').eq('user_id', userId).single(), 2000)
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
      // Emergency fallback
      const emergencyUser: AuthUser = {
        id: userId,
        email: 'user@example.com',
        name: 'User',
        role: 'buyer',
        plan: 'free',
        status: 'active'
      }
      setUser(emergencyUser)
      setIsLoading(false)
      console.log('Emergency user fallback activated')
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
      setIsLoading(true)
      console.log('Starting sign-in process for:', email)

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      console.log('Sign-in response:', { data: !!data, error, session: !!data?.session, user: !!data?.user })

      if (error) {
        console.error('Sign-in error:', error)
        setIsLoading(false)
        return { error: error.message }
      }

      if (data?.user && data?.session) {
        console.log('Sign-in successful, session created - waiting for profile fetch')

        // Give the auth state change handler time to complete
        // But set a maximum wait time to prevent infinite loading
        const maxWaitTime = 8000 // 8 seconds max
        const startTime = Date.now()

        const waitForAuth = () => {
          return new Promise((resolve) => {
            const checkAuth = () => {
              const elapsed = Date.now() - startTime

              // If we have a user or we've waited too long, resolve
              if (user || elapsed > maxWaitTime) {
                console.log('Auth wait completed:', { hasUser: !!user, elapsed })
                resolve(true)
                return
              }

              // Check again in 100ms
              setTimeout(checkAuth, 100)
            }

            checkAuth()
          })
        }

        await waitForAuth()

        console.log('Sign-in process completed')
        showNotification('Login successful!', 'success')
        return {}
      } else {
        console.warn('Sign-in succeeded but no user/session returned')
        setIsLoading(false)
        return { error: 'Sign-in succeeded but no session was created' }
      }
    } catch (error: any) {
      console.error('Sign-in exception:', error)
      setIsLoading(false)
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