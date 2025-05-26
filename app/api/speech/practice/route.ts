import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { generatePracticeSpeech, synthesizeSpeech, formatForTTS } from '@/lib/google/text-to-speech';

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
    const { sound, difficulty, customText, returnText } = body;
    
    if (!sound && !customText) {
      return new NextResponse(
        JSON.stringify({ error: 'Either sound or customText is required' }),
        { status: 400 }
      );
    }
    
    
    // Generate speech - either from a custom text or using the practice generator
    let response;
    let textToReturn;
    
    if (customText) {
      // Format the custom text for better pronunciation
      const formattedText = formatForTTS(customText);
      textToReturn = customText;
      response = await synthesizeSpeech({
        text: formattedText,
        childFriendly: true,
        speakingRate: 0.8  // Slightly slower for better clarity
      });
    } else {
      // Use the practice generator with specified sound and difficulty
      
      // Generate phrase and capture the generated text
      const { audioContent, generatedText, error } = await generatePracticeSpeech(sound, difficulty);
      textToReturn = generatedText;
      response = { audioContent, error };
    }
    
    if (!response.audioContent) {
      return new NextResponse(
        JSON.stringify({ 
          error: 'Failed to generate speech',
          details: response.error
        }),
        { status: 500 }
      );
    }
    
    
    // If returnText is true, return the text along with a success message
    if (returnText && textToReturn) {
      return new NextResponse(
        JSON.stringify({
          success: true,
          text: textToReturn
        }),
        {
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=86400', // Cache for 1 day
          },
        }
      );
    }
    
    // Otherwise, return audio content with appropriate headers
    return new NextResponse(response.audioContent, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=86400', // Cache for 1 day
      },
    });
  } catch (error) {
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
    return new NextResponse(
      JSON.stringify({ error: 'Failed to retrieve practice options' }),
      { status: 500 }
    );
  }
} 
