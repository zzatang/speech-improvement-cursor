import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { transcribeSpeech, analyzeTargetSound } from '@/lib/google/speech-to-text';

/**
 * API endpoint for speech recognition and phonetic analysis
 * Accepts audio data and returns transcription with analysis
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get request data - either form data with audio file or direct audio content
    let audioContent: Buffer | null = null;
    let targetSound: string | null = null;
    let languageCode: string | null = null;

    // Check if the request is multipart form data or JSON
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      // Handle form data - audio file upload
      const formData = await request.formData();
      const audioFile = formData.get('audio') as File | null;
      targetSound = formData.get('targetSound') as string | null;
      languageCode = formData.get('languageCode') as string | null;

      if (!audioFile) {
        return NextResponse.json(
          { error: 'Audio file is required' },
          { status: 400 }
        );
      }

      // Convert File to Buffer
      const arrayBuffer = await audioFile.arrayBuffer();
      audioContent = Buffer.from(arrayBuffer);
    } else {
      // Handle JSON request with audio content as base64
      const body = await request.json();
      
      if (!body.audioContent) {
        return NextResponse.json(
          { error: 'Audio content is required' },
          { status: 400 }
        );
      }

      // Convert base64 to Buffer
      audioContent = Buffer.from(body.audioContent, 'base64');
      targetSound = body.targetSound || null;
      languageCode = body.languageCode || null;
    }

    if (!audioContent) {
      return NextResponse.json(
        { error: 'Audio content could not be processed' },
        { status: 400 }
      );
    }

    // Process audio with Google Cloud Speech-to-Text
    const sttResponse = await transcribeSpeech({
      audioContent,
      languageCode: languageCode || undefined,
      enableAutomaticPunctuation: true,
      enableWordTimeOffsets: true,
    });

    // Check for errors
    if (sttResponse.error) {
      return NextResponse.json(
        { 
          error: 'Speech recognition failed',
          details: sttResponse.error
        },
        { status: 500 }
      );
    }

    // If transcription is empty
    if (!sttResponse.transcript) {
      return NextResponse.json({
        transcript: '',
        message: 'No speech detected. Please try speaking more clearly or checking your microphone.',
        confidence: 0,
      });
    }

    // Prepare the response
    const response: any = {
      transcript: sttResponse.transcript,
      confidence: sttResponse.confidence,
      phoneticAnalysis: sttResponse.phoneticAnalysis
    };

    // Add word timings if available
    if (sttResponse.wordTimings) {
      response.wordTimings = sttResponse.wordTimings;
    }

    // If a target sound was specified, add focused analysis for that sound
    if (targetSound && sttResponse.transcript) {
      response.targetSoundAnalysis = analyzeTargetSound(
        sttResponse.transcript, 
        targetSound
      );
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('ASR API Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process speech',
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

/**
 * Handles GET requests for ASR service information
 */
export async function GET() {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Return supported features
    return NextResponse.json({
      service: 'Google Cloud Speech-to-Text',
      features: {
        languages: [
          { code: 'en-AU', name: 'English (Australia)' },
          { code: 'en-US', name: 'English (United States)' },
          { code: 'en-GB', name: 'English (United Kingdom)' }
        ],
        phonetic_analysis: true,
        word_timings: true,
        model: process.env.GOOGLE_STT_MODEL || 'command_and_search',
        automatic_punctuation: process.env.GOOGLE_STT_ENABLE_AUTOMATIC_PUNCTUATION === 'true'
      },
      targeted_sounds: ['r', 's', 'th', 'l'],
      audio_formats: ['wav', 'mp3', 'ogg', 'flac'],
      max_duration_seconds: 60
    });
  } catch (error) {
    console.error('ASR Info API Error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve ASR service information' },
      { status: 500 }
    );
  }
} 