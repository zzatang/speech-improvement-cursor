import { createClient } from '@supabase/supabase-js';

// Check for required environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing environment variables for Supabase client');
}

// Create a singleton Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to safely handle Supabase calls with consistent error formatting
export async function safeSupabaseCall<T>(fn: () => Promise<{ data: T | null; error: any }>): Promise<{ data: T | null; error: any }> {
  try {
    const result = await fn();
    return result;
  } catch (err) {
    // Format error for consistent handling
    const error = handleSupabaseError(err);
    return { data: null, error };
  }
}

// Format error messages consistently
export function handleSupabaseError(error: any): any {
  // If it's already a well-structured error, return it
  if (error && typeof error === 'object' && 'message' in error) {
    return error;
  }

  // Otherwise create a structured error object
  return {
    message: error instanceof Error ? error.message : 'An unknown database error occurred',
    details: error
  };
} 