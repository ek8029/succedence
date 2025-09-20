'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

// Create Supabase client directly without any context
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default function SignInTestPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    console.log('🔥 FORM SUBMITTED')
    console.log('Email:', email)
    console.log('Environment:', {
      url: supabaseUrl,
      keyStart: supabaseAnonKey?.substring(0, 20)
    })

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      console.log('🔐 Attempting signin...')

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      })

      console.log('🔐 Result:', { data, error })

      if (error) {
        throw error
      }

      setSuccess('Login successful!')
      console.log('✅ Redirecting...')

      // Use window.location instead of router
      setTimeout(() => {
        window.location.href = '/profile'
      }, 1000)

    } catch (err: any) {
      console.error('❌ Error:', err)
      setError(err.message || 'Authentication failed')
    } finally {
      console.log('🔄 Setting loading to false')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-bold text-white hover:text-blue-300 transition-colors">
            DealSense TEST
          </Link>
          <h2 className="mt-4 text-2xl text-white">
            Sign In Test Page
          </h2>
          <p className="mt-2 text-gray-300">
            Testing authentication without context
          </p>
        </div>

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
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
              {loading ? 'Loading...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <Link href="/signin" className="text-gray-400 hover:text-gray-300 text-sm transition-colors">
              ← Back to Regular Signin
            </Link>
          </div>

          <div className="mt-4 text-center">
            <p className="text-xs text-gray-400">
              Current loading state: {loading ? 'TRUE' : 'FALSE'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}