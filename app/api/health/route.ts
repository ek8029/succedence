import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()

    // Test auth session
    let authHealthy = false
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      authHealthy = !error
    } catch (error) {
      console.error('Auth health check failed:', error)
    }

    // Test database connection
    let dbHealthy = false
    try {
      const { data, error } = await supabase
        .from('users')
        .select('count')
        .limit(1)
        .single()

      dbHealthy = !error
    } catch (error) {
      console.error('Database health check failed:', error)
    }

    const isHealthy = authHealthy && dbHealthy

    return NextResponse.json({
      supabase: dbHealthy,
      auth: authHealthy,
      healthy: isHealthy,
      timestamp: new Date().toISOString()
    }, {
      status: isHealthy ? 200 : 500
    })

  } catch (error) {
    console.error('Health check error:', error)
    return NextResponse.json({
      supabase: false,
      auth: false,
      healthy: false,
      error: 'Health check failed',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}