import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

// TTS configuration options
interface TTSOptions {
  text: string;
  voiceName?: string;
  languageCode?: string;
  speakingRate?: number;
}

/**
 * Create a TTS client with credentials from environment
 * - Uses GOOGLE_CLOUD_CREDENTIALS as a JSON string
 */
function createTTSClient() {
  // Get credentials from environment variable
  const credentials = process.env.GOOGLE_CLOUD_CREDENTIALS;
  
  if (!credentials) {
    console.warn('Missing Google Cloud credentials. Using fallback mock TTS client.');
    return createMockTTSClient();
  }
  
  try {
    // Create client directly using the credentials string
    return new TextToSpeechClient({ 
      credentials: JSON.parse(credentials),
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID 
    });
  } catch (error) {
    console.error('Error creating Google Cloud TTS client:', error);
    console.warn('Falling back to mock TTS client due to credentials error');
    return createMockTTSClient();
  }
}

/**
 * Creates a mock TTS client for development
 */
function createMockTTSClient() {
  return {
    synthesizeSpeech: async () => {
      // Return a simple mock response with a small audio sample
      // This is a minimal MP3 file with a short tone
      const mockAudioContent = Buffer.from(
        'SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAADmAD///////////////////////////////////////////8AAAA8TEFNRTMuMTAwAc0AAAAAAAAAABSAJAJAQgAAgAAAA5iKz6EAAAAAAAAAAAAAAAAAAAAA//vQZAAP8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAETEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVQ==',
        'base64'
      );
      return [{ audioContent: mockAudioContent }];
    },
  };
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