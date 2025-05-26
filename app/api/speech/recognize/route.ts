import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { transcribeSpeech } from '@/lib/google/speech-to-text';
import { ApiErrorHandler } from '@/lib/api/error-handler';
import type { SpeechRecognitionResponse, ApiError } from '@/types/api';

/**
 * API endpoint for speech recognition
 * Accepts audio data and returns transcription with analysis
 */
export async function POST(request: NextRequest): Promise<NextResponse<SpeechRecognitionResponse | ApiError>> {
  try {
    // Get the user from Supabase
    const supabase = createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return ApiErrorHandler.createUnauthorizedError();
    }

    // Get form data
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const targetText = formData.get('targetText') as string | null;
    const languageCode = formData.get('languageCode') as string || process.env.GOOGLE_STT_LANGUAGE_CODE || 'en-AU';

    // Validate request
    if (!audioFile) {
      return ApiErrorHandler.createValidationError('Audio data is required');
    }

    // Convert File to Buffer
    const audioBuffer = await audioFile.arrayBuffer();
    const audioBytes = Buffer.from(audioBuffer);

    // Process speech with the Google Cloud STT API
    const sttResponse = await transcribeSpeech({
      audioContent: audioBytes,
      languageCode: languageCode,
      enableWordTimeOffsets: true,
      enableAutomaticPunctuation: true,
      targetText: targetText || undefined
    });

    // Return successful response
    return NextResponse.json({
      transcript: sttResponse.transcript,
      confidence: sttResponse.confidence,
      wordTimeOffsets: sttResponse.wordTimings,
      error: sttResponse.error
    });

  } catch (error) {
    console.error('Speech recognition error:', error);
    return ApiErrorHandler.handleUnknownError(error);
  }
} 
