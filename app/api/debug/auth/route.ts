import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = createClient()

  try {
    // Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    // Try to get user from database if we have a session
    let dbUser = null
    let dbError = null

    if (session?.user?.id) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single()

      dbUser = data
      dbError = error
    }

    return NextResponse.json({
      session: {
        exists: !!session,
        userId: session?.user?.id,
        email: session?.user?.email,
        error: sessionError
      },
      authUser: {
        exists: !!user,
        userId: user?.id,
        email: user?.email,
        error: userError
      },
      dbUser: {
        exists: !!dbUser,
        data: dbUser,
        error: dbError
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}