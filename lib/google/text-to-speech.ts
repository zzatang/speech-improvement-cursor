import { TextToSpeechClient, protos } from '@google-cloud/text-to-speech';
import fs from 'fs';
import path from 'path';

// Define types for TTS requests
export interface TTSRequest {
  text: string;
  voiceName?: string;
  languageCode?: string;
  speakingRate?: number;
  pitch?: number;
  childFriendly?: boolean;
  useSsml?: boolean;
}

export interface TTSResponse {
  audioContent: Uint8Array | null;
  error?: string;
  generatedText?: string; // The text that was used to generate the audio
}

// Helper function to load credentials manually
const loadCredentials = () => {
  const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!credentialsPath) {
    throw new Error('GOOGLE_APPLICATION_CREDENTIALS environment variable is not set.');
  }
  const absolutePath = path.resolve(process.cwd(), credentialsPath);
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Credentials file not found at: ${absolutePath}`);
  }
  const credentialsFile = fs.readFileSync(absolutePath, 'utf-8');
  const credentials = JSON.parse(credentialsFile);
  if (!credentials.client_email || !credentials.private_key || !credentials.project_id) {
      throw new Error('Credentials file is missing client_email, private_key, or project_id');
  }
  return credentials;
};

// Create a client with manually loaded Google credentials
const createTTSClient = () => {
  const credentials = loadCredentials();
  // Explicitly pass essential credentials
  return new TextToSpeechClient({
    credentials: {
      client_email: credentials.client_email,
      private_key: credentials.private_key,
    },
    projectId: credentials.project_id
  });
};

/**
 * Synthesizes text to speech using Google Cloud TTS
 * @param options - The text and voice configuration options
 * @returns An object containing the audio content or an error
 */
export async function synthesizeSpeech(options: TTSRequest): Promise<TTSResponse> {
  try {
    const client = createTTSClient();
    
    // Default configuration for child-friendly Australian accent
    const defaultVoiceName = process.env.GOOGLE_TTS_VOICE_NAME || 'en-AU-Neural2-B';
    const defaultLanguageCode = process.env.GOOGLE_TTS_LANGUAGE_CODE || 'en-AU';
    const defaultSpeakingRate = parseFloat(process.env.GOOGLE_TTS_SPEAKING_RATE || '0.9');
    
    // Configure the TTS request
    const request: protos.google.cloud.texttospeech.v1.ISynthesizeSpeechRequest = {
      // Use ssml or text based on options
      input: options.useSsml 
        ? { ssml: options.text } 
        : { text: options.text },
      voice: {
        name: options.voiceName || defaultVoiceName,
        languageCode: options.languageCode || defaultLanguageCode,
      },
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: options.speakingRate || defaultSpeakingRate,
        pitch: options.pitch || 0,
      },
    };
    
    // Apply child-friendly audio effects if requested
    if (options.childFriendly !== false) {
      request.audioConfig!.effectsProfileId = ['small-bluetooth-speaker-class-device'];
    }
    
    // Make the API call
    const [response] = await client.synthesizeSpeech(request);
    
    // Convert string to Uint8Array if necessary
    const audioContent = response.audioContent ? 
      (typeof response.audioContent === 'string' 
        ? Buffer.from(response.audioContent) 
        : response.audioContent) 
      : null;
    
    return { audioContent };
  } catch (error) {
    return {
      audioContent: null,
      error: error instanceof Error ? error.message : 'Unknown error during speech synthesis'
    };
  }
}

/**
 * Gets available voices from Google Cloud TTS
 * @param languageCode - Optional language code to filter voices
 * @returns Array of available voices
 */
export async function getAvailableVoices(languageCode?: string): Promise<any[]> {
  try {
    const client = createTTSClient();
    
    // Get list of voices, optionally filtered by language
    const [result] = await client.listVoices({
      languageCode: languageCode || process.env.GOOGLE_TTS_LANGUAGE_CODE || 'en-AU',
    });
    
    return result.voices || [];
  } catch (error) {
    return [];
  }
}

/**
 * Helper to format a phrase for better TTS pronunciation
 * @param text - The input text
 * @returns Formatted text for better TTS results
 */
export function formatForTTS(text: string): string {
  // Add pause markers at punctuation
  const withPauses = text
    .replace(/\./g, '.')
    .replace(/\,/g, ',')
    .replace(/\?/g, '?')
    .replace(/\!/g, '!')
    .replace(/\:/g, ':');
  
  // Simply return the text - we'll use natural pauses instead of SSML
  return withPauses;
}

/**
 * Generates audio for speech exercises focused on specific sounds
 * @param sound - The target sound to practice (r, s, th, etc.)
 * @param difficulty - The difficulty level (1-3)
 * @returns Promise with TTS response
 */
export async function generatePracticeSpeech(sound: string, difficulty: number = 1): Promise<TTSResponse> {
  // Sample phrases for different sounds and difficulty levels
  const phrases: Record<string, string[][]> = {
    'r': [
      // Level 1 (easy)
      ['Red roses are really remarkable.', 'Rabbits run around the garden.', 'Rivers run through rolling hills.'],
      // Level 2 (medium)
      ['The rabbit ran around the red car quickly.', 'Remember to read your book report carefully.', 'Ryan rides his bicycle around the railroad.'],
      // Level 3 (hard)
      ['Robert really rushed to reach the rural road riding rapidly.', 'The remarkable raccoon ran rapidly through the raspberry bushes.', 'Round river rocks rarely roll rapidly down rural roads.']
    ],
    's': [
      // Level 1
      ['Sally sells seashells.', 'Six snakes slither slowly.', 'Sunny days make me smile.'],
      // Level 2
      ['Susan sits silently sorting silver stones.', 'Sam sells sweet snacks at the school store.', 'Several seagulls soared across the sunset sky.'],
      // Level 3
      ['Seven silly sisters silently swam across the sparkling stream on a sensational summer Saturday.', 'Skillful sailors successfully steered the ship through stormy seas.', 'Simon says standing still silently seems surprisingly simple, said Sam.']
    ],
    'th': [
      // Level 1
      ['Think about things.', 'This and that.', 'Three thick thumbs.'],
      // Level 2
      ['The three thieves thought thoroughly.', 'Those things there are worth thirty-three dollars.', 'Thank you for the birthday present.'],
      // Level 3
      ['Theo thoughtfully threaded through thirty thorny bushes to get to the theater.', 'The thermometer shows that the weather is warmer than yesterday.', 'I think that these theories are worth thorough thought.']
    ],
    'l': [
      // Level 1
      ['Lovely leaves fall lightly.', 'Little lions laugh loudly.', 'Look at the lamp light.'],
      // Level 2
      ['Lucy likes to look at lovely blue lilies.', 'The little lamb loves playing.', 'Liam listened to lullabies.'],
      // Level 3
      ['Lincoln led the leaping lizards along the lane.', 'Luna sang a lullaby to the laughing lemur.', 'Laura looked through the library for a letter.']
    ]
  };
  
  // Ensure sound parameter is valid and non-empty
  const soundKey = sound ? sound.toLowerCase() : '';
  
  // Check if sound exists in our phrases dictionary
  if (!soundKey || !Object.keys(phrases).includes(soundKey)) {
    // Default to 'r' sound if the requested sound isn't available
    const defaultPhrase = phrases['r'][0][0]; // Use first easy 'r' phrase
    return synthesizeSpeech({
      text: formatForTTS(defaultPhrase),
      childFriendly: true,
      speakingRate: 0.8
    }).then(response => ({
      ...response,
      generatedText: defaultPhrase
    }));
  }
  
  // Ensure difficulty is between 1-3
  const level = Math.min(Math.max(difficulty, 1), 3) - 1;
  
  // Select a random phrase from the appropriate category
  const options = phrases[soundKey][level];
  const selectedPhrase = options[Math.floor(Math.random() * options.length)];
  
  // Use the text without SSML markup
  const formattedText = formatForTTS(selectedPhrase);
  
  // Generate the speech
  const response = await synthesizeSpeech({
    text: formattedText,
    childFriendly: true,
    // Slightly slower speech for practice
    speakingRate: 0.8 - (level * 0.1) // Slow down for harder levels
  });
  
  // Return the response with the generated text
  return {
    ...response,
    generatedText: selectedPhrase
  };
} 