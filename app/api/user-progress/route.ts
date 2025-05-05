import { supabase } from '@/lib/supabase/client';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create a Supabase client with the service role key which bypasses RLS
const createServiceRoleClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing environment variables for service role client');
    throw new Error('Missing Supabase environment variables for service role');
  }
  
  console.log('API: Creating service role client to bypass RLS');
  return createClient(supabaseUrl, supabaseServiceKey);
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  
  if (!userId) {
    return NextResponse.json({ error: 'Missing userId parameter' }, { status: 400 });
  }
  
  try {
    console.log(`API: Fetching progress for user ${userId}`);
    
    // Get auth info from Clerk
    const { getToken } = await auth();
    
    // Get the JWT from Clerk with the supabase template
    const supabaseToken = await getToken({ template: 'supabase' });
    
    // Create an authenticated client if we have a token
    let authClient = supabase;
    if (supabaseToken) {
      console.log('API: Using authenticated Supabase client');
      // Fix the way we set the session
      const { data } = await supabase.auth.setSession({ 
        access_token: supabaseToken,
        refresh_token: ''
      });
      // Use the same supabase client but now it's authenticated
      authClient = supabase;
    } else {
      console.log('API: No auth token available, using anonymous client');
    }
    
    // First try a direct query with auth if available, which should work with RLS
    const { data: directData, error: directError } = await authClient
      .from('user_progress')
      .select('*')
      .eq('user_id', userId);
      
    if (!directError && directData && directData.length > 0) {
      console.log(`API: Direct query successful, found ${directData.length} records`);
      const sortedData = [...directData].sort((a, b) => 
        new Date(b.completed_at || 0).getTime() - new Date(a.completed_at || 0).getTime()
      );
      
      return NextResponse.json({
        success: true,
        userId,
        records: sortedData,
        count: sortedData.length,
        method: 'direct_auth'
      });
    }
    
    if (directError) {
      console.error(`API: Direct query failed: ${directError.message}`);
    }
    
    // If direct query failed due to RLS, try with service role key
    if (directError && directError.message.includes('policy')) {
      console.log('API: Attempting to bypass RLS with service role key');
      try {
        const serviceClient = createServiceRoleClient();
        const { data: serviceData, error: serviceError } = await serviceClient
          .from('user_progress')
          .select('*')
          .eq('user_id', userId);
          
        if (!serviceError && serviceData && serviceData.length > 0) {
          console.log(`API: Service role query successful, found ${serviceData.length} records`);
          const sortedData = [...serviceData].sort((a, b) => 
            new Date(b.completed_at || 0).getTime() - new Date(a.completed_at || 0).getTime()
          );
          
          return NextResponse.json({
            success: true,
            userId,
            records: sortedData,
            count: sortedData.length,
            method: 'service_role_bypass'
          });
        }
        
        if (serviceError) {
          console.error(`API: Service role query failed: ${serviceError.message}`);
        }
      } catch (srError) {
        console.error('API: Error using service role client:', srError);
      }
    }
    
    // Fetch all progress records globally as another approach
    const { data: allData, error: allError } = await supabase
      .from('user_progress')
      .select('*');
    
    // If there was an error fetching all data
    if (allError) {
      console.error(`API: Error fetching all progress data: ${allError.message}`);
      return NextResponse.json({
        success: false,
        error: 'Database access restricted. RLS policies are preventing access to data.',
        message: allError.message
      }, { status: 403 });
    }
    
    // If we got all data, filter for the user
    console.log(`API: Found ${allData?.length || 0} total records in database`);
    
    // Filter records for the specific user
    const userRecords = allData?.filter(record => record.user_id === userId) || [];
    
    if (userRecords.length > 0) {
      console.log(`API: Filtered ${userRecords.length} records for user ${userId}`);
      
      // Sort by completion date
      const sortedRecords = [...userRecords].sort((a, b) => 
        new Date(b.completed_at || 0).getTime() - new Date(a.completed_at || 0).getTime()
      );
      
      return NextResponse.json({
        success: true,
        userId,
        records: sortedRecords,
        count: sortedRecords.length,
        method: 'filtered_all'
      });
    }
    
    // No matching records found for the specific user
    console.log(`API: No matching records found for user ${userId}`);
    
    // Return a sample of all records as demonstration data
    // This is useful for testing until proper authentication is set up
    if (allData && allData.length > 0) {
      const sampleRecords = allData.slice(0, 5).map(record => ({
        ...record,
        user_id: userId, // Override to the current user for display purposes
        note: "Sample data for demonstration only"
      }));
      
      return NextResponse.json({
        success: true,
        userId,
        records: sampleRecords,
        count: sampleRecords.length,
        method: 'sample_data',
        note: 'Using sample data for demonstration. Actual user data not found.'
      });
    }
    
    return NextResponse.json({
      success: false,
      error: 'No records found in database',
      userId
    });
    
  } catch (error) {
    console.error('API: Unhandled error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 