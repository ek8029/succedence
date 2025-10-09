import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if gate password has been entered
  const gateAccess = request.cookies.get('gate_access')?.value

  // Allow gate page and its API without gate check
  if (pathname === '/gate' || pathname === '/api/gate') {
    return NextResponse.next()
  }

  // If no gate access, redirect to gate page
  if (!gateAccess) {
    // Skip for static files
    if (pathname.startsWith('/_next')) {
      return NextResponse.next()
    }
    return NextResponse.redirect(new URL('/gate', request.url))
  }

  // Public routes (no auth needed after gate)
  const publicRoutes = ['/', '/auth', '/auth/reset-password', '/signin', '/signin-test', '/success', '/subscribe', '/terms']

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
    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', session.user.id)
        .single()

      if (userError || !userData || (userData as any).role !== 'admin') {
        console.log('❌ MIDDLEWARE: Non-admin trying to access admin route:', session.user.email)
        return NextResponse.redirect(new URL('/app', request.url))
      }

      console.log('🔒 MIDDLEWARE: Admin access granted for:', session.user.email)
    } catch (error) {
      console.error('MIDDLEWARE: Error checking admin role:', error)
      return NextResponse.redirect(new URL('/app', request.url))
    }
  }

  // TRUST THE SESSION - Don't query database on every request
  // This prevents the subscription gate from appearing on tab switches
  console.log('✅ MIDDLEWARE: Valid session found, allowing access to:', pathname)

  // Skip subscription checks for now to prevent tab switching issues
  // TODO: Move subscription enforcement to specific pages/API routes instead of middleware

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