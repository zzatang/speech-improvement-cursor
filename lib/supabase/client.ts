import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Helper function to handle common Supabase errors
 */
export const handleSupabaseError = (error: any) => {
  console.error('Supabase error:', error);
  return {
    data: null,
    error: {
      message: error?.message || 'An unexpected error occurred',
      status: error?.status || 500,
    },
  };
};

/**
 * Custom fetch wrapper for Supabase
 * @param fn - The Supabase function to execute
 */
export async function safeSupabaseCall<T>(fn: () => Promise<any>): Promise<{ data: T | null; error: any }> {
  try {
    const result = await fn();
    return result;
  } catch (error) {
    return handleSupabaseError(error);
  }
} 