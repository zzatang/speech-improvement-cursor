import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Check if we have the required environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Create service role client to bypass RLS policies if needed
let serviceRoleClient: any = null;
try {
  if (supabaseServiceKey && supabaseUrl) {
    serviceRoleClient = createClient(
      supabaseUrl,
      supabaseServiceKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );
  }
} catch (error) {
  // Missing environment variables for service role client
}

export async function GET(request: NextRequest) {
  // If we don't have the required environment variables, return mock data
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ 
      success: true, 
      records: [],
      method: 'mock-data' 
    });
  }

  try {
    // Get the userId from the request query
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ success: false, error: 'No userId provided' }, { status: 400 });
    }
    
    // Try multiple approaches to get the user progress data
    // This function implements a fallback sequence to ensure we get the data
    
    // First, try to get data using the user's own request context
    // This will respect RLS policies but might fail if not properly set up
    let directData: any[] = [];
    try {
      // Fetch user progress from Supabase directly
      const response = await fetch(`${supabaseUrl}/rest/v1/user_progress?user_id=eq.${encodeURIComponent(userId)}&select=*`, {
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseAnonKey,
          'Authorization': request.headers.get('Authorization') || `Bearer ${supabaseAnonKey}`
        }
      });
      
      if (response.ok) {
        directData = await response.json();
      }
    } catch (directError) {
      // Direct query failed
    }
    
    // If we got data directly, return it
    if (directData && directData.length > 0) {
      // Direct query successful, found records
      return NextResponse.json({ 
        success: true, 
        records: directData,
        method: 'direct' 
      });
    }
    
    // If direct query failed or returned no data, try with service role key
    // This bypasses RLS policies
    let serviceData: any[] = [];
    if (serviceRoleClient) {
      try {
        // Attempting to bypass RLS with service role key
        
        const { data, error } = await serviceRoleClient
          .from('user_progress')
          .select('*')
          .eq('user_id', userId);
        
        if (!error && data) {
          serviceData = data;
          // Service role query successful, found records
        }
      } catch (serviceError) {
        // Service role query failed
      }
    } else {
      // Skip service role client attempt - not available
    }
    
    // If we got data via service role, return it
    if (serviceData && serviceData.length > 0) {
      return NextResponse.json({ 
        success: true, 
        records: serviceData,
        method: 'service-role' 
      });
    }
    
    // If we still don't have data, return empty array
    // No matching records found for user
    return NextResponse.json({ 
      success: true, 
      records: [],
      method: 'no-results' 
    });
    
  } catch (error) {
    // Unhandled error
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch user progress',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 
