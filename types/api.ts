// API Response Types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Speech Recognition Types
export interface SpeechRecognitionRequest {
  audio: Blob
  targetText?: string
  languageCode?: string
}

export interface SpeechRecognitionResponse {
  transcript: string
  confidence: number
  error?: string
  wordTimeOffsets?: Array<{
    word: string
    startTime: number
    endTime: number
  }>
}

// Text-to-Speech Types
export interface TTSRequest {
  text: string
  voiceName?: string
  languageCode?: string
  speakingRate?: number
}

export interface TTSVoice {
  name: string
  languageCode: string
  ssmlGender: 'MALE' | 'FEMALE' | 'NEUTRAL'
  naturalSampleRateHertz: number
}

export interface TTSVoicesResponse {
  voices: TTSVoice[]
}

// Error Types
export interface ApiError {
  error: string
  details?: string
  statusCode?: number
} 