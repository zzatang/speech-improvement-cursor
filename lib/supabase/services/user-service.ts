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
 * Updates a user profile with the latest progress data
 * This recalculates overall progress based on completed exercises
 */
export async function updateUserProfile(userId: string) {
  return safeSupabaseCall<UserProfile>(async () => {
    console.log(`[user-service] Updating user profile for ${userId}...`);
    
    // Get all user progress records
    console.log(`[user-service] Fetching progress records for ${userId}...`);
    const { data: progressData, error: progressError } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId);
    
    if (progressError) {
      console.error(`[user-service] Error fetching progress data: ${progressError.message}`);
      throw progressError;
    }
    
    console.log(`[user-service] Found ${progressData?.length || 0} progress records`);
    
    // Calculate overall progress
    let overallProgress = 0;
    if (progressData && progressData.length > 0) {
      // Calculate the sum of all scores
      const totalScores = progressData.reduce((sum, record) => {
        console.log(`[user-service] Adding score ${record.score || 0} for exercise ${record.exercise_id}`);
        return sum + (record.score || 0);
      }, 0);
      
      console.log(`[user-service] Total sum of scores: ${totalScores}`);
      console.log(`[user-service] Number of exercises: ${progressData.length}`);
      
      // Average of all exercise scores
      overallProgress = Math.round(totalScores / progressData.length);
      console.log(`[user-service] Raw calculated progress: ${overallProgress}%`);
      
      // Cap at 100%
      overallProgress = Math.min(overallProgress, 100);
      console.log(`[user-service] Final capped progress: ${overallProgress}%`);
    } else {
      console.log(`[user-service] No progress records found, defaulting to 0% progress`);
    }
    
    // Update user profile with new overall progress
    console.log(`[user-service] Updating ${userId} profile with progress: ${overallProgress}%`);
    
    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        overall_progress: overallProgress,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) {
      console.error(`[user-service] Error updating user profile: ${error.message}`);
      throw error;
    }
    
    console.log(`[user-service] Successfully updated user profile for ${userId}`);
    return { data, error: null };
  });
}

/**
 * Get user progress
 */
export async function getUserProgress(userId: string) {
  return safeSupabaseCall<UserProgress[]>(async () => {
    console.log(`[user-service] Fetching progress for user ${userId}...`);
    
    // Use a simpler query without joins for now
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error(`[user-service] Error fetching user progress: ${error.message}`);
      throw error;
    }
    
    console.log(`[user-service] Found ${data?.length || 0} progress records`);
    
    return { data, error: null };
  });
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  status: 'active' | 'suspended' | 'pending';
  created_at: string;
}

export interface UserInput {
  name: string;
  email: string;
  role: 'admin' | 'user';
  status: 'active' | 'suspended' | 'pending';
}

// Fetch all users
export async function getAllUsers(): Promise<User[]> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as User[];
}

// Fetch a user by ID
export async function getUserById(id: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data as User;
}

// Create a new user (admin only)
export async function createUser(input: UserInput): Promise<User> {
  const { data, error } = await supabase
    .from('user_profiles')
    .insert([input])
    .select()
    .single();
  if (error) throw error;
  return data as User;
}

// Update an existing user
export async function updateUser(id: string, input: UserInput): Promise<User> {
  const { data, error } = await supabase
    .from('user_profiles')
    .update(input)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as User;
}

// Delete a user
export async function deleteUser(id: string): Promise<void> {
  const { error } = await supabase
    .from('user_profiles')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

// Suspend a user (set status to 'suspended')
export async function suspendUser(id: string): Promise<User> {
  const { data, error } = await supabase
    .from('user_profiles')
    .update({ status: 'suspended' })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as User;
}

// Enable a user (set status to 'active')
export async function enableUser(id: string): Promise<User> {
  const { data, error } = await supabase
    .from('user_profiles')
    .update({ status: 'active' })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as User;
} 