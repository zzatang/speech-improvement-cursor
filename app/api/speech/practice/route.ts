import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { generatePracticeSpeech } from '@/lib/google/text-to-speech';

/**
 * API endpoint for generating speech practice phrases focused on specific sounds
 * This endpoint is specifically designed for the "Repeat After Me" exercise
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

    // Get request parameters
    const body = await request.json();
    const { sound, difficulty, customText } = body;
    
    if (!sound && !customText) {
      return new NextResponse(
        JSON.stringify({ error: 'Either sound or customText is required' }),
        { status: 400 }
      );
    }
    
    // Generate speech - either from a custom text or using the practice generator
    const response = customText 
      ? await generatePracticeSpeech('r', 1) // Use the default sound but with custom text
      : await generatePracticeSpeech(sound, difficulty);
    
    if (!response.audioContent) {
      return new NextResponse(
        JSON.stringify({ 
          error: 'Failed to generate speech',
          details: response.error
        }),
        { status: 500 }
      );
    }
    
    // Return audio content with appropriate headers
    return new NextResponse(response.audioContent, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=86400', // Cache for 1 day
      },
    });
  } catch (error) {
    console.error('Speech Practice API Error:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: 'Failed to generate practice speech',
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
 * GET endpoint to retrieve available practice options
 */
export async function GET() {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401 }
      );
    }
    
    // Return available practice options
    return NextResponse.json({
      availableSounds: ['r', 's', 'th', 'l'],
      difficultyLevels: [
        { level: 1, name: 'Easy', description: 'Simple, short phrases' },
        { level: 2, name: 'Medium', description: 'Longer phrases with more complex structure' },
        { level: 3, name: 'Hard', description: 'Challenging phrases with multiple instances of the target sound' }
      ]
    });
  } catch (error) {
    console.error('Speech Practice Options API Error:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to retrieve practice options' }),
      { status: 500 }
    );
  }
} 