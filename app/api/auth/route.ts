import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const { userId, sessionId } = await auth();

  if (!userId) {
    return new NextResponse(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401 }
    );
  }

  return NextResponse.json({
    userId,
    sessionId,
    authenticated: true,
  });
}

export async function POST(request: Request) {
  const { userId, sessionId } = await auth();

  if (!userId) {
    return new NextResponse(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    
    // Handle any additional auth-related operations here
    // For example, syncing with Supabase user profile

    return NextResponse.json({
      userId,
      sessionId,
      authenticated: true,
      data: body
    });
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ error: 'Invalid request body' }),
      { status: 400 }
    );
  }
} 