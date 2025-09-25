import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/auth', '/signin', '/signin-test', '/success', '/subscribe', '/terms']

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

  // HARDCODED ADMIN BYPASS - Critical for preventing account switching bugs
  if (session.user.email === 'evank8029@gmail.com' || session.user.id === 'a041dff2-d833-49e3-bdf3-1a5c02523ce1') {
    console.log('🔒 MIDDLEWARE: Admin bypass activated for:', session.user.email)
    return NextResponse.next()
  }

  // Get user data from database to check role and plan
  let userData = null
  let userError = null

  try {
    const result = await supabase
      .from('users')
      .select('role, plan')
      .eq('id', session.user.id)
      .single()

    userData = result.data
    userError = result.error

    if (userError) {
      console.error('Error fetching user data:', userError)
      // For non-admin users, if database fails, redirect to auth
      return NextResponse.redirect(new URL('/auth', request.url))
    }

    const userRole = (userData as any)?.role
    const userPlan = (userData as any)?.plan

    // Admin users bypass all restrictions (secondary check)
    if (userRole === 'admin') {
      console.log('🔒 MIDDLEWARE: Database admin role detected for:', session.user.email)
      return NextResponse.next()
    }

    // For admin routes, check if user is admin
    if (pathname.startsWith('/admin')) {
      // Redirect non-admin users to app
      return NextResponse.redirect(new URL('/app', request.url))
    }

    // SaaS Paywall: All protected routes require paid subscription
    // Users must have a PAID plan to access the application (no free tier)
    console.log('🔍 MIDDLEWARE: Checking subscription for:', session.user.email, 'Plan:', userPlan, 'Role:', userRole)

    if (!userPlan || userPlan === null || userPlan === 'free') {
      console.log('⚠️ MIDDLEWARE: User lacks paid subscription, redirecting to subscribe page')
      // Redirect users without subscription or with expired free plan to subscribe page
      const redirectUrl = new URL('/subscribe', request.url)
      redirectUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(redirectUrl)
    }

    console.log('✅ MIDDLEWARE: User has valid subscription, allowing access to:', pathname)

    // Allow access to browse and listings pages for paid subscribers
    // (Remove the redirect to /app - let users access /browse and /listings directly)

  } catch (error) {
    console.error('Error in middleware:', error)
    return NextResponse.redirect(new URL('/auth', request.url))
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