import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// Helper to convert snake_case to camelCase
function toCamelCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(toCamelCase)
  } else if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((result, key) => {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
      result[camelKey] = toCamelCase(obj[key])
      return result
    }, {} as any)
  }
  return obj
}

// GET public broker profile (no auth required)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()

    // Fetch broker profile with basic user info
    const { data: broker, error: brokerError } = await supabase
      .from('broker_profiles')
      .select(`
        id,
        display_name,
        headshot_url,
        bio,
        phone,
        email,
        company,
        license_number,
        work_areas,
        specialties,
        years_experience,
        website_url,
        linkedin_url,
        is_public,
        custom_sections,
        created_at
      `)
      .eq('id', params.id)
      .eq('is_public', 'true')
      .single()

    if (brokerError) {
      console.error('Error fetching broker profile:', brokerError)
      return NextResponse.json(
        { error: 'Broker profile not found or not public' },
        { status: 404 }
      )
    }

    // Convert to camelCase for frontend
    const camelCaseBroker = toCamelCase(broker)

    return NextResponse.json({ broker: camelCaseBroker })

  } catch (error) {
    console.error('Error in GET public broker:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
