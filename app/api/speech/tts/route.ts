import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

// Create a client with Google credentials from environment variables
const createTTSClient = () => {
  const credentials = JSON.parse(process.env.GOOGLE_CLOUD_CREDENTIALS || '{}');
  
  return new TextToSpeechClient({
    projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
    credentials
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

    // Create TTS client
    const client = createTTSClient();
    
    // Get list of voices
    const [result] = await client.listVoices({
      languageCode: process.env.GOOGLE_TTS_LANGUAGE_CODE || 'en-AU',
    });
    
    const voices = result.voices || [];
    
    // Filter and format the voice data, prioritizing Australian voices
    const formattedVoices = voices.map(voice => ({
      name: voice.name,
      languageCode: voice.languageCodes?.[0],
      ssmlGender: voice.ssmlGender,
      naturalSampleRateHertz: voice.naturalSampleRateHertz,
    }));
    
    return NextResponse.json({ voices: formattedVoices });
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