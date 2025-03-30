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