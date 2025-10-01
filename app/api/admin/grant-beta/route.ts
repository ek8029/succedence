import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const grantBetaSchema = z.object({
  email: z.string().email()
})

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()

    // Get current user and verify admin role
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userError || (userData as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { email } = grantBetaSchema.parse(body)

    // Find the user by email
    const { data: targetUser, error: findError } = await supabase
      .from('users')
      .select('id, plan')
      .eq('email', email)
      .single()

    if (findError || !targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Update user plan to beta
    const { error: updateError } = await supabase
      .from('users')
      .update({ plan: 'beta' })
      .eq('id', targetUser.id)

    if (updateError) {
      console.error('Error granting beta access:', updateError)
      return NextResponse.json(
        { error: 'Failed to grant beta access' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Beta access granted successfully',
      userId: targetUser.id
    })

  } catch (error) {
    console.error('Error in grant-beta POST:', error)

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
