import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Enable authentication with Clerk
 * This middleware ensures that routes are properly protected
 * and unauthenticated users are redirected to sign-in
 */

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: any) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Define public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/about',
    '/privacy',
    '/terms',
    '/contact',
    '/auth/login',
    '/auth/signup',
    '/auth/callback',
    '/onboarding',
    '/api/webhooks',
    '/favicon.ico',
    '/logo.svg',
    '/logo-icon.svg',
  ]

  // Define protected routes that require authentication
  const protectedRoutes = [
    '/dashboard',
    '/profile',
    '/practice',
    '/admin',
    '/history_test',
    '/api/speech',
    '/api/user',
    '/api/practice',
  ]

  const { pathname } = request.nextUrl

  // Check if the current path is public
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  )

  // Check if the current path is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  )

  if (isPublicRoute) {
    return response
  }

  if (isProtectedRoute) {
    const { data: { user }, error } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.redirect(new URL('/auth/login?message=Please sign in to continue', request.url))
    }
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
}
