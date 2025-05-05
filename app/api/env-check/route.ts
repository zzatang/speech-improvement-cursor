import { NextRequest, NextResponse } from 'next/server';
import { checkEnvironmentVariables } from '@/lib/vercel/environment-check';

// This route checks if all environment variables are properly configured
// Only accessible in development or by admin token in production
export async function GET(request: NextRequest) {
  // In production, require admin token
  if (process.env.NODE_ENV === 'production') {
    // Check for admin token in headers
    const adminToken = request.headers.get('x-admin-token');
    const validToken = process.env.ADMIN_SECRET_TOKEN;
    
    if (!adminToken || adminToken !== validToken) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }
  }
  
  // Check environment variables
  const result = checkEnvironmentVariables();
  
  // In production, don't expose exact environment variable names that are missing
  const isSafe = process.env.NODE_ENV !== 'production';
  
  return NextResponse.json({
    valid: result.isValid,
    // Only include detailed info in development
    ...(isSafe && {
      missingVariables: result.missingVariables,
      invalidVariables: result.invalidVariables,
      messages: result.messages
    }),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV || 'local'
  });
} 