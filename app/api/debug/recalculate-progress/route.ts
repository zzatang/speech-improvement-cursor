import { NextResponse } from 'next/server';
import { updateUserProfile, getUserProfile } from '@/lib/supabase/services/user-service';

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    
    console.log(`[DEBUG API] Recalculating progress for user ${userId}...`);
    
    // Get the current user profile
    const { data: beforeProfile } = await getUserProfile(userId);
    console.log(`[DEBUG API] Before recalculation: progress=${beforeProfile?.overall_progress}, streak=${beforeProfile?.streak_count}`);
    
    // Update the user profile which recalculates the overall progress
    const result = await updateUserProfile(userId);
    
    // Get the updated user profile
    const { data: afterProfile } = await getUserProfile(userId);
    console.log(`[DEBUG API] After recalculation: progress=${afterProfile?.overall_progress}, streak=${afterProfile?.streak_count}`);
    
    return NextResponse.json({
      success: true,
      message: 'User progress recalculated',
      before: {
        progress: beforeProfile?.overall_progress,
        streak: beforeProfile?.streak_count
      },
      after: {
        progress: afterProfile?.overall_progress,
        streak: afterProfile?.streak_count
      }
    });
  } catch (error) {
    console.error('[DEBUG API] Error recalculating progress:', error);
    return NextResponse.json({ error: 'Failed to recalculate progress' }, { status: 500 });
  }
} 