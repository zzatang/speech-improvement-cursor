import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { transcribeSpeech } from '@/lib/google/speech-to-text';

/**
 * API endpoint for speech recognition
 * Accepts audio data and returns transcription with analysis
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    // Get form data
    const formData = await request.formData();
    const audioBlob = formData.get('audio') as Blob;
    const targetText = formData.get('targetText') as string | null;
    const languageCode = formData.get('languageCode') as string || process.env.GOOGLE_STT_LANGUAGE_CODE || 'en-AU';

    // Validate request
    if (!audioBlob) {
      return new NextResponse(JSON.stringify({ error: 'Audio data is required' }), { status: 400 });
    }

    console.log(`Recognize API: Processing audio with target text: "${targetText || 'none'}"`);

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
      console.error('Speech recognition error:', sttResponse.error);
      
      // Special handling for "No speech detected" - return as a valid response
      if (sttResponse.error === 'No speech detected') {
        return NextResponse.json({
          transcript: '',
          confidence: 0,
          error: 'No speech detected'
        });
      }
      
      // For other errors, return error response
      return new NextResponse(
        JSON.stringify({ error: 'Failed to process speech', details: sttResponse.error }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Return the response
    return NextResponse.json(sttResponse);

  } catch (error) {
    console.error('Speech recognition API error:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: 'Error analyzing speech',
        details: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 