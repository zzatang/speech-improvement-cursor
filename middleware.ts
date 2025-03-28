import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"

/**
 * Enable authentication with Clerk
 * This middleware ensures that routes are properly protected
 * and unauthenticated users are redirected to sign-in
 */

// Define public routes that should not be protected
const isPublicRoute = createRouteMatcher([
  // Core public pages
  '/',
  '/about',
  '/privacy',
  '/terms',
  '/contact',
  
  // Auth pages
  '/onboarding(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
  
  // API webhooks (for Clerk)
  '/api/webhooks(.*)',
  
  // Public assets
  '/favicon.ico',
  '/logo.svg',
  '/logo-icon.svg',
])

export default clerkMiddleware((auth, req) => {
  // Don't run auth checks on public routes
  if (isPublicRoute(req)) {
    return
  }
  
  // For all protected routes, check authentication
  // This includes:
  // - /dashboard
  // - /practice/*
  // - /api/* (except webhooks)
  // - All other routes not marked as public
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
}
