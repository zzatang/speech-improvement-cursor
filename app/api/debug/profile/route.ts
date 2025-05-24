import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'userId parameter required' }, { status: 400 });
    }
    
    console.log('Debug: Checking profile for user:', userId);
    
    // Check if user_profiles table exists
    const { data: tables, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'user_profiles');
    
    console.log('Tables check:', { tables, tableError });
    
    // Try to get user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    console.log('Profile check:', { profile, profileError });
    
    // Try to get user progress
    const { data: progress, error: progressError } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .limit(5);
    
    console.log('Progress check:', { progress, progressError });
    
    return NextResponse.json({
      userId,
      tableExists: !!tables && tables.length > 0,
      tableError: tableError?.message,
      profile,
      profileError: profileError?.message,
      progressCount: progress?.length || 0,
      progressError: progressError?.message,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Debug API error:', error);
    return NextResponse.json({
      error: 'Debug API failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 