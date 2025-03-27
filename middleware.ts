import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"

/**
 * Enable authentication with Clerk
 */

// Define public routes that should not be protected
const isPublicRoute = createRouteMatcher([
  '/',
  '/onboarding',
  '/onboarding/(.*)',
  '/sign-in',
  '/sign-in/(.*)',
  '/sign-up',
  '/sign-up/(.*)'
])

export default clerkMiddleware((auth, req) => {
  // Don't run auth checks on public routes
  if (isPublicRoute(req)) {
    return
  }
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
}
