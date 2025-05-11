import { createClient } from '@supabase/supabase-js';

// Check for required environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create a mock Supabase client that returns empty data for development/build environments
const createMockSupabaseClient = () => {
  console.warn('Using mock Supabase client because API keys are missing');
  // Silent mock implementation for development
  return {
    from: () => ({
      select: () => ({
        eq: () => ({
          single: async () => ({ data: null, error: null }),
          maybeSingle: async () => ({ data: null, error: null }),
          order: () => ({ 
            data: [],  // This should be an array, not null
            error: null 
          })
        }),
        order: () => ({
          data: [],  // Make sure this is an array
          error: null
        }),
        limit: () => ({
          single: async () => ({ data: null, error: null })
        }),
        delete: () => ({ error: null }),
        insert: () => ({
          select: () => ({
            single: async () => ({ data: null, error: null })
          })
        }),
        update: () => ({
          eq: () => ({
            select: async () => ({ data: null, error: null })
          })
        })
      }),
      insert: () => ({
        select: () => ({
          single: async () => ({ data: null, error: null })
        })
      }),
      delete: () => ({
        eq: () => ({ error: null })
      }),
      update: () => ({
        eq: () => ({
          select: async () => ({ data: null, error: null })
        })
      })
    }),
    auth: {
      getUser: async () => ({ data: { user: null }, error: null })
    }
  };
};

// Create a singleton Supabase client
export const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : createMockSupabaseClient();

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