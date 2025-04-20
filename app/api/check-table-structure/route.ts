import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!url || !key) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing environment variables'
      }, { status: 400 });
    }
    
    const supabase = createClient(url, key);
    
    // Query table information from PostgreSQL information_schema
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(1);
      
    if (error) {
      return NextResponse.json({ 
        success: false, 
        error: error.message
      }, { status: 500 });
    }
    
    // If we got data, check the columns
    const columnNames = data && data.length > 0 ? Object.keys(data[0]) : [];
    const hasOverallProgress = columnNames.includes('overall_progress');
    
    return NextResponse.json({
      success: true,
      tableExists: true,
      columns: columnNames,
      hasOverallProgress: hasOverallProgress,
      sampleRow: data && data.length > 0 ? data[0] : null
    });
    
  } catch (error) {
    console.error('Error checking table structure:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 