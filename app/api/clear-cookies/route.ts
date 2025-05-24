import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.json({ success: true, message: 'Cookies cleared' });
    
    // List of Clerk cookies to clear
    const clerkCookies = [
      '__clerk_db_jwt_fWQJJB9b',
      '__refresh_fWQJJB9b',
      '__session_fWQJJB9b',
      '__client_uat_fWQJJB9b',
      '__clerk_db_jwt__rBnQI7Q',
      '__client_uat__rBnQI7Q',
      '__clerk_db_jwt_rwlnoXkQ',
      '__refresh_rwlnoXkQ',
      '__client_uat_rwlnoXkQ',
      '__session_rwlnoXkQ',
      '__clerk_db_jwt_ZUtRnOLQ',
      '__client_uat_ZUtRnOLQ',
      '__clerk_db_jwt_XqWQ33b9',
      '__clerk_db_jwt_twOts1ft',
      '__client_uat_twOts1ft',
      '__clerk_db_jwt',
      '__refresh_XqWQ33b9',
      '__session',
      '__session_XqWQ33b9',
      '__client_uat_XqWQ33b9',
      '__client_uat'
    ];
    
    // Clear each cookie
    clerkCookies.forEach(cookieName => {
      response.cookies.set(cookieName, '', {
        expires: new Date(0),
        path: '/',
        httpOnly: false
      });
    });
    
    return response;
  } catch (error) {
    console.error('Error clearing cookies:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to clear cookies' },
      { status: 500 }
    );
  }
} 