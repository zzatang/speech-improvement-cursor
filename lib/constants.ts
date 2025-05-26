/**
 * Application constants
 */

// API Endpoints
export const API_ENDPOINTS = {
  SPEECH: {
    RECOGNIZE: '/api/speech/recognize',
    TTS: '/api/speech/tts',
    ASR: '/api/speech/asr',
  },
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    SIGNUP: '/api/auth/signup',
  },
  USER: {
    PROGRESS: '/api/user-progress',
    PROFILE: '/api/user/profile',
  },
} as const

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/auth/login',
  SIGNUP: '/auth/signup',
  DASHBOARD: '/dashboard',
  PRACTICE: '/practice',
  PROFILE: '/profile',
  ONBOARDING: '/onboarding',
} as const

// Speech Configuration
export const SPEECH_CONFIG = {
  DEFAULT_LANGUAGE: 'en-AU',
  DEFAULT_VOICE: 'en-AU-Neural2-B',
  DEFAULT_SPEAKING_RATE: 0.9,
  MAX_RECORDING_TIME: 30000, // 30 seconds
  MIN_RECORDING_TIME: 1000,  // 1 second
} as const

// UI Constants
export const UI_CONFIG = {
  ANIMATION_DURATION: 300,
  DEBOUNCE_DELAY: 500,
  TOAST_DURATION: 5000,
  MAX_RETRIES: 3,
} as const

// Validation Rules
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 20,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
} as const

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You need to be logged in to access this feature.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  GENERIC_ERROR: 'Something went wrong. Please try again.',
  SPEECH_NOT_DETECTED: 'No speech detected. Please try speaking again.',
  MICROPHONE_ERROR: 'Unable to access microphone. Please check permissions.',
} as const

// Success Messages
export const SUCCESS_MESSAGES = {
  PROFILE_UPDATED: 'Profile updated successfully!',
  PROGRESS_SAVED: 'Progress saved!',
  SPEECH_ANALYZED: 'Speech analyzed successfully!',
} as const 