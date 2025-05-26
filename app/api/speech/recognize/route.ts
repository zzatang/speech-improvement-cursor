import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { transcribeSpeech } from '@/lib/google/speech-to-text';
import { ApiErrorHandler } from '@/lib/api/error-handler';
import type { SpeechRecognitionResponse, ApiError } from '@/types/api';

/**
 * API endpoint for speech recognition
 * Accepts audio data and returns transcription with analysis
 */
export async function POST(request: NextRequest): Promise<NextResponse<SpeechRecognitionResponse | ApiError>> {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return ApiErrorHandler.createUnauthorizedError();
    }

    // Get form data
    const formData = await request.formData();
    const audioBlob = formData.get('audio') as Blob;
    const targetText = formData.get('targetText') as string | null;
    const languageCode = formData.get('languageCode') as string || process.env.GOOGLE_STT_LANGUAGE_CODE || 'en-AU';

    // Validate request
    if (!audioBlob) {
      return ApiErrorHandler.createValidationError('Audio data is required');
    }

    // Convert Blob to Buffer
    const audioBytes = Buffer.from(await audioBlob.arrayBuffer());

    // Process speech with the Google Cloud STT API
    const sttResponse = await transcribeSpeech({
      audioContent: audioBytes,
      languageCode: languageCode,
      enableWordTimeOffsets: true,
      enableAutomaticPunctuation: true,
      targetText: targetText || undefined
    });

    // Check for errors
    if (sttResponse.error) {
      // Special handling for "No speech detected" - return as a valid response
      if (sttResponse.error === 'No speech detected') {
        return NextResponse.json({
          transcript: '',
          confidence: 0,
          error: 'No speech detected'
        });
      }
      
      // For other errors, return error response
      return ApiErrorHandler.createErrorResponse(
        'Failed to process speech',
        sttResponse.error,
        500
      );
    }

    // Return the response
    return NextResponse.json(sttResponse);

  } catch (error) {
    return ApiErrorHandler.handleUnknownError(error);
  }
} 
