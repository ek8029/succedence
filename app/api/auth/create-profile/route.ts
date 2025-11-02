import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

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

    // Check if user already exists by EMAIL (not userId)
    const { data: existingUser } = await (supabase
      .from('users') as any)
      .select('*')
      .eq('email', email)
      .single()

    if (existingUser) {
      // User exists - update their auth ID if it's different
      if (existingUser.id !== userId) {
        await (supabase
          .from('users') as any)
          .update({ id: userId })
          .eq('email', email)
      }
      return NextResponse.json({
        message: 'User already exists',
        preservedRole: existingUser.role,
        preservedPlan: existingUser.plan
      })
    }

    const userRole = (role as any) || 'buyer'

    // Update user metadata to include role for session access
    const { error: metadataError } = await supabase.auth.admin.updateUserById(userId, {
      user_metadata: { role: userRole, name: name || email.split('@')[0] }
    })

    if (metadataError) {
      console.error('Error updating user metadata:', metadataError)
      // Continue anyway - metadata is not critical for basic functionality
    }

    // Calculate trial end date (3 days from now)
    const trialEndsAt = new Date()
    trialEndsAt.setDate(trialEndsAt.getDate() + 3)

    // Create user record with free trial
    const { error: userError } = await (supabase
      .from('users') as any)
      .insert({
        id: userId,
        email,
        name: name || email.split('@')[0], // Default name to email prefix
        role: userRole,
        plan: 'free',
        status: 'active',
        trial_ends_at: trialEndsAt.toISOString()
      })

    if (userError) {
      console.error('Error creating user:', userError)
      return NextResponse.json(
        { error: 'Failed to create user record' },
        { status: 500 }
      )
    }

    // Create profile record
    const { error: profileError } = await (supabase
      .from('profiles') as any)
      .insert({
        user_id: userId,
        updated_at: new Date().toISOString()
      })

    if (profileError) {
      console.error('Error creating profile:', profileError)
      // Don't fail if profile creation fails, user record is more important
    }

    // Create default preferences
    const { error: preferencesError } = await (supabase
      .from('preferences') as any)
      .insert({
        user_id: userId,
        alert_frequency: 'weekly',
        updated_at: new Date().toISOString()
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
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}