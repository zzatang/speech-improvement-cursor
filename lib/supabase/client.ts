import { createBrowserClient } from '@supabase/ssr';

// Get environment variables with fallbacks
const getSupabaseUrl = () => {
  if (typeof window !== 'undefined') {
    // Client-side: use window.location for dynamic URL
    return process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  }
  return process.env.NEXT_PUBLIC_SUPABASE_URL || '';
};

const getSupabaseKey = () => {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
};

// Create a mock Supabase client that returns empty data for development/build environments
const createMockSupabaseClient = () => {
  console.warn('Using mock Supabase client because API keys are missing');
  // Chainable query builder mock
  const mockResult = { data: [], error: null };
  const builder = {
    select: function () { return this; },
    upsert: function () { return this; },
    insert: function () { return this; },
    update: function () { return this; },
    delete: function () { return this; },
    eq: function () { return this; },
    order: function () { return this; },
    limit: function () { return this; },
    maybeSingle: function () { return Promise.resolve({ data: null, error: null }); },
    single: function () { return Promise.resolve({ data: null, error: null }); },
    then: function (resolve: (value: any) => any) { return Promise.resolve(mockResult).then(resolve); },
  };
  return {
    from: () => builder,
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
      getSession: async () => ({ data: { session: null }, error: null }),
      setSession: async (_session: any) => createMockSupabaseClient(),
      signInWithPassword: async (_credentials: any) => ({ data: null, error: { message: 'Mock client - no authentication available' } }),
      signInWithOAuth: async (_options: any) => ({ data: null, error: { message: 'Mock client - no authentication available' } }),
      signUp: async (_credentials: any) => ({ data: null, error: { message: 'Mock client - no authentication available' } }),
      signOut: async () => ({ error: null }),
      onAuthStateChange: (_callback: any) => ({ data: { subscription: { unsubscribe: () => {} } } }),
    }
  };
};

// Create the Supabase client
const createSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  console.log('Creating Supabase client with:', {
    url: supabaseUrl ? 'Present' : 'Missing',
    key: supabaseKey ? 'Present' : 'Missing'
  });
  
  if (!supabaseUrl || !supabaseKey) {
    return createMockSupabaseClient();
  }
  
  return createBrowserClient(supabaseUrl, supabaseKey);
};

// Create a singleton Supabase client
export const supabase = createSupabaseClient();

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