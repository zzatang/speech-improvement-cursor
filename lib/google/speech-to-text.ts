import { SpeechClient } from '@google-cloud/speech';
import { google } from '@google-cloud/speech/build/protos/protos';
import fs from 'fs';
import path from 'path';

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
  targetText?: string;
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
  pronunciationAssessment?: any;
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

/**
 * Create a STT client with credentials from environment
 * - Uses GOOGLE_CLOUD_CREDENTIALS as a JSON string
 */
function createSTTClient() {
  // Get credentials from environment variable
  const credentials = process.env.GOOGLE_CLOUD_CREDENTIALS;
  
  if (!credentials) {
    console.warn('Missing Google Cloud credentials. Using fallback mock STT client.');
    return createMockSTTClient();
  }
  
  try {
    // Create client directly using the credentials string
    return new SpeechClient({ 
      credentials: JSON.parse(credentials),
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID 
    });
  } catch (error) {
    console.error('Error creating Google Cloud STT client:', error);
    console.warn('Falling back to mock STT client due to credentials error');
    return createMockSTTClient();
  }
}

/**
 * Creates a mock STT client for development
 */
function createMockSTTClient() {
  return {
    recognize: async () => {
      // Return a simple mock response
      return [
        {
          results: [
            {
              alternatives: [
                {
                  transcript: 'This is a mock transcription.',
                  confidence: 0.95,
                  words: [
                    { word: 'This', startTime: { seconds: 0 }, endTime: { seconds: 0.5 } },
                    { word: 'is', startTime: { seconds: 0.5 }, endTime: { seconds: 0.7 } },
                    { word: 'a', startTime: { seconds: 0.7 }, endTime: { seconds: 0.8 } },
                    { word: 'mock', startTime: { seconds: 0.8 }, endTime: { seconds: 1.2 } },
                    { word: 'transcription', startTime: { seconds: 1.2 }, endTime: { seconds: 2 } }
                  ],
                  pronunciationAssessment: {
                    pronunciationScore: 85,
                    wordScores: []
                  }
                }
              ]
            }
          ]
        }
      ];
    }
  };
}

/**
 * Transcribes audio to text using Google Cloud STT
 * @param options - The audio and configuration options
 * @returns An object containing the transcription, confidence and optional word timing info
 */
export async function transcribeSpeech(options: STTRequest): Promise<STTResponse> {
  try {
    const client = createSTTClient();
    
    // Default configuration values
    const defaultLanguageCode = process.env.GOOGLE_STT_LANGUAGE_CODE || 'en-AU';
    const defaultEnablePunctuation = process.env.GOOGLE_STT_ENABLE_AUTOMATIC_PUNCTUATION === 'true';
    const defaultEnableWordTimings = process.env.GOOGLE_STT_ENABLE_WORD_TIME_OFFSETS === 'true';
    
    // Configure the STT request
    const request: google.cloud.speech.v1.IRecognizeRequest = {
      config: {
        languageCode: options.languageCode || defaultLanguageCode,
        encoding: 'WEBM_OPUS',
        enableAutomaticPunctuation: options.enableAutomaticPunctuation !== undefined 
          ? options.enableAutomaticPunctuation 
          : defaultEnablePunctuation,
        enableWordTimeOffsets: options.enableWordTimeOffsets !== undefined 
          ? options.enableWordTimeOffsets 
          : defaultEnableWordTimings,
        features: options.targetText ? {
          pronunciationAssessment: {
            referenceText: options.targetText,
            gradingSystem: '100POINT_GRADING_SYSTEM',
            granularity: 'PHONEME',
            dimension: 'ALL'
          }
        } : undefined 
      } as any,
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
    
    // Extract pronunciation assessment with type assertion
    const pronunciationAssessment = (alternative as any).pronunciationAssessment;
    
    // Format word timings if available
    const wordTimings = alternative.words?.map(word => ({
      word: word.word || '',
      startTime: typeof word.startTime?.seconds === 'number' ? word.startTime.seconds : 0,
      endTime: typeof word.endTime?.seconds === 'number' ? word.endTime.seconds : 0
    }));
    
    // Create response object, including assessment
    const sttResponse: STTResponse = {
      transcript: alternative.transcript || '',
      confidence: alternative.confidence || 0,
      pronunciationAssessment: pronunciationAssessment // Assign the assessment result
    };
    
    // Add word timings if available
    if (wordTimings && wordTimings.length > 0) {
      sttResponse.wordTimings = wordTimings;
    }
    
    // Add phonetic analysis if transcript is not empty
    if (sttResponse.transcript && pronunciationAssessment) {
      // Pass the assessment score object to analyzePhonetics
      sttResponse.phoneticAnalysis = analyzePhonetics(pronunciationAssessment);
    } else if (sttResponse.transcript) {
      // Basic analysis if no assessment score (might need refinement)
      sttResponse.phoneticAnalysis = {
        sounds: {},
        overallScore: 50, // Placeholder
        suggestions: ["Pronunciation details unavailable."]
      };
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
 * @param pronunciationAssessment - The pronunciation assessment object from Google API
 * @returns Analysis of phonetic accuracy and areas for improvement
 */
function analyzePhonetics(pronunciationAssessment: any): PhoneticAnalysis {
  const overallScore = pronunciationAssessment?.pronunciationScore;

  let suggestions: string[] = [];
  let calculatedScore = 50; // Default score if extraction fails

  if (typeof overallScore === 'number' && overallScore >= 0 && overallScore <= 100) {
      calculatedScore = Math.round(overallScore);
      // Generate suggestions based on the actual score
      if (calculatedScore >= 90) {
          suggestions.push("Excellent pronunciation!");
      } else if (calculatedScore >= 70) {
          suggestions.push("Good pronunciation, keep practicing clarity.");
      } else {
          suggestions.push("Focus on clearer pronunciation of each word.");
      }
      // TODO: Add more detailed suggestions by analyzing phonemeScores or wordScores 
      // within the pronunciationAssessment object if needed.
      // e.g., const phonemeScores = pronunciationAssessment?.phonemes;

  } else {
      // Handle cases where the score is missing or invalid
      console.warn("Could not extract valid overall pronunciation score from assessment object.");
      suggestions.push("Detailed pronunciation analysis unavailable for this recording.");
      // Keep calculatedScore at default 50
  }
  
  return {
    sounds: {}, // Placeholder - phoneme/sound analysis not implemented here yet
    overallScore: calculatedScore,
    suggestions: suggestions
  };
}

/**
 * Analyzes a specific target sound in a recording for speech practice
 * @param transcript - The transcribed text
 * @param targetSound - The sound being practiced (r, s, th, l)
 * @param targetPhrase - The expected phrase that should have been spoken
 * @returns Focused analysis on the target sound
 */
export function analyzeTargetSound(
  transcript: string, 
  targetSound: string,
  targetPhrase?: string
): {
  accuracy: number;
  correctWords: string[];
  incorrectWords: string[];
  suggestions: string[];
  phraseMatch?: number;
} {
  console.log(`Analyzing target sound "${targetSound}" in transcript: "${transcript}"`);
  if (targetPhrase) {
    console.log(`Target phrase: "${targetPhrase}"`);
  }
  
  const fullAnalysis = analyzePhonetics(transcript);
  
  // Normalize target sound
  const normalizedTarget = targetSound.toLowerCase();
  
  // First, check if the user said something completely different from the target phrase
  let phraseMatchScore = 100;
  if (targetPhrase) {
    // Calculate similarity between transcript and target phrase
    phraseMatchScore = calculatePhraseMatchScore(transcript, targetPhrase);
    console.log(`Phrase match score: ${phraseMatchScore}%`);
    
    // If the user said something completely different, provide feedback about that first
    if (phraseMatchScore < 50) {
      // They said something very different from the target phrase
      return {
        accuracy: Math.min(50, phraseMatchScore), // Cap accuracy based on phrase match
        correctWords: [],
        incorrectWords: [],
        suggestions: [
          `Try to say the exact phrase: "${targetPhrase}"`,
          "Make sure you're repeating the phrase shown on the screen."
        ],
        phraseMatch: phraseMatchScore
      };
    }
  }
  
  // If the target sound isn't one we analyze, return default values
  if (!fullAnalysis.sounds[normalizedTarget]) {
    console.log(`Target sound "${normalizedTarget}" is not in our analysis set`);
    return {
      accuracy: Math.min(80, phraseMatchScore), // Cap accuracy based on phrase match
      correctWords: [],
      incorrectWords: [],
      suggestions: ["Try to focus more on the target sound."],
      phraseMatch: phraseMatchScore
    };
  }
  
  const targetAnalysis = fullAnalysis.sounds[normalizedTarget];
  console.log(`Sound analysis for "${normalizedTarget}":`, JSON.stringify(targetAnalysis));
  
  // Extract correct and incorrect words
  const allWords = transcript.toLowerCase().split(/\s+/);
  const pattern = new RegExp(`\\b\\w*${normalizedTarget}\\w*\\b`, 'g');
  
  const wordsWithTargetSound = allWords.filter(word => word.match(pattern));
  console.log(`Words with target sound "${normalizedTarget}":`, wordsWithTargetSound);
  
  // If we have a target phrase, check which expected words were correctly spoken
  let expectedWords: string[] = [];
  if (targetPhrase) {
    expectedWords = targetPhrase.toLowerCase().split(/\s+/).filter(word => word.match(pattern));
    console.log(`Expected words with target sound "${normalizedTarget}" from target phrase:`, expectedWords);
    
    // If we don't find any of the expected words that should have the target sound
    if (expectedWords.length > 0 && !expectedWords.some(word => allWords.includes(word))) {
      console.log(`None of the expected words with target sound were found in transcript`);
      return {
        accuracy: Math.min(40, phraseMatchScore), // Cap accuracy based on phrase match
        correctWords: [],
        incorrectWords: expectedWords,
        suggestions: [
          `Try saying the phrase again, focusing on words with the '${normalizedTarget}' sound like: ${expectedWords.join(', ')}`,
          "Make sure you're pronouncing each word in the phrase clearly."
        ],
        phraseMatch: phraseMatchScore
      };
    }
  }
  
  // Manual checks for specific sound patterns
  let incorrectWords: string[] = [];
  let correctWords: string[] = [];
  
  // For 'l' sounds, check for common substitutions that might not be caught by the general analyzer
  if (normalizedTarget === 'l') {
    // Patterns for common 'l' sound substitutions
    const lSubstitutions = [/\b\w*w\w*\b/g, /\b\w*y\w*\b/g]; 
    
    for (const word of wordsWithTargetSound) {
      let isIncorrect = false;
      
      // Check each word with 'l' sound against substitution patterns
      for (const substPattern of lSubstitutions) {
        if (word.match(substPattern)) {
          incorrectWords.push(word);
          isIncorrect = true;
          break;
        }
      }
      
      // If the word contains 'l' but hasn't been marked as incorrect yet, do a deeper check
      if (!isIncorrect) {
        // Check for common pronunciation errors with 'l' sounds that might be missed
        // For example, "light" pronounced as "wight", "yellow" as "yewwow"
        // We'll use a simple heuristic: if a word has both 'l' and 'w', it might be a mispronunciation
        if (word.includes('l') && word.includes('w')) {
          incorrectWords.push(word);
        } else {
          correctWords.push(word);
        }
      }
    }
  } else {
    // Use the standard analysis for other sounds
    incorrectWords = targetAnalysis.problematic;
    correctWords = wordsWithTargetSound.filter(word => !incorrectWords.includes(word));
  }
  
  console.log(`Correct words for "${normalizedTarget}":`, correctWords);
  console.log(`Incorrect words for "${normalizedTarget}":`, incorrectWords);
  
  // Calculate a more accurate percentage for 'l' sounds
  let accuracy = targetAnalysis.percentage;
  if (normalizedTarget === 'l' && wordsWithTargetSound.length > 0) {
    accuracy = Math.round((correctWords.length / wordsWithTargetSound.length) * 100);
    console.log(`Recalculated accuracy for "l" sound: ${accuracy}%`);
    
    // Ensure we never give 100% for 'l' sounds unless we're certain
    if (accuracy === 100 && wordsWithTargetSound.length < 3) {
      accuracy = 90; // More conservative estimate with limited samples
      console.log(`Adjusted accuracy to more conservative estimate: ${accuracy}%`);
    }
  }
  
  // If we have a target phrase, adjust accuracy based on phrase match score
  if (targetPhrase) {
    // Weight the accuracy: 60% sound accuracy, 40% phrase match
    accuracy = Math.round((accuracy * 0.6) + (phraseMatchScore * 0.4));
    console.log(`Final weighted accuracy (sound + phrase match): ${accuracy}%`);
  }
  
  // Generate focused suggestions
  const suggestions: string[] = [];
  
  if (accuracy < 70) {
    suggestions.push(getSuggestionTemplate(normalizedTarget));
    
    // Add specific word practice suggestion if we have problematic words
    if (incorrectWords.length > 0) {
      suggestions.push(`Try practicing these words: ${incorrectWords.slice(0, 3).join(', ')}`);
    }
    
    // If there was a phrase match issue, add that suggestion
    if (targetPhrase && phraseMatchScore < 80) {
      suggestions.push(`Make sure to say the full phrase: "${targetPhrase}"`);
    }
  } else if (accuracy < 90) {
    if (wordsWithTargetSound.length > 0) {
      suggestions.push(`Good job with the '${normalizedTarget}' sound! Try to focus on clarity when saying words like ${wordsWithTargetSound.slice(0, 2).join(', ')}.`);
    } else {
      suggestions.push(`Good job, but try to include more words with the '${normalizedTarget}' sound in your practice.`);
    }
  } else {
    suggestions.push(`Great job with the '${normalizedTarget}' sound! Keep practicing to master it completely.`);
  }
  
  return {
    accuracy,
    correctWords,
    incorrectWords,
    suggestions,
    phraseMatch: phraseMatchScore
  };
}

/**
 * Calculate a similarity score between two phrases
 * @param transcribed - The transcribed text from the user
 * @param target - The target phrase they should have said
 * @returns A score from 0-100 representing percentage match
 */
function calculatePhraseMatchScore(transcribed: string, target: string): number {
  // Normalize both strings - lowercase and remove punctuation
  const normalize = (str: string) => str.toLowerCase().replace(/[^\w\s]/g, '').trim();
  
  const normalizedTranscribed = normalize(transcribed);
  const normalizedTarget = normalize(target);
  
  // Split into words
  const transcribedWords = normalizedTranscribed.split(/\s+/);
  const targetWords = normalizedTarget.split(/\s+/);
  
  // Count how many target words appear in the transcription
  let matchedWords = 0;
  for (const targetWord of targetWords) {
    if (transcribedWords.includes(targetWord)) {
      matchedWords++;
    }
  }
  
  // Calculate percentage of target words present
  const percentageWordsPresent = (matchedWords / targetWords.length) * 100;
  
  // Calculate length difference penalty
  const lengthDiff = Math.abs(transcribedWords.length - targetWords.length);
  const lengthPenalty = (lengthDiff / Math.max(targetWords.length, 1)) * 25; // Max 25% penalty
  
  // Calculate word order similarity
  let orderScore = 100;
  if (matchedWords >= 2) {
    // Only calculate order if we have at least 2 matches
    const targetIndices = new Map<string, number>();
    targetWords.forEach((word, index) => {
      if (!targetIndices.has(word)) {
        targetIndices.set(word, index);
      }
    });
    
    // Get indices of matched words in both sequences
    const matchedPairs: [number, number][] = [];
    transcribedWords.forEach((word, transIndex) => {
      if (targetIndices.has(word)) {
        matchedPairs.push([transIndex, targetIndices.get(word)!]);
      }
    });
    
    // Count inversions (words out of order)
    let inversions = 0;
    for (let i = 0; i < matchedPairs.length; i++) {
      for (let j = i + 1; j < matchedPairs.length; j++) {
        if (matchedPairs[i][1] > matchedPairs[j][1]) {
          inversions++;
        }
      }
    }
    
    // Calculate order penalty (max 15%)
    const maxPossibleInversions = (matchedPairs.length * (matchedPairs.length - 1)) / 2;
    const orderPenalty = maxPossibleInversions > 0 
      ? (inversions / maxPossibleInversions) * 15 
      : 0;
      
    orderScore = 100 - orderPenalty;
  }
  
  // Final score is weighted combination
  const finalScore = percentageWordsPresent * 0.7 - lengthPenalty + (orderScore * 0.3);
  
  // Ensure score is between 0-100
  return Math.max(0, Math.min(100, Math.round(finalScore)));
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