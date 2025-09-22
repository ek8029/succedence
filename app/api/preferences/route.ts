import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const preferencesSchema = z.object({
  industries: z.array(z.string()).optional(),
  states: z.array(z.string()).optional(),
  min_revenue: z.number().optional(),
  min_metric: z.number().optional(),
  metric_type: z.enum(['revenue', 'ebitda', 'gross_profit', 'net_income']).optional(),
  owner_hours_max: z.number().optional(),
  price_max: z.number().optional(),
  alert_frequency: z.enum(['off', 'instant', 'daily', 'weekly']).optional(),
  keywords: z.array(z.string()).optional()
})

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch user preferences
    const { data: preferences, error: preferencesError } = await supabase
      .from('preferences')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (preferencesError && preferencesError.code !== 'PGRST116') {
      console.error('Error fetching preferences:', preferencesError)
      return NextResponse.json(
        { error: 'Failed to fetch preferences' },
        { status: 500 }
      )
    }

    return NextResponse.json(preferences || {})

  } catch (error) {
    console.error('Error in GET preferences:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const preferencesData = preferencesSchema.parse(body)

    // Upsert preferences
    const { data, error } = await (supabase
      .from('preferences') as any)
      .upsert({
        user_id: user.id,
        ...preferencesData,
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Error updating preferences:', error)
      return NextResponse.json(
        { error: 'Failed to update preferences' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Preferences updated successfully',
      preferences: data
    })

  } catch (error) {
    console.error('Error in POST preferences:', error)

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