import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const betaSignupSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  company: z.string().optional(),
  role: z.enum(['buyer', 'seller', 'broker']),
  interests: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const body = await request.json()

    // Validate the request data
    const signupData = betaSignupSchema.parse(body)

    // Insert into beta_signups table
    const { data, error } = await supabase
      .from('beta_signups')
      .insert({
        name: signupData.name,
        email: signupData.email,
        company: signupData.company || null,
        role: signupData.role,
        interests: signupData.interests || null,
      })
      .select()
      .single()

    if (error) {
      // Check for duplicate email
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'This email is already registered for beta access' },
          { status: 409 }
        )
      }

      console.error('Error creating beta signup:', error)
      return NextResponse.json(
        { error: 'Failed to submit beta signup' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully signed up for beta access',
      data
    })

  } catch (error) {
    console.error('Error in POST beta-signup:', error)

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
