import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import fs from 'fs';
import path from 'path';

// Helper function to load credentials manually
const loadCredentials = () => {
  const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!credentialsPath) {
    throw new Error('GOOGLE_APPLICATION_CREDENTIALS environment variable is not set.');
  }
  // Resolve the path relative to the project root
  const absolutePath = path.resolve(process.cwd(), credentialsPath);
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Credentials file not found at: ${absolutePath}`);
  }
  const credentialsFile = fs.readFileSync(absolutePath, 'utf-8');
  const credentials = JSON.parse(credentialsFile);
  if (!credentials.client_email || !credentials.private_key) {
      throw new Error('Credentials file is missing client_email or private_key');
  }
  return credentials;
};

// Create a client with manually loaded Google credentials
const createTTSClient = () => {
  const credentials = loadCredentials();
  // Explicitly pass only client_email and private_key
  return new TextToSpeechClient({
    credentials: {
      client_email: credentials.client_email,
      private_key: credentials.private_key,
    },
    // We might need to explicitly provide the project ID here when not using the full credentials object
    projectId: credentials.project_id 
  });
};

// TTS configuration options
interface TTSOptions {
  text: string;
  voiceName?: string;
  languageCode?: string;
  speakingRate?: number;
}

/**
 * Handles POST requests to synthesize speech
 * Expected body format: { text: string, voiceName?: string, languageCode?: string, speakingRate?: number }
 */
export async function POST(request: Request) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401 }
      );
    }

    // Get request data
    const body = await request.json() as TTSOptions;
    
    if (!body.text) {
      return new NextResponse(
        JSON.stringify({ error: 'Text is required' }),
        { status: 400 }
      );
    }

    console.log('[TTS API] GOOGLE_APPLICATION_CREDENTIALS:', process.env.GOOGLE_APPLICATION_CREDENTIALS);

    // Create TTS client
    const client = createTTSClient();

    // Configure TTS request
    const [response] = await client.synthesizeSpeech({
      input: { text: body.text },
      voice: {
        name: body.voiceName || process.env.GOOGLE_TTS_VOICE_NAME || 'en-AU-Neural2-B',
        languageCode: body.languageCode || process.env.GOOGLE_TTS_LANGUAGE_CODE || 'en-AU',
      },
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: body.speakingRate || parseFloat(process.env.GOOGLE_TTS_SPEAKING_RATE || '0.9'),
        pitch: 0,
        // Additional configurations for kid-friendly voice
        effectsProfileId: ['small-bluetooth-speaker-class-device'],
      },
    });

    // Return audio content with appropriate headers
    return new NextResponse(response.audioContent, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=86400', // Cache for 1 day
      },
    });
  } catch (error) {
    console.error('TTS API Error:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: 'Failed to generate speech',
        details: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}

/**
 * Handles GET requests to get available voices
 */
export async function GET(request: Request) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401 }
      );
    }

    // Create TTS client - Temporarily commented out to isolate the error source
    // const client = createTTSClient(); 
    
    // Define the expected type for a formatted voice object
    interface FormattedVoice {
        name: string | null | undefined;
        languageCode: string | null | undefined;
        ssmlGender: any; // Keeping simple for temporary fix
        naturalSampleRateHertz: number | null | undefined;
    }

    // Get list of voices - This will now fail, but we're testing the error log
    // const [result] = await client.listVoices({
    //   languageCode: process.env.GOOGLE_TTS_LANGUAGE_CODE || 'en-AU',
    // });
    
    // Temporarily return empty voices (correctly typed) to avoid crashing the GET handler
    const voices: FormattedVoice[] = []; 
    
    // Filter and format the voice data, prioritizing Australian voices - Temporarily commented out
    /*
    const formattedVoices = voices.map(voice => ({
      name: voice.name,
      languageCode: voice.languageCodes?.[0], // Original code caused lint error here
      ssmlGender: voice.ssmlGender,
      naturalSampleRateHertz: voice.naturalSampleRateHertz,
    }));
    */
    
    // Return the empty (but typed) voices array for now
    return NextResponse.json({ voices: voices });
  } catch (error) {
    console.error('TTS List Voices API Error:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: 'Failed to list voices',
        details: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500 }
    );
  }
} 