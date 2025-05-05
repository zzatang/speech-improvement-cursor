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
    
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle(); // Use maybeSingle to avoid multiple rows error

      if (error) {
        // Handle specific error types
        if (error.message && (
            error.message.includes("no rows") || 
            error.message.includes("multiple rows") || 
            error.message.includes("multiple (or no) rows"))
        ) {
          console.log(`[user-service] No unique profile found for ${userId}: ${error.message}`);
          // Return null data instead of throwing error
          return { 
            data: null, 
            error: { 
              message: 'No unique profile found', 
              details: error.message 
            } 
          };
        }
        
        // For other errors, log and return the error
        console.error(`[user-service] Error fetching user profile: ${error.message}`);
        return { data: null, error };
      }
      
      console.log(`[user-service] Profile fetch result:`, data ? 'Success' : 'Not found');
      return { data, error: null };
    } catch (err) {
      console.error(`[user-service] Exception in getUserProfile:`, err);
      return { 
        data: null, 
        error: { 
          message: 'Exception in getUserProfile', 
          details: err instanceof Error ? err.message : String(err) 
        } 
      };
    }
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
    
    try {
      // First check if the user profile exists
      const { data: existingProfile, error: checkError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle(); // Use maybeSingle to avoid multiple rows error
        
      if (checkError) {
        console.error(`[user-service] Error checking for profile: ${checkError.message}`);
        
        // Create default profile if none exists or there was an error
        if (checkError.message && (
            checkError.message.includes("no rows") || 
            checkError.message.includes("multiple rows") ||
            checkError.message.includes("multiple (or no) rows"))
        ) {
          console.log(`[user-service] No unique profile found, creating a new one...`);
          return await createDefaultUserProfile(userId);
        }
        
        // For other errors, log but don't throw
        return await createDefaultUserProfile(userId);
      }
      
      if (!existingProfile) {
        console.log(`[user-service] No profile found for ${userId}, creating one...`);
        return await createDefaultUserProfile(userId);
      }
      
      // Get all user progress records - first try direct API then fallback to Supabase
      console.log(`[user-service] Fetching progress records for ${userId}...`);
      
      // Try to use direct API first if running in browser
      let progressData = [];
      let progressError = null;
      
      if (typeof window !== 'undefined') {
        try {
          console.log(`[user-service] Trying direct API for progress data...`);
          const response = await fetch(`/api/direct-data/user-progress?userId=${userId}`);
          if (response.ok) {
            const data = await response.json();
            if (data && data.success && data.records) {
              console.log(`[user-service] Direct API success - found ${data.records.length} records`);
              progressData = data.records;
            }
          } else {
            console.log(`[user-service] Direct API failed with status ${response.status}, falling back to Supabase`);
          }
        } catch (directApiError) {
          console.error(`[user-service] Error using direct API:`, directApiError);
          console.log(`[user-service] Falling back to Supabase query...`);
        }
      }
      
      // If direct API approach didn't work or we're in a server context, use Supabase
      if (progressData.length === 0) {
        const result = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', userId);
        
        progressError = result.error;
        
        if (progressError) {
          console.error(`[user-service] Error fetching progress data: ${progressError.message}`);
          // Don't throw, just use the existing profile
          return { data: existingProfile, error: null };
        }
        
        progressData = result.data || [];
      }
      
      console.log(`[user-service] Found ${progressData?.length || 0} progress records`);
      
      // Calculate overall progress
      let overallProgress = existingProfile.overall_progress || 0;
      if (progressData && progressData.length > 0) {
        // Calculate the sum of all scores
        const totalScores = progressData.reduce((sum: number, record: any) => {
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
      }
      
      console.log(`[user-service] Updating user_${userId} with overall_progress: ${overallProgress}%`);
      
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .update({
            overall_progress: overallProgress,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId)
          .select()
          .maybeSingle(); // Use maybeSingle to avoid multiple rows error
        
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
    } catch (globalError) {
      console.error(`[user-service] Global error in updateUserProfile:`, globalError);
      
      // Return default profile rather than throwing
      return await createDefaultUserProfile(userId);
    }
  });
}

// Helper function to create a default user profile
async function createDefaultUserProfile(userId: string) {
  try {
    console.log(`[user-service] Creating default profile for ${userId}...`);
    
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
      .maybeSingle();
      
    if (createError) {
      console.error(`[user-service] Error creating profile: ${createError.message}`);
      
      // Return a default profile object regardless of error
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

/**
 * Get user progress
 */
export async function getUserProgress(userId: string) {
  return safeSupabaseCall<UserProgress[]>(async () => {
    console.log(`[user-service] Fetching progress for user ${userId}...`);
    
    try {
      // First try with the direct-data API if in a browser environment
      if (typeof window !== 'undefined') {
        try {
          console.log(`[user-service] First trying direct API endpoint...`);
          
          // Try the direct-data API that bypasses RLS
          const response = await fetch(`/api/direct-data/user-progress?userId=${encodeURIComponent(userId)}`);
          
          if (response.ok) {
            const apiResult = await response.json();
            
            if (apiResult.success && apiResult.records) {
              console.log(`[user-service] Direct API returned ${apiResult.records.length} records`);
              return { data: apiResult.records, error: null };
            } else {
              console.log(`[user-service] Direct API returned no records or an error, falling back...`);
            }
          } else {
            console.log(`[user-service] Direct API failed with status ${response.status}, falling back...`);
          }
        } catch (directApiError) {
          console.error(`[user-service] Error using direct API: ${directApiError}`);
          console.log(`[user-service] Falling back to standard Supabase query...`);
        }
      }
      
      // If direct API fails or we're in a server context, try standard Supabase query
      console.log(`[user-service] Using standard Supabase query...`);
      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        console.error(`[user-service] Error fetching user progress: ${error.message}`);
        
        // If we get RLS policy error, fallback to API endpoint which handles auth
        if (error.message && error.message.includes('policy')) {
          console.log('[user-service] RLS policy error, trying another API endpoint...');
          
          // Try the /api/user-progress endpoint as a last resort
          try {
            const response = await fetch(`/api/user-progress?userId=${encodeURIComponent(userId)}`);
            
            if (!response.ok) {
              console.error(`[user-service] API returned status ${response.status}`);
              return { data: [], error: null }; // Return empty array instead of throwing
            }
            
            const apiResult = await response.json();
            
            if (apiResult.success && apiResult.records) {
              console.log(`[user-service] API returned ${apiResult.records.length} records`);
              return { data: apiResult.records, error: null };
            } else {
              console.error('[user-service] API endpoint returned error:', apiResult.error);
              return { data: [], error: null }; // Return empty array instead of throwing
            }
          } catch (apiError) {
            console.error(`[user-service] Error calling API: ${apiError}`);
            return { data: [], error: null }; // Return empty array instead of throwing
          }
        }
        
        // For other errors, return empty array instead of throwing
        return { data: [], error: null };
      }
      
      console.log(`[user-service] Found ${data?.length || 0} progress records via Supabase query`);
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