import { NextRequest, NextResponse } from 'next/server';
// We don't need fs or path here anymore
// import fs from 'fs';
// import path from 'path';
// import { analyzePhonetics } from '@/lib/google/speech-to-text';
import { transcribeSpeech } from '@/lib/google/speech-to-text';

// Remove unused helper functions
/*
const loadCredentials = () => { ... };
const createASRClient = () => { ... };
*/

// Remove unused configurations
/*
interface ASRConfig { ... }
const pronunciationAssessmentConfig = { ... };
*/

/**
 * API endpoint for speech recognition and phonetic analysis
 * Accepts audio data and returns transcription with analysis
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioBlob = formData.get('audio') as Blob;
    const languageCode = formData.get('languageCode') as string || process.env.GOOGLE_STT_LANGUAGE_CODE || 'en-AU';
    const targetText = formData.get('targetText') as string | null;

    if (!audioBlob) {
       return new NextResponse(JSON.stringify({ error: 'Audio data is required' }), { status: 400 });
    }

    const audioBytes = Buffer.from(await audioBlob.arrayBuffer());

    // Call the library function, passing targetText
    const sttResponse = await transcribeSpeech({
        audioContent: audioBytes, 
        languageCode: languageCode, 
        enableWordTimeOffsets: true, 
        enableAutomaticPunctuation: true,
        // Pass targetText so transcribeSpeech can configure assessment
        targetText: targetText || undefined 
    }); 

    // Check for errors returned by transcribeSpeech
    if (sttResponse.error) {
      return new NextResponse(
        JSON.stringify({ error: 'Failed to process speech', details: sttResponse.error }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Return the entire response object from transcribeSpeech
    return NextResponse.json(sttResponse);

  } catch (error) {
    const errorDetails = error instanceof Error ? error.message + (error.stack ? `\n${error.stack}` : '') : 'Unknown error';
    return new NextResponse(
      JSON.stringify({ error: 'Failed to process speech request', details: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * Handles GET requests for ASR service information
 */
export async function GET() {
  try {
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
    return NextResponse.json(
      { error: 'Failed to retrieve ASR service information' },
      { status: 500 }
    );
  }
} 
