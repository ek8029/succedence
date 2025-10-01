import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const revokeBetaSchema = z.object({
  userId: z.string()
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
    const { userId } = revokeBetaSchema.parse(body)

    // Update user plan back to free
    const { error: updateError } = await supabase
      .from('users')
      .update({ plan: 'free' })
      .eq('id', userId)

    if (updateError) {
      console.error('Error revoking beta access:', updateError)
      return NextResponse.json(
        { error: 'Failed to revoke beta access' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Beta access revoked successfully',
      userId
    })

  } catch (error) {
    console.error('Error in revoke-beta POST:', error)

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
