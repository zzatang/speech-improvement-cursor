import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import { NextResponse } from "next/server";

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

// Define protected routes that require authentication
const isProtectedRoute = createRouteMatcher([
  // Dashboard and user-specific pages
  '/dashboard(.*)',
  '/profile(.*)',
  
  // Practice areas
  '/practice(.*)',
  
  // Protected API routes - individually listed to avoid regex issues
  '/api/speech(.*)',
  '/api/user(.*)',
  '/api/practice(.*)'
])

export default clerkMiddleware(async (auth, req) => {
  // Don't run auth checks on public routes
  if (isPublicRoute(req)) {
    return;
  }
  
  // For all protected routes, check authentication
  if (isProtectedRoute(req)) {
    // Use the protect method to enforce authentication
    // This will redirect to sign-in if user is not authenticated
    await auth.protect();
  }
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
}
