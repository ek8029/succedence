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
      setIsLoading(false)
    }, 15000) // 15 second fallback

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
        // Add timeout to prevent hanging indefinitely
        const sessionPromise = supabase.auth.getSession()
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Auth initialization timeout')), 10000)
        )

        const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise]) as any

        if (!isMounted) return

        setSession(session)
        if (session?.user) {
          await fetchUserProfile(session.user.id)
        } else {
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

        setSession(session)
        if (session?.user) {
          // Only fetch profile if it's not already being fetched
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
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
      setIsLoading(true)

      // Add timeout protection for database calls
      const fetchPromise = Promise.all([
        supabase.from('users').select('*').eq('id', userId).single(),
        supabase.from('profiles').select('*').eq('user_id', userId).single(),
        supabase.from('preferences').select('*').eq('user_id', userId).single()
      ])

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Profile fetch timeout')), 8000)
      )

      const [userResult, profileResult, preferencesResult] = await Promise.race([fetchPromise, timeoutPromise]) as any

      const { data: userData, error: userError } = userResult
      const { data: profileData } = profileResult
      const { data: preferencesData } = preferencesResult

      if (userError) {
        console.error('Error fetching user:', userError)
        setUser(null)
        setUserProfile(null)
        setIsLoading(false)
        return
      }

      const authUser: AuthUser = {
        id: (userData as any).id,
        email: (userData as any).email,
        name: (userData as any).name,
        role: (userData as any).role,
        plan: (userData as any).plan,
        status: (userData as any).status,
      }

      const userWithProfile: UserWithProfile = {
        ...(userData as any),
        profile: profileData,
        preferences: preferencesData,
      }

      setUser(authUser)
      setUserProfile(userWithProfile)
    } catch (error) {
      console.error('Error in fetchUserProfile:', error)
      setUser(null)
      setUserProfile(null)
    } finally {
      setIsLoading(false)
    }
  }

  const signUp = async (email: string, password: string, userData: { name: string; role: string }) => {
    try {
      setIsLoading(true)

      // Sign up with Supabase Auth
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (authError) {
        return { error: authError.message }
      }

      if (data.user) {
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

          if (!response.ok) {
            const errorData = await response.json()
            return { error: errorData.error || 'Failed to create user profile' }
          }
        } catch (error) {
          console.error('Error creating user profile:', error)
          return { error: 'Failed to create user profile' }
        }

        showNotification('Account created successfully! Please check your email to verify your account.', 'success')
      }

      return {}
    } catch (error: any) {
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
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { error: error.message }
      }

      showNotification('Login successful!', 'success')
      return {}
    } catch (error: any) {
      return { error: error.message }
    } finally {
      setIsLoading(false)
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