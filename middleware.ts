import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Redirect homepage to beta signup gate
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/gate', request.url))
  }

  // Public routes (no auth needed)
  const publicRoutes = ['/gate', '/auth', '/auth/reset-password', '/signin', '/signin-test', '/success', '/subscribe', '/terms', '/pricing', '/brokers', '/browse', '/landing']

  // Check if the current path is public (no auth needed)
  const isPublicRoute = publicRoutes.some(route => {
    if (route === '/') {
      return pathname === '/'
    }
    return pathname === route || pathname.startsWith(route + '/')
  })

  // Skip middleware for API routes, static files, and public routes
  if (pathname.startsWith('/api') || pathname.startsWith('/_next') || isPublicRoute) {
    return NextResponse.next()
  }

  // Create Supabase client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          // We can't set cookies in middleware, but this is required for the SSR client
          return undefined
        },
        remove(name: string, options: any) {
          // We can't remove cookies in middleware, but this is required for the SSR client
          return undefined
        },
      },
    }
  )

  // Get the user session
  const { data: { session }, error } = await supabase.auth.getSession()

  // If no session and trying to access protected route, redirect to auth
  if (!session) {
    const redirectUrl = new URL('/auth', request.url)
    redirectUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // SIMPLIFIED MIDDLEWARE - Trust the session, avoid database queries that cause tab switching issues

  // For admin routes, check database for admin role
  if (pathname.startsWith('/admin')) {
    // Hardcoded admin emails - bypass database check for known admins
    const KNOWN_ADMINS = [
      'evank8029@gmail.com',
      'succedence@gmail.com',
      'founder@succedence.com',
      'clydek627@gmail.com'
    ]

    if (KNOWN_ADMINS.includes(session.user.email || '')) {
      console.log('🔒 MIDDLEWARE: Hardcoded admin access granted for:', session.user.email)
      return NextResponse.next()
    }

    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', session.user.id)
        .single()

      if (userError) {
        console.error('❌ MIDDLEWARE: Database error checking admin role:', userError, 'for user:', session.user.email)
        return NextResponse.redirect(new URL('/app', request.url))
      }

      if (!userData || (userData as any).role !== 'admin') {
        console.log('❌ MIDDLEWARE: Non-admin trying to access admin route:', session.user.email, 'role:', (userData as any)?.role)
        return NextResponse.redirect(new URL('/app', request.url))
      }

      console.log('🔒 MIDDLEWARE: Database admin access granted for:', session.user.email)
    } catch (error) {
      console.error('MIDDLEWARE: Exception checking admin role:', error)
      return NextResponse.redirect(new URL('/app', request.url))
    }
  }

  // TRUST THE SESSION - Don't query database on every request
  // This prevents the subscription gate from appearing on tab switches
  console.log('✅ MIDDLEWARE: Valid session found, allowing access to:', pathname)

  // Check if user needs subscription (for non-admin routes)
  // Exempt certain routes from subscription checks
  const subscriptionExemptRoutes = ['/onboarding', '/subscription', '/subscribe', '/profile', '/preferences']
  const isSubscriptionExempt = subscriptionExemptRoutes.some(route => pathname.startsWith(route))

  if (!isSubscriptionExempt && !pathname.startsWith('/admin')) {
    try {
      // Check user's plan and trial status
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('plan, trial_ends_at')
        .eq('id', session.user.id)
        .single()

      if (!userError && userData) {
        const user = userData as any
        const now = new Date()
        const trialEndsAt = user.trial_ends_at ? new Date(user.trial_ends_at) : null

        // Check if user is on free plan
        if (user.plan === 'free') {
          // If they have a trial and it hasn't expired, allow access
          if (trialEndsAt && trialEndsAt > now) {
            console.log('✅ MIDDLEWARE: User has active trial, allowing access')
            return NextResponse.next()
          } else {
            // Trial expired or no trial, redirect to subscription page
            console.log('❌ MIDDLEWARE: User trial expired or no trial, redirecting to subscription')
            return NextResponse.redirect(new URL('/subscription', request.url))
          }
        }
        // If user has a paid plan (starter, professional, enterprise, beta), allow access
        console.log('✅ MIDDLEWARE: User has paid plan, allowing access')
      }
    } catch (error) {
      console.error('MIDDLEWARE: Error checking subscription status:', error)
      // On error, allow access to prevent blocking legitimate users
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}