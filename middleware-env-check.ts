import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { checkEnvironmentVariables } from '@/lib/vercel/environment-check';

// This middleware runs on the server only
export function middleware(request: NextRequest) {
  // Skip for /_next/* requests (static assets)
  if (request.nextUrl.pathname.startsWith('/_next/')) {
    return NextResponse.next();
  }

  // Check environment variables only in production
  if (process.env.NODE_ENV === 'production' && process.env.VERCEL_ENV === 'production') {
    const result = checkEnvironmentVariables();
    
    // If we have missing environment variables, redirect to an error page in production
    if (!result.isValid) {
      // Prevent redirect loop
      if (request.nextUrl.pathname === '/api/env-error') {
        return NextResponse.next();
      }
      
      console.error('Environment configuration issues detected in production:');
      result.messages.forEach(msg => console.error(`  - ${msg}`));
      
      if (request.nextUrl.pathname.startsWith('/api/')) {
        // For API routes, return a JSON error
        return new NextResponse(
          JSON.stringify({ 
            error: 'Server configuration error',
            message: 'The application is missing required environment variables.'
          }),
          { 
            status: 500,
            headers: { 'content-type': 'application/json' }
          }
        );
      }
      
      // For non-API routes, redirect to an error page
      return NextResponse.redirect(new URL('/env-error', request.url));
    }
  }
  
  return NextResponse.next();
}

// Run middleware on all paths except static assets
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images/* (image files in public directory)
     */
    '/((?!_next/static|_next/image|favicon.ico|images/).*)',
  ],
}; 