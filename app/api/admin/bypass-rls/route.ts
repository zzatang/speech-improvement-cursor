import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';

// Prevent static generation - this API needs to be dynamic
export const dynamic = 'force-dynamic';

// Create a Supabase client with the service role key which bypasses RLS
const createServiceRoleClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing environment variables for service role client');
    throw new Error('Missing Supabase environment variables for service role');
  }
  
  console.log('Creating service role client with URL:', supabaseUrl);
  return createClient(supabaseUrl, supabaseServiceKey);
};

export async function GET(request: Request) {
  try {
    // Verify the user is authenticated
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const table = searchParams.get('table');
    const targetUserId = searchParams.get('userId') || userId;
    
    if (!table) {
      return NextResponse.json({ error: 'Missing table parameter' }, { status: 400 });
    }
    
    console.log(`[Admin API] Bypassing RLS for table ${table}, user ${targetUserId}`);
    
    // Create a service role client that can bypass RLS
    const serviceClient = createServiceRoleClient();
    
    // This query will work regardless of RLS policies because we're using the service role
    let query = serviceClient.from(table).select('*');
    
    // If we're querying user-specific data, add the filter
    if (targetUserId && ['user_profiles', 'user_progress', 'user_achievements'].includes(table)) {
      query = query.eq('user_id', targetUserId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error(`[Admin API] Error querying ${table}:`, error);
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      }, { status: 500 });
    }
    
    console.log(`[Admin API] Successfully retrieved ${data?.length || 0} records from ${table}`);
    
    return NextResponse.json({
      success: true,
      table,
      userId: targetUserId,
      records: data,
      count: data?.length || 0
    });
    
  } catch (error) {
    console.error('[Admin API] Unhandled error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 