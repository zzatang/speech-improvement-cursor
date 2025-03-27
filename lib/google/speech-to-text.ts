import { SpeechClient } from '@google-cloud/speech';
import { google } from '@google-cloud/speech/build/protos/protos';

// Define interface for sound analysis
interface SoundAnalysis {
  correct: number;
  total: number;
  percentage: number;
  problematic: string[];
}

// Define types for STT requests
export interface STTRequest {
  audioContent: Buffer | Uint8Array;
  languageCode?: string;
  enableAutomaticPunctuation?: boolean;
  enableWordTimeOffsets?: boolean;
  model?: string;
  singleUtterance?: boolean;
}

export interface PhoneticAnalysis {
  sounds: Record<string, SoundAnalysis>;
  overallScore: number;
  suggestions: string[];
}

export interface STTResponse {
  transcript: string;
  confidence: number;
  wordTimings?: Array<{
    word: string;
    startTime: number;
    endTime: number;
  }>;
  phoneticAnalysis?: PhoneticAnalysis;
  error?: string;
}

// Interface for substitutions
interface SoundSubstitutions {
  r: string[];
  s: string[];
  th: string[];
  l: string[];
  [key: string]: string[];
}

// Create a client with Google credentials from environment variables
const createSTTClient = (): SpeechClient => {
  try {
    const credentials = JSON.parse(process.env.GOOGLE_CLOUD_CREDENTIALS || '{}');
    
    return new SpeechClient({
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
      credentials
    });
  } catch (error) {
    console.error('Error creating STT client:', error);
    throw new Error('Failed to initialize Google Cloud Speech-to-Text client');
  }
};

/**
 * Transcribes audio to text using Google Cloud STT
 * @param options - The audio and configuration options
 * @returns An object containing the transcription, confidence and optional word timing info
 */
export async function transcribeSpeech(options: STTRequest): Promise<STTResponse> {
  try {
    const client = createSTTClient();
    
    // Default configuration for Australian accent speech recognition
    const defaultLanguageCode = process.env.GOOGLE_STT_LANGUAGE_CODE || 'en-AU';
    const defaultModel = process.env.GOOGLE_STT_MODEL || 'command_and_search';
    const defaultEnablePunctuation = process.env.GOOGLE_STT_ENABLE_AUTOMATIC_PUNCTUATION === 'true';
    const defaultEnableWordTimings = process.env.GOOGLE_STT_ENABLE_WORD_TIME_OFFSETS === 'true';
    
    // Configure the STT request
    const request: google.cloud.speech.v1.IRecognizeRequest = {
      config: {
        languageCode: options.languageCode || defaultLanguageCode,
        model: options.model || defaultModel,
        enableAutomaticPunctuation: options.enableAutomaticPunctuation !== undefined 
          ? options.enableAutomaticPunctuation 
          : defaultEnablePunctuation,
        enableWordTimeOffsets: options.enableWordTimeOffsets !== undefined 
          ? options.enableWordTimeOffsets 
          : defaultEnableWordTimings,
      },
      audio: {
        content: options.audioContent instanceof Buffer 
          ? options.audioContent.toString('base64')
          : Buffer.from(options.audioContent).toString('base64')
      }
    };
    
    // Make the API call
    const [response] = await client.recognize(request);
    
    // Check if we have results
    if (!response.results || response.results.length === 0) {
      return {
        transcript: '',
        confidence: 0,
        error: 'No speech detected'
      };
    }
    
    // Extract primary result
    const result = response.results[0];
    const alternative = result.alternatives && result.alternatives[0];
    
    if (!alternative) {
      return {
        transcript: '',
        confidence: 0,
        error: 'No transcription alternatives found'
      };
    }
    
    // Format word timings if available
    const wordTimings = alternative.words?.map(word => ({
      word: word.word || '',
      startTime: typeof word.startTime?.seconds === 'number' ? word.startTime.seconds : 0,
      endTime: typeof word.endTime?.seconds === 'number' ? word.endTime.seconds : 0
    }));
    
    // Create response object
    const sttResponse: STTResponse = {
      transcript: alternative.transcript || '',
      confidence: alternative.confidence || 0
    };
    
    // Add word timings if available
    if (wordTimings && wordTimings.length > 0) {
      sttResponse.wordTimings = wordTimings;
    }
    
    // Add phonetic analysis if transcript is not empty
    if (sttResponse.transcript) {
      sttResponse.phoneticAnalysis = analyzePhonetics(sttResponse.transcript);
    }
    
    return sttResponse;
  } catch (error) {
    console.error('Error transcribing speech:', error);
    return {
      transcript: '',
      confidence: 0,
      error: error instanceof Error ? error.message : 'Unknown error during speech transcription'
    };
  }
}

/**
 * Analyzes speech for common phonetic issues in children with speech impediments
 * @param transcript - The transcribed text to analyze
 * @returns Analysis of phonetic accuracy and areas for improvement
 */
function analyzePhonetics(transcript: string): PhoneticAnalysis {
  const text = transcript.toLowerCase();
  
  // Initialize sounds to analyze
  const sounds: Record<string, SoundAnalysis> = {
    'r': { correct: 0, total: 0, percentage: 0, problematic: [] },
    's': { correct: 0, total: 0, percentage: 0, problematic: [] },
    'th': { correct: 0, total: 0, percentage: 0, problematic: [] },
    'l': { correct: 0, total: 0, percentage: 0, problematic: [] }
  };
  
  // Word patterns for detection
  const patterns: Record<string, RegExp> = {
    'r': /\b\w*r\w*\b/g,
    's': /\b\w*s\w*\b/g,
    'th': /\b\w*th\w*\b/g,
    'l': /\b\w*l\w*\b/g
  };
  
  // Common substitutions children make
  const substitutions: SoundSubstitutions = {
    'r': ['w'],
    's': ['th'],
    'th': ['f', 'd'],
    'l': ['w', 'y']
  };
  
  // List of words in the transcript
  const words = text.split(/\s+/);
  
  // Analyze each sound
  Object.entries(patterns).forEach(([sound, pattern]) => {
    // Find all words that should contain this sound
    const matchedWords = words.filter(word => word.match(pattern));
    sounds[sound].total = matchedWords.length;
    
    // Check for potential mispronunciations based on common substitutions
    matchedWords.forEach(word => {
      let potentiallyMispronounced = false;
      
      // Check if the word might contain a common substitution for this sound
      if (substitutions[sound]) {
        substitutions[sound].forEach(sub => {
          if (word.includes(sub)) {
            potentiallyMispronounced = true;
            sounds[sound].problematic.push(word);
          }
        });
      }
      
      // If not flagged as mispronounced, count as correct
      if (!potentiallyMispronounced) {
        sounds[sound].correct++;
      }
    });
    
    // Calculate accuracy percentage
    sounds[sound].percentage = sounds[sound].total > 0 
      ? Math.round((sounds[sound].correct / sounds[sound].total) * 100) 
      : 100;
  });
  
  // Calculate overall score (weighted average)
  let totalSounds = 0;
  let correctSounds = 0;
  
  Object.values(sounds).forEach(sound => {
    totalSounds += sound.total;
    correctSounds += sound.correct;
  });
  
  const overallScore = totalSounds > 0 
    ? Math.round((correctSounds / totalSounds) * 100) 
    : 100;
  
  // Generate suggestions based on problematic sounds
  const suggestions: string[] = [];
  
  Object.entries(sounds).forEach(([sound, data]) => {
    if (data.percentage < 70 && data.total > 0) {
      const suggestionTemplate = getSuggestionTemplate(sound);
      suggestions.push(suggestionTemplate);
    }
  });
  
  // Add a general suggestion for good performance
  if (suggestions.length === 0 && overallScore > 80) {
    suggestions.push("Great job! Your pronunciation is very clear. Keep practicing to maintain your skills.");
  }
  
  return {
    sounds,
    overallScore,
    suggestions
  };
}

/**
 * Gets a suggestion template for improving a specific sound
 * @param sound - The sound that needs improvement
 * @returns A suggestion string
 */
function getSuggestionTemplate(sound: string): string {
  const templates: Record<string, string> = {
    'r': "Try practicing the 'R' sound by placing your tongue near the roof of your mouth and making a growling sound.",
    's': "For a clearer 'S' sound, try placing the tip of your tongue behind your top teeth and blowing air out gently.",
    'th': "For the 'TH' sound, place your tongue between your teeth and blow air out while making a soft sound.",
    'l': "To make the 'L' sound correctly, place the tip of your tongue on the ridge behind your top teeth."
  };
  
  return templates[sound] || `Try practicing words with the '${sound}' sound more carefully.`;
}

/**
 * Analyzes a specific target sound in a recording for speech practice
 * @param transcript - The transcribed text
 * @param targetSound - The sound being practiced (r, s, th, l)
 * @returns Focused analysis on the target sound
 */
export function analyzeTargetSound(transcript: string, targetSound: string): {
  accuracy: number;
  correctWords: string[];
  incorrectWords: string[];
  suggestions: string[];
} {
  const fullAnalysis = analyzePhonetics(transcript);
  
  // Normalize target sound
  const normalizedTarget = targetSound.toLowerCase();
  
  // If the target sound isn't one we analyze, return default values
  if (!fullAnalysis.sounds[normalizedTarget]) {
    return {
      accuracy: 100,
      correctWords: [],
      incorrectWords: [],
      suggestions: ["Great job!"]
    };
  }
  
  const targetAnalysis = fullAnalysis.sounds[normalizedTarget];
  
  // Extract correct and incorrect words
  const allWords = transcript.toLowerCase().split(/\s+/);
  const pattern = new RegExp(`\\b\\w*${normalizedTarget}\\w*\\b`, 'g');
  
  const wordsWithTargetSound = allWords.filter(word => word.match(pattern));
  const incorrectWords = targetAnalysis.problematic;
  const correctWords = wordsWithTargetSound.filter(word => !incorrectWords.includes(word));
  
  // Generate focused suggestions
  const suggestions: string[] = [];
  
  if (targetAnalysis.percentage < 70) {
    suggestions.push(getSuggestionTemplate(normalizedTarget));
    
    // Add specific word practice suggestion if we have problematic words
    if (incorrectWords.length > 0) {
      suggestions.push(`Try practicing these words: ${incorrectWords.join(', ')}`);
    }
  } else {
    suggestions.push(`Great job with the '${normalizedTarget}' sound! Keep practicing to master it completely.`);
  }
  
  return {
    accuracy: targetAnalysis.percentage,
    correctWords,
    incorrectWords,
    suggestions
  };
} 