/**
 * Helper functions for authentication
 */

// Check if we're in a CI environment
const isCI = process.env.CI === 'true' || process.env.IS_CI_BUILD === 'true';

/**
 * Check if Supabase auth is available in the current environment
 */
export function isSupabaseAvailable(): boolean {
  // In CI mode, Supabase is not available
  if (isCI) {
    return false;
  }
  
  // Check for Supabase environment variables
  const hasSupabaseKeys = !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  
  return hasSupabaseKeys;
}

/**
 * Check if we're running in CI environment
 */
export function isCIEnvironment(): boolean {
  return isCI;
} 