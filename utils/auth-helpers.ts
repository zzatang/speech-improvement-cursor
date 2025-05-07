/**
 * Helper functions for authentication
 */

// Check if we're in a CI environment
const isCI = process.env.CI === 'true' || process.env.IS_CI_BUILD === 'true';

/**
 * Check if Clerk auth is available in the current environment
 */
export function isClerkAvailable(): boolean {
  // In CI mode, Clerk is not available
  if (isCI) {
    return false;
  }
  
  // Check for Clerk environment variables
  const hasClerkKeys = !!(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
    process.env.CLERK_SECRET_KEY
  );
  
  return hasClerkKeys;
}

/**
 * Check if we're running in CI environment
 */
export function isCIEnvironment(): boolean {
  return isCI;
} 