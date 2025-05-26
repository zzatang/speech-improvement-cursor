import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Prevent static generation - this API needs to be dynamic
export const dynamic = 'force-dynamic';

// Create admin client with service role key
function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(supabaseUrl, supabaseServiceKey);
}

export async function GET(request: NextRequest) {
  try {
    // Get the user from regular Supabase client
    const { createClient: createRegularClient } = await import('@/utils/supabase/server');
    const supabase = createRegularClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin (you may want to add admin role checking here)
    // For now, we'll allow any authenticated user to test the connection
    
    const adminClient = createAdminClient();
    
    // Test query with RLS bypassed
    const { data, error } = await adminClient
      .from('user_progress')
      .select('*')
      .limit(5);

    if (error) {
      return NextResponse.json({ 
        error: 'Database query failed', 
        details: error.message 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      data,
      message: 'RLS bypass working correctly'
    });
  } catch (error) {
    console.error('Admin bypass error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
