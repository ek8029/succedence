import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const preferencesSchema = z.object({
  industries: z.array(z.string()).optional(),
  states: z.array(z.string()).optional(),
  minRevenue: z.number().optional(),
  minMetric: z.number().optional(),
  metricType: z.enum(['EBITDA', 'SDE']).optional(),
  ownerHoursMax: z.number().optional(),
  priceMax: z.number().optional(),
  alertFrequency: z.enum(['never', 'instant', 'daily', 'weekly']).optional(),
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
      .eq('userId', user.id)
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
    const { data, error } = await supabase
      .from('preferences')
      .upsert({
        userId: user.id,
        ...preferencesData,
        updatedAt: new Date().toISOString()
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