'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

const supabase = createClient()

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    console.log('🔥 SUBMIT HANDLER CALLED')
    console.log('Current loading state:', loading)
    console.log('Environment check:', {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      anonKeyStart: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20)
    })

    setError('')
    setSuccess('')
    setLoading(true)

    console.log('✅ Set loading to true')

    const fd = new FormData(e.currentTarget)
    const emailValue = String(fd.get('email'))
    const passwordValue = String(fd.get('password'))

    console.log('📧 Form data:', { email: emailValue, hasPassword: !!passwordValue })

    try {
      if (isSignUp) {
        console.log('🆕 Attempting signup...')
        const { data, error } = await supabase.auth.signUp({
          email: emailValue,
          password: passwordValue
        })

        console.log('🆕 Signup result:', { data, error })

        if (error) throw error

        if (data.user && !data.session) {
          console.log('📧 Email confirmation required')
          setSuccess('Please check your email to confirm your account!')
        } else if (data.user) {
          console.log('👤 Creating user profile...')
          // Create profile and redirect
          await createUserProfile(data.user.id, emailValue)
          console.log('✅ Profile created, redirecting...')
          window.location.href = '/profile'
        }
      } else {
        console.log('🔐 Attempting signin...')
        const { error } = await supabase.auth.signInWithPassword({
          email: emailValue,
          password: passwordValue
        })

        console.log('🔐 Signin result:', { error })

        if (error) throw error
        console.log('✅ Signin successful, redirecting...')
        window.location.href = '/profile'
      }
    } catch (err: any) {
      console.error('❌ Auth error:', err)
      setError(err.message || 'Authentication failed')
    } finally {
      console.log('🔄 Setting loading to false')
      setLoading(false)
    }
  }

  const createUserProfile = async (userId: string, email: string) => {
    const response = await fetch('/api/auth/create-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        email,
        name: email.split('@')[0],
        role: 'buyer'
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to create user profile')
    }

    return response.json()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-bold text-white hover:text-blue-300 transition-colors">
            DealSense
          </Link>
          <h2 className="mt-4 text-2xl text-white">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className="mt-2 text-gray-300">
            {isSignUp ? 'Sign up to start browsing deals' : 'Sign in to your account'}
          </p>
        </div>

        {/* Form */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg text-green-200 text-sm">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-200 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              {loading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign In')}
            </button>
          </form>

          {/* Toggle Sign Up/Sign In */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp)
                setError('')
                setSuccess('')
                setLoading(false)
              }}
              className="text-blue-300 hover:text-blue-200 text-sm transition-colors"
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>

          {/* Back to Home */}
          <div className="mt-4 text-center">
            <Link href="/" className="text-gray-400 hover:text-gray-300 text-sm transition-colors">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}