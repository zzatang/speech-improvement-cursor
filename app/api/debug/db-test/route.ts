import { supabase } from '@/lib/supabase/client';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check if we can connect to Supabase
    const { data: connectionTest, error: connectionError } = await supabase
      .from('user_profiles')
      .select('count(*)');
    
    if (connectionError) {
      return NextResponse.json({ error: 'Database connection error', details: connectionError }, { status: 500 });
    }
    
    // Get database stats
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('*');
      
    const { data: progress, error: progressError } = await supabase
      .from('user_progress')
      .select('*');
    
    // Get unique user IDs from both tables
    const profileUserIds = profiles ? [...new Set(profiles.map((p: any) => p.user_id))] : [];
    const progressUserIds = progress ? [...new Set(progress.map((p: any) => p.user_id))] : [];
    
    // Find user IDs that exist in progress but not in profiles
    const orphanedProgressIds = progressUserIds.filter(id => !profileUserIds.includes(id));
    
    // Sample records
    const sampleProfiles = profiles ? profiles.slice(0, 3) : [];
    const sampleProgress = progress ? progress.slice(0, 3) : [];
    
    return NextResponse.json({
      status: 'success',
      databaseConnected: true,
      stats: {
        profileCount: profiles?.length || 0,
        progressCount: progress?.length || 0,
        uniqueProfileUserIds: profileUserIds.length,
        uniqueProgressUserIds: progressUserIds.length,
        orphanedProgressIds
      },
      samples: {
        profiles: sampleProfiles,
        progress: sampleProgress 
      }
    });
  } catch (error) {
    console.error('Debug API error:', error);
    return NextResponse.json({ error: 'Debug API error', details: error }, { status: 500 });
  }
} 