import { auth } from '@clerk/nextjs/server';
import { supabase } from './client';
import { upsertUserProfile } from './services/user-service';

/**
 * Integrates Clerk auth with Supabase
 * Sets Supabase auth to use the Clerk user JWT
 */
export const getSupabaseWithAuth = async () => {
  const { getToken, userId } = await auth();
  
  if (!userId) {
    throw new Error('User not authenticated');
  }

  // Get the JWT from Clerk
  const supabaseAccessToken = await getToken({ template: 'supabase' });
  
  if (!supabaseAccessToken) {
    throw new Error('Failed to get access token for Supabase');
  }

  // Set the Supabase client to use the Clerk JWT
  const authenticatedSupabase = supabase.auth.setSession({
    access_token: supabaseAccessToken as string,
    refresh_token: '',
  });

  // Ensure the user profile exists in Supabase
  await upsertUserProfile({
    user_id: userId,
    last_login: new Date().toISOString(),
  });

  return authenticatedSupabase;
};

/**
 * Gets the current user ID from Clerk auth
 */
export const getCurrentUserId = async () => {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error('User not authenticated');
  }
  
  return userId;
}; 