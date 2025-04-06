import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

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
    console.error('Error testing Supabase connection:', error);
    
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 