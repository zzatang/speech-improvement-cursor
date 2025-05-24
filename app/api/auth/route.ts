import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return new NextResponse(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401 }
    );
  }

  return NextResponse.json({
    userId: user.id,
    email: user.email,
    authenticated: true,
  });
}

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
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
      userId: user.id,
      email: user.email,
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