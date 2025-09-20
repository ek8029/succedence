import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { z } from 'zod'

const createProfileSchema = z.object({
  userId: z.string().uuid(),
  email: z.string().email(),
  name: z.string().optional(),
  role: z.enum(['buyer', 'seller', 'admin']).optional()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, email, name, role } = createProfileSchema.parse(body)

    // Use service client to bypass RLS for user creation
    const supabase = createServiceClient()

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single()

    if (existingUser) {
      return NextResponse.json({ message: 'User already exists' })
    }

    // Create user record
    const { error: userError } = await supabase
      .from('users')
      .insert({
        id: userId,
        email,
        name: name || email.split('@')[0], // Default name to email prefix
        role: (role as any) || 'buyer',
        plan: 'free',
        status: 'active'
      })

    if (userError) {
      console.error('Error creating user:', userError)
      return NextResponse.json(
        { error: 'Failed to create user record' },
        { status: 500 }
      )
    }

    // Create profile record
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        userId: userId,
        updatedAt: new Date().toISOString()
      })

    if (profileError) {
      console.error('Error creating profile:', profileError)
      // Don't fail if profile creation fails, user record is more important
    }

    // Create default preferences
    const { error: preferencesError } = await supabase
      .from('preferences')
      .insert({
        userId: userId,
        alertFrequency: 'weekly',
        updatedAt: new Date().toISOString()
      })

    if (preferencesError) {
      console.error('Error creating preferences:', preferencesError)
      // Don't fail if preferences creation fails
    }

    return NextResponse.json({
      message: 'User profile created successfully',
      userId
    })

  } catch (error) {
    console.error('Error in create-profile:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}