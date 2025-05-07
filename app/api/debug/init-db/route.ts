import { supabase } from '@/lib/supabase/client';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

// Prevent static generation - this API needs to be dynamic
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    
    console.log(`[init-db] Initializing database for user ${userId}`);
    
    // 1. Create or ensure user profile exists
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .upsert({
        id: uuidv4(), // Generate a proper UUID
        user_id: userId,
        overall_progress: 0,
        streak_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        avatar_color: '#4F46E5',
        display_name: 'Speech Star'
      }, {
        onConflict: 'user_id' // If user_id already exists, update it
      })
      .select()
      .maybeSingle();
    
    if (profileError) {
      console.error(`[init-db] Error creating profile: ${profileError.message}`);
    } else {
      console.log(`[init-db] User profile created or verified`);
    }
    
    // 2. Create sample user progress data
    const sampleExercises = [
      {
        id: uuidv4(), // Generate proper UUIDs
        user_id: userId,
        exercise_id: "repeat-practice-1",
        score: 85,
        attempts: 1,
        completed_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: uuidv4(),
        user_id: userId,
        exercise_id: "reading-vowel-1234",
        score: 92,
        attempts: 2,
        completed_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: uuidv4(),
        user_id: userId,
        exercise_id: "repeat-Sally%20sells%20seashells",
        score: 75,
        attempts: 3,
        completed_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: uuidv4(),
        user_id: userId,
        exercise_id: "repeat-Look%20at%20the%20little%20lake",
        score: 100,
        attempts: 1,
        completed_at: new Date().toISOString(), // Today
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    
    // Add sample progress data
    const progressResults = [];
    for (const exercise of sampleExercises) {
      const { data, error } = await supabase
        .from('user_progress')
        .upsert(exercise)
        .select()
        .maybeSingle();
        
      progressResults.push({
        success: !error,
        data: data,
        error: error ? error.message : null
      });
      
      if (error) {
        console.error(`[init-db] Error adding exercise ${exercise.id}: ${error.message}`);
      } else {
        console.log(`[init-db] Added exercise ${exercise.id}`);
      }
    }
    
    // 3. Verify the data was added correctly
    const { data: verifyData, error: verifyError } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId);
    
    if (verifyError) {
      console.error(`[init-db] Error verifying data: ${verifyError.message}`);
    } else {
      console.log(`[init-db] Verified ${verifyData?.length || 0} progress records`);
    }
    
    // 4. Read existing records if we couldn't add new ones
    let existingRecords = [];
    if (!verifyData || verifyData.length === 0) {
      console.log("[init-db] No records were verified, reading all records without filtering");
      
      const { data: allRecords, error: allError } = await supabase
        .from('user_progress')
        .select('*');
        
      if (allError) {
        console.error(`[init-db] Error reading all records: ${allError.message}`);
      } else {
        existingRecords = allRecords || [];
        console.log(`[init-db] Found ${existingRecords.length} total records in database`);
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Database initialized for user ${userId}`,
      profile: profileData,
      progressResults: progressResults,
      verificationCount: verifyData?.length || 0,
      existingRecordsCount: existingRecords.length,
      note: "If initialization failed due to RLS policies, you need to authenticate with the correct role to access the data"
    });
    
  } catch (error) {
    console.error('[init-db] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
} 