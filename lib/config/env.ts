/**
 * Environment configuration with validation and defaults
 */

// Required environment variables
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
] as const

// Optional environment variables with defaults
const optionalEnvVars = {
  GOOGLE_STT_LANGUAGE_CODE: 'en-AU',
  GOOGLE_TTS_LANGUAGE_CODE: 'en-AU',
  GOOGLE_TTS_VOICE_NAME: 'en-AU-Neural2-B',
  GOOGLE_TTS_SPEAKING_RATE: '0.9',
  NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
} as const

// Validate required environment variables
function validateRequiredEnvVars() {
  const missing = requiredEnvVars.filter(
    (envVar) => !process.env[envVar]
  )

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    )
  }
}

// Get environment variable with fallback
function getEnvVar(key: string, fallback?: string): string {
  const value = process.env[key]
  if (!value && !fallback) {
    throw new Error(`Environment variable ${key} is required`)
  }
  return value || fallback || ''
}

// Validate environment on module load (server-side only)
if (typeof window === 'undefined') {
  validateRequiredEnvVars()
}

export const env = {
  // Supabase
  supabase: {
    url: getEnvVar('NEXT_PUBLIC_SUPABASE_URL'),
    anonKey: getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    serviceRoleKey: getEnvVar('SUPABASE_SERVICE_ROLE_KEY', ''),
  },

  // Google Cloud
  google: {
    credentials: getEnvVar('GOOGLE_CLOUD_CREDENTIALS', ''),
    projectId: getEnvVar('GOOGLE_CLOUD_PROJECT_ID', ''),
    stt: {
      languageCode: getEnvVar('GOOGLE_STT_LANGUAGE_CODE', optionalEnvVars.GOOGLE_STT_LANGUAGE_CODE),
    },
    tts: {
      languageCode: getEnvVar('GOOGLE_TTS_LANGUAGE_CODE', optionalEnvVars.GOOGLE_TTS_LANGUAGE_CODE),
      voiceName: getEnvVar('GOOGLE_TTS_VOICE_NAME', optionalEnvVars.GOOGLE_TTS_VOICE_NAME),
      speakingRate: parseFloat(getEnvVar('GOOGLE_TTS_SPEAKING_RATE', optionalEnvVars.GOOGLE_TTS_SPEAKING_RATE)),
    },
  },

  // App
  app: {
    url: getEnvVar('NEXT_PUBLIC_APP_URL', optionalEnvVars.NEXT_PUBLIC_APP_URL),
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
  },

  // Clerk
  clerk: {
    publishableKey: getEnvVar('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY', ''),
    secretKey: getEnvVar('CLERK_SECRET_KEY', ''),
  },
} as const

export type EnvConfig = typeof env 