import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only auth pages are public - everything else requires authentication
  const publicRoutes = ['/auth', '/auth/reset-password']

  // Check if the current path is public (no auth needed)
  const isPublicRoute = publicRoutes.some(route => {
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

  // HARDCODED ADMIN BYPASS - Critical for preventing account switching bugs
  if (session.user.email === 'evank8029@gmail.com' || session.user.id === 'a041dff2-d833-49e3-bdf3-1a5c02523ce1') {
    console.log('🔒 MIDDLEWARE: Admin bypass activated for:', session.user.email)
    return NextResponse.next()
  }

  // For admin routes, do a quick check if needed
  if (pathname.startsWith('/admin')) {
    // Only redirect if definitely not admin - avoid database query
    if (session.user.email !== 'evank8029@gmail.com' && session.user.id !== 'a041dff2-d833-49e3-bdf3-1a5c02523ce1') {
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