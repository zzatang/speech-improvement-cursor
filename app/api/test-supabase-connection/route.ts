import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Add GET handler to test with browser
export async function GET() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    // Validate env vars
    if (!url || !key) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing environment variables',
        config: {
          url: url ? "✓ Found" : "✗ Missing",
          key: key ? "✓ Found" : "✗ Missing"
        }
      }, { status: 400 });
    }
    
    // Create a test client
    const testClient = createClient(url, key);
    
    // Basic health check using auth.getSession() which doesn't need specific tables
    const { error: healthError } = await testClient.auth.getSession();
    
    if (healthError) {
      return NextResponse.json({
        success: false,
        error: healthError.message || 'Connection failed',
        details: healthError,
        config: {
          url: url.substring(0, 15) + "...",
          key: key.substring(0, 5) + "..."
        }
      });
    }
    
    // Skip further queries and just report success if we got this far
    return NextResponse.json({ 
      success: true,
      message: "Supabase connection established successfully!",
      config: {
        url: url.substring(0, 15) + "...",
        key: key.substring(0, 5) + "..."
      }
    });
    
  } catch (error) {
    
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url, key } = body;
    
    // Validate inputs
    if (!url || !key) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing URL or API key' 
      }, { status: 400 });
    }
    
    // Ensure URL has correct format
    if (!url.startsWith('https://') || !url.includes('.supabase.co')) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid Supabase URL format' 
      }, { status: 400 });
    }
    
    // Create a test client
    const testClient = createClient(url, key);
    
    // Try a simple test query
    const { error } = await testClient
      .from('user_profiles')
      .select('count()', { count: 'exact', head: true });
    
    if (error) {
      return NextResponse.json({ 
        success: false, 
        error: error.message || 'Unknown error' 
      });
    }
    
    // If we get here, the connection was successful
    return NextResponse.json({ success: true });
    
  } catch (error) {
    
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 
