/**
 * Test script for the Text-to-Speech API
 * 
 * This script tests the TTS endpoint by sending a POST request with sample text
 * and saving the audio response to a file. It also logs the response headers
 * to verify the content type and other metadata.
 * 
 * Usage: node test/tts-endpoint-test.js
 */

const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

// Test configuration
const config = {
  apiUrl: 'http://localhost:3000/api/speech/tts',
  outputDir: path.join(__dirname, 'output'),
  testText: 'Hello, this is a test of the Australian accent for the Speech Buddy application.',
  outputFileName: 'tts-test-output.mp3',
  headers: {
    'Content-Type': 'application/json',
    // If using authentication in development, you'd add an auth header here
  }
};

// Create output directory if it doesn't exist
if (!fs.existsSync(config.outputDir)) {
  fs.mkdirSync(config.outputDir, { recursive: true });
}

async function testTTSEndpoint() {
  console.log('Testing TTS endpoint...');
  console.log(`Sending request to: ${config.apiUrl}`);
  console.log(`Test text: "${config.testText}"`);
  
  try {
    // Send request to TTS endpoint
    const response = await fetch(config.apiUrl, {
      method: 'POST',
      headers: config.headers,
      body: JSON.stringify({
        text: config.testText
      })
    });
    
    // Check response status
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed with status ${response.status}: ${errorText}`);
    }
    
    // Log response headers
    console.log('\nResponse headers:');
    response.headers.forEach((value, name) => {
      console.log(`${name}: ${value}`);
    });
    
    // Get audio content as buffer
    const audioBuffer = await response.buffer();
    
    // Save to file
    const outputPath = path.join(config.outputDir, config.outputFileName);
    fs.writeFileSync(outputPath, audioBuffer);
    
    console.log(`\nSuccess! Audio saved to: ${outputPath}`);
    console.log(`File size: ${audioBuffer.length} bytes`);
    console.log('\nTest completed successfully.');
    
    return true;
  } catch (error) {
    console.error('\nTest failed:', error.message);
    return false;
  }
}

// Run the test
testTTSEndpoint(); 