import { supabase, safeSupabaseCall } from '../client';
import { UserProfile, UserProgress, UserAchievement } from '../types';

/**
 * Creates or updates a user profile in Supabase
 */
export async function upsertUserProfile(profile: Partial<UserProfile>) {
  return safeSupabaseCall<UserProfile>(async () => {
    const { data, error } = await supabase
      .from('user_profiles')
      .upsert({
        ...profile,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  });
}

/**
 * Gets a user profile by user ID
 */
export async function getUserProfile(userId: string) {
  return safeSupabaseCall<UserProfile>(async () => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return { data, error: null };
  });
}

/**
 * Updates a user's streak count
 */
export async function updateStreakCount(userId: string, streakCount: number) {
  return safeSupabaseCall<UserProfile>(async () => {
    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        streak_count: streakCount,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  });
}

/**
 * Updates a user's last login time
 */
export async function updateLastLogin(userId: string) {
  return safeSupabaseCall<UserProfile>(async () => {
    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        last_login: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  });
}

/**
 * Get user achievements
 */
export async function getUserAchievements(userId: string) {
  return safeSupabaseCall<UserAchievement[]>(async () => {
    const { data, error } = await supabase
      .from('user_achievements')
      .select(`
        *,
        achievements:achievement_id(*)
      `)
      .eq('user_id', userId);

    if (error) throw error;
    return { data, error: null };
  });
}

/**
 * Get user progress
 */
export async function getUserProgress(userId: string) {
  return safeSupabaseCall<UserProgress[]>(async () => {
    const { data, error } = await supabase
      .from('user_progress')
      .select(`
        *,
        speech_exercises:exercise_id(*)
      `)
      .eq('user_id', userId);

    if (error) throw error;
    return { data, error: null };
  });
} 