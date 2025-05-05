/**
 * Environment checker for Vercel deployment
 * 
 * This utility checks if all required environment variables are properly set
 * and provides helpful error messages for missing or invalid configurations.
 */

export interface EnvironmentCheckResult {
  isValid: boolean;
  missingVariables: string[];
  invalidVariables: string[];
  messages: string[];
}

// Required environment variables with validation functions
const requiredVariables = {
  // Clerk
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY': (val: string) => val.startsWith('pk_'),
  'CLERK_SECRET_KEY': (val: string) => val.startsWith('sk_'),
  
  // Supabase
  'NEXT_PUBLIC_SUPABASE_URL': (val: string) => val.includes('supabase.co'),
  'NEXT_PUBLIC_SUPABASE_ANON_KEY': (val: string) => val.length > 20,
  
  // Google Cloud
  'GOOGLE_CLOUD_PROJECT_ID': (val: string) => val.length > 0,
  'GOOGLE_CLOUD_CREDENTIALS': (val: string) => {
    try {
      const parsed = JSON.parse(val);
      return parsed.type === 'service_account' && 
             parsed.project_id && 
             parsed.private_key && 
             parsed.client_email;
    } catch (e) {
      return false;
    }
  },
  
  // Google Cloud TTS
  'GOOGLE_TTS_VOICE_NAME': (val: string) => val.startsWith('en-AU'),
  'GOOGLE_TTS_LANGUAGE_CODE': (val: string) => val === 'en-AU',
  
  // Google Cloud STT
  'GOOGLE_STT_LANGUAGE_CODE': (val: string) => val === 'en-AU',
  'GOOGLE_STT_MODEL': (val: string) => val.length > 0,
};

/**
 * Checks if all required environment variables are set correctly
 */
export function checkEnvironmentVariables(): EnvironmentCheckResult {
  const result: EnvironmentCheckResult = {
    isValid: true,
    missingVariables: [],
    invalidVariables: [],
    messages: []
  };

  // Check each required variable
  for (const [name, validator] of Object.entries(requiredVariables)) {
    const value = process.env[name];
    
    // Check if variable exists
    if (!value) {
      result.isValid = false;
      result.missingVariables.push(name);
      result.messages.push(`Missing environment variable: ${name}`);
      continue;
    }
    
    // Check if variable is valid
    if (!validator(value)) {
      result.isValid = false;
      result.invalidVariables.push(name);
      result.messages.push(`Invalid environment variable: ${name}`);
    }
  }
  
  return result;
}

/**
 * Logs environment status to console in development
 * or to Vercel logs in production
 */
export function logEnvironmentStatus(): void {
  const result = checkEnvironmentVariables();
  
  if (result.isValid) {
    console.log('✅ All environment variables are properly configured');
  } else {
    console.error('❌ Environment configuration issues detected:');
    result.messages.forEach(msg => console.error(`  - ${msg}`));
    
    // Provide helpful resources
    console.error('\nPlease check the deployment documentation:');
    console.error('- documentation/vercel-deployment-guide.md');
  }
}

/**
 * For use in API routes or server components to validate environment
 * before performing operations that require specific variables
 */
export function validateEnvironmentFor(requiredVars: string[]): boolean {
  const result = checkEnvironmentVariables();
  
  // Only check the specified variables
  const missingRequired = result.missingVariables.filter(v => requiredVars.includes(v));
  const invalidRequired = result.invalidVariables.filter(v => requiredVars.includes(v));
  
  return missingRequired.length === 0 && invalidRequired.length === 0;
} 