import { supabase, safeSupabaseCall } from '../client';
import { UserProfile, UserProgress, UserAchievement } from '../types';

/**
 * Creates or updates a user profile in Supabase
 */
export async function upsertUserProfile(profile: Partial<UserProfile>) {
  return safeSupabaseCall<UserProfile>(async () => {
    console.log(`[user-service] Upserting profile for user ${profile.user_id}...`);
    
    // First check if the profile exists
    try {
      const { data: existingProfile, error: checkError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', profile.user_id)
        .maybeSingle();
      
      if (checkError) {
        console.error(`[user-service] Error checking for existing profile: ${checkError.message}`);
      }
      
      // If profile exists, update it
      if (existingProfile) {
        console.log(`[user-service] Existing profile found, updating...`);
        const { data, error } = await supabase
          .from('user_profiles')
          .update({
            ...profile,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', profile.user_id)
          .select()
          .maybeSingle();
        
        if (error) {
          console.error(`[user-service] Error updating profile: ${error.message}`);
          // Return the existing profile with updates merged in
          return { 
            data: { 
              ...existingProfile, 
              ...profile, 
              updated_at: new Date().toISOString() 
            }, 
            error: null 
          };
        }
        
        return { data, error: null };
      }
      
      // Otherwise insert new profile
      console.log(`[user-service] No existing profile, creating new one...`);
      const { data, error } = await supabase
        .from('user_profiles')
        .insert({
          ...profile,
          created_at: profile.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .maybeSingle();
      
      if (error) {
        console.error(`[user-service] Error creating profile: ${error.message}`);
        // Return a default profile with the provided properties
        return { 
          data: {
            ...profile,
            created_at: profile.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString(),
          } as UserProfile, 
          error: null 
        };
      }
      
      return { data, error: null };
    } catch (err) {
      console.error(`[user-service] Exception in upsertUserProfile: ${err}`);
      // Return a default profile with the provided properties
      return { 
        data: {
          ...profile,
          created_at: profile.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as UserProfile, 
        error: null 
      };
    }
  });
}

/**
 * Gets a user profile from Supabase
 */
export async function getUserProfile(userId: string) {
  return safeSupabaseCall<UserProfile>(async () => {
    console.log(`[user-service] Fetching profile for user ${userId}...`);
    
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle(); // Use maybeSingle to avoid multiple rows error

    if (error) {
      console.error(`[user-service] Error fetching user profile: ${error.message}`);
      throw error;
    }
    
    console.log(`[user-service] Profile fetch result:`, data ? 'Success' : 'Not found');
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
    console.log(`[user-service] Fetching achievements for user ${userId}...`);
    
    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .select(`
          *,
          achievements:achievement_id(*)
        `)
        .eq('user_id', userId);
  
      if (error) {
        // Special handling for "relationship not found" error which happens when the table doesn't exist
        if (error.message.includes("relationship") || error.message.includes("schema")) {
          console.log(`[user-service] Achievement tables might not exist, returning empty array`);
          return { data: [], error: null };
        }
        
        console.error(`[user-service] Error fetching achievements: ${error.message}`);
        throw error;
      }
      
      console.log(`[user-service] Found ${data?.length || 0} achievements`);
      return { data, error: null };
    } catch (err) {
      console.error(`[user-service] Exception in getUserAchievements: ${err}`);
      // Return empty array instead of throwing to avoid breaking the UI
      return { data: [], error: null };
    }
  });
}

/**
 * Updates a user profile with the latest progress data
 * This recalculates overall progress based on completed exercises
 */
export async function updateUserProfile(userId: string) {
  return safeSupabaseCall<UserProfile>(async () => {
    console.log(`[user-service] Updating user profile for ${userId}...`);
    
    // First check if the user profile exists
    const { data: existingProfile, error: checkError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle(); // Use maybeSingle to avoid multiple rows error
      
    if (checkError) {
      console.error(`[user-service] Error checking for profile: ${checkError.message}`);
      throw checkError;
    }
    
    if (!existingProfile) {
      console.log(`[user-service] No profile found for ${userId}, creating one...`);
      
      // Create a new profile with default values
      try {
        const { data: newProfile, error: createError } = await supabase
          .from('user_profiles')
          .insert({
            user_id: userId,
            overall_progress: 0,
            streak_count: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            avatar_color: '#4F46E5',
            display_name: 'Speech Star'
          })
          .select()
          .single();
          
        if (createError) {
          console.error(`[user-service] Error creating profile: ${createError.message}`);
          throw createError;
        }
        
        console.log(`[user-service] Successfully created new profile for ${userId}`);
        return { data: newProfile, error: null };
      } catch (insertError) {
        console.error(`[user-service] Exception creating profile: ${insertError}`);
        // Return a default profile object
        return { 
          data: {
            user_id: userId,
            overall_progress: 0,
            streak_count: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            avatar_color: '#4F46E5',
            display_name: 'Speech Star'
          } as UserProfile, 
          error: null 
        };
      }
    }
    
    // Get all user progress records
    console.log(`[user-service] Fetching progress records for ${userId}...`);
    const { data: progressData, error: progressError } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId);
    
    if (progressError) {
      console.error(`[user-service] Error fetching progress data: ${progressError.message}`);
      // Don't throw here, just use the existing profile
      return { data: existingProfile, error: null };
    }
    
    console.log(`[user-service] Found ${progressData?.length || 0} progress records`);
    
    // Calculate overall progress
    let overallProgress = existingProfile.overall_progress || 0;
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
      console.log(`[user-service] No progress records found, defaulting to ${overallProgress}% progress`);
    }
    
    // Update user profile with new overall progress
    console.log(`[user-service] Updating ${userId} profile with progress: ${overallProgress}%`);
    
    try {
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
        return { data: existingProfile, error: null }; // Return existing profile on error
      }
      
      console.log(`[user-service] Successfully updated user profile for ${userId}`);
      return { data, error: null };
    } catch (updateError) {
      console.error(`[user-service] Exception updating profile: ${updateError}`);
      // Return the existing profile
      return { data: existingProfile, error: null };
    }
  });
}

/**
 * Get user progress
 */
export async function getUserProgress(userId: string) {
  return safeSupabaseCall<UserProgress[]>(async () => {
    console.log(`[user-service] Fetching progress for user ${userId}...`);
    
    try {
      // First try with a direct query
      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        console.error(`[user-service] Error fetching user progress: ${error.message}`);
        
        // If we get RLS policy error, fallback to API endpoint which handles auth
        if (error.message && error.message.includes('policy')) {
          console.log('[user-service] RLS policy error, falling back to API endpoint');
          
          // Use fetch to call the API endpoint
          const response = await fetch(`/api/user-progress?userId=${encodeURIComponent(userId)}`);
          
          if (!response.ok) {
            throw new Error(`API returned status ${response.status}`);
          }
          
          const apiResult = await response.json();
          
          if (apiResult.success && apiResult.records) {
            console.log(`[user-service] API returned ${apiResult.records.length} records`);
            return { data: apiResult.records, error: null };
          } else {
            console.error('[user-service] API endpoint returned error:', apiResult.error);
            throw new Error(apiResult.error || 'Unknown API error');
          }
        }
        
        throw error;
      }
      
      console.log(`[user-service] Found ${data?.length || 0} progress records`);
      return { data, error: null };
    } catch (error) {
      console.error(`[user-service] Exception in getUserProgress: ${error}`);
      // Return empty array instead of throwing to prevent UI errors
      return { data: [], error: null };
    }
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