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

// GET all public broker profiles
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()

    // Fetch all public broker profiles
    const { data: brokers, error: brokersError } = await supabase
      .from('broker_profiles')
      .select(`
        id,
        display_name,
        headshot_url,
        bio,
        company,
        work_areas,
        specialties,
        years_experience,
        created_at
      `)
      .eq('is_public', 'true')
      .order('created_at', { ascending: false })

    if (brokersError) {
      console.error('Error fetching broker profiles:', brokersError)
      return NextResponse.json(
        { error: 'Failed to fetch broker profiles' },
        { status: 500 }
      )
    }

    // Convert to camelCase for frontend
    const camelCaseBrokers = toCamelCase(brokers)

    return NextResponse.json({ brokers: camelCaseBrokers })

  } catch (error) {
    console.error('Error in GET brokers:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
