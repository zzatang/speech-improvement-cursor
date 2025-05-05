import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import * as fs from 'fs';
import * as path from 'path';

// TTS configuration options
interface TTSOptions {
  text: string;
  voiceName?: string;
  languageCode?: string;
  speakingRate?: number;
}

/**
 * Create a TTS client with credentials from environment
 * - Handles both JSON string and file path formats
 */
function createTTSClient() {
  const credentials = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  
  if (!credentials) {
    throw new Error('Missing Google Cloud credentials environment variable');
  }
  
  // Check if credentials is a JSON string or a file path
  if (credentials.trim().startsWith('{') && credentials.trim().endsWith('}')) {
    // It's a JSON string, parse it
    try {
      const parsedCredentials = JSON.parse(credentials);
      return new TextToSpeechClient({
        credentials: parsedCredentials
      });
    } catch (error) {
      console.error('Error parsing JSON credentials:', error);
      throw new Error('Invalid JSON credentials format');
    }
  } else {
    // It's a file path, load the file
    try {
      // Resolve the path relative to the project root
      const absolutePath = path.resolve(process.cwd(), credentials);
      
      if (!fs.existsSync(absolutePath)) {
        throw new Error(`Credentials file not found at: ${absolutePath}`);
      }
      
      // Use the file path directly with the client
      return new TextToSpeechClient({
        keyFilename: absolutePath
      });
    } catch (error) {
      console.error('Error loading credentials file:', error);
      throw new Error(`Failed to load credentials file: ${(error as Error).message || 'Unknown error'}`);
    }
  }
}

/**
 * Handles POST requests to synthesize speech
 * Expected body format: { text: string, voiceName?: string, languageCode?: string, speakingRate?: number }
 */
export async function POST(request: Request) {
  try {
    // Get request data
    const body = await request.json() as TTSOptions;
    
    if (!body.text) {
      return new NextResponse(
        JSON.stringify({ error: 'Text is required' }),
        { status: 400 }
      );
    }

    try {
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
    } catch (credentialError) {
      console.error('Error with Google credentials:', credentialError);
      return new NextResponse(
        JSON.stringify({ 
          error: 'Invalid Google Cloud credentials',
          details: credentialError instanceof Error ? credentialError.message : 'Unknown error'
        }),
        { status: 500 }
      );
    }
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

    // Return a simplified response for now
    return NextResponse.json({ 
      voices: [
        {
          name: 'en-AU-Neural2-B',
          languageCode: 'en-AU',
          ssmlGender: 'MALE',
          naturalSampleRateHertz: 24000
        },
        {
          name: 'en-AU-Neural2-A',
          languageCode: 'en-AU',
          ssmlGender: 'FEMALE',
          naturalSampleRateHertz: 24000
        }
      ] 
    });
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