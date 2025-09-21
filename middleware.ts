import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protected routes that require authentication
  const protectedRoutes = ['/profile', '/preferences', '/listings/new', '/admin']

  // Check if the current path is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

  if (!isProtectedRoute) {
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

  // For admin routes, check if user is admin
  if (pathname.startsWith('/admin')) {
    try {
      // Get user data from database to check role
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', session.user.id)
        .single()

      if (userError || (userData as any)?.role !== 'admin') {
        // Redirect non-admin users to home
        return NextResponse.redirect(new URL('/', request.url))
      }
    } catch (error) {
      console.error('Error checking user role:', error)
      return NextResponse.redirect(new URL('/', request.url))
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