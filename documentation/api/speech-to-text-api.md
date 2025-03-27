# Speech-to-Text API Documentation

This document provides detailed information about the Speech-to-Text (ASR) API implemented for the Speech Buddy application, including endpoints, request/response formats, phonetic analysis features, and usage examples.

## Overview

The Speech-to-Text API leverages Google Cloud's Speech-to-Text service to transcribe audio recordings and provide phonetic assessments for children with speech impediments. The API is designed to support both the "Repeat After Me" and "Reading Practice" exercises in the application, with special focus on analyzing specific speech sounds (r, s, th, l) commonly challenging for children.

## Configuration

The STT functionality is configured via environment variables in `.env.local`:

```
# Google Cloud APIs
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_CLOUD_CREDENTIALS={"type":"service_account",...}

# Google Cloud Speech-to-Text
GOOGLE_STT_LANGUAGE_CODE=en-AU
GOOGLE_STT_MODEL=command_and_search
GOOGLE_STT_ENABLE_AUTOMATIC_PUNCTUATION=true
GOOGLE_STT_ENABLE_WORD_TIME_OFFSETS=true
```

## API Endpoint

**URL:** `/api/speech/asr`

### POST Request

Transcribes audio recording to text and provides phonetic analysis.

#### Request Options

The API supports two request formats:

**1. Multipart Form Data:**
```
Content-Type: multipart/form-data

audio: [audio file]
targetSound: "r" (optional)
languageCode: "en-AU" (optional)
```

**2. JSON with Base64 Audio:**
```json
{
  "audioContent": "[base64-encoded audio data]",
  "targetSound": "r", (optional)
  "languageCode": "en-AU" (optional)
}
```

#### Response:

```json
{
  "transcript": "The red rabbit ran rapidly around the road.",
  "confidence": 0.92,
  "wordTimings": [
    { "word": "The", "startTime": 0.1, "endTime": 0.3 },
    { "word": "red", "startTime": 0.4, "endTime": 0.8 },
    // ...more words with timing information
  ],
  "phoneticAnalysis": {
    "sounds": {
      "r": {
        "correct": 3,
        "total": 4,
        "percentage": 75,
        "problematic": ["road"]
      },
      "s": {
        "correct": 0,
        "total": 0,
        "percentage": 100,
        "problematic": []
      },
      "th": {
        "correct": 0,
        "total": 0,
        "percentage": 100,
        "problematic": []
      },
      "l": {
        "correct": 0,
        "total": 0,
        "percentage": 100,
        "problematic": []
      }
    },
    "overallScore": 75,
    "suggestions": [
      "Try practicing the 'R' sound by placing your tongue near the roof of your mouth and making a growling sound."
    ]
  },
  "targetSoundAnalysis": {
    "accuracy": 75,
    "correctWords": ["red", "rabbit", "rapidly"],
    "incorrectWords": ["road"],
    "suggestions": [
      "Try practicing the 'R' sound by placing your tongue near the roof of your mouth and making a growling sound.",
      "Try practicing these words: road"
    ]
  }
}
```

- `transcript`: The recognized text
- `confidence`: Confidence score (0-1)
- `wordTimings`: Timing information for each word (if enabled)
- `phoneticAnalysis`: Analysis of all supported speech sounds
- `targetSoundAnalysis`: Focused analysis on the specified target sound (if requested)

#### Error Responses:

- 400 Bad Request: Missing or invalid audio data
- 401 Unauthorized: User not authenticated
- 500 Internal Server Error: Issue with speech recognition

### GET Request

Retrieves information about the ASR service's capabilities.

#### Response:

```json
{
  "service": "Google Cloud Speech-to-Text",
  "features": {
    "languages": [
      { "code": "en-AU", "name": "English (Australia)" },
      { "code": "en-US", "name": "English (United States)" },
      { "code": "en-GB", "name": "English (United Kingdom)" }
    ],
    "phonetic_analysis": true,
    "word_timings": true,
    "model": "command_and_search",
    "automatic_punctuation": true
  },
  "targeted_sounds": ["r", "s", "th", "l"],
  "audio_formats": ["wav", "mp3", "ogg", "flac"],
  "max_duration_seconds": 60
}
```

## Phonetic Analysis System

The API includes a phonetic analysis system specifically designed for evaluating children's speech:

1. **Sound Detection**: Identifies words containing target sounds (r, s, th, l)
2. **Substitution Analysis**: Detects common substitution patterns (e.g., 'w' for 'r', 'f' for 'th')
3. **Accuracy Calculation**: Determines percentage of correctly pronounced sounds
4. **Feedback Generation**: Provides age-appropriate suggestions for improving specific sounds

### Analyzed Sounds and Common Substitutions

| Sound | Common Substitutions | Example Error |
|-------|---------------------|---------------|
| r     | w                   | "wabbit" instead of "rabbit" |
| s     | th                  | "thun" instead of "sun" |
| th    | f, d                | "fink" instead of "think" |
| l     | w, y                | "yion" instead of "lion" |

### Feedback Types

The API generates several types of feedback:

1. **General Phonetic Analysis**: Overview of all sound categories
2. **Target-Sound Analysis**: Detailed feedback on a specific sound
3. **Word-Level Feedback**: Lists of correctly and incorrectly pronounced words
4. **Improvement Suggestions**: Specific tips for improving pronunciation

## Implementation Details

### Core Components

1. **Audio Processing**: Handles both file uploads and direct audio content
2. **Transcription**: Converts speech to text with Google Cloud STT
3. **Phonetic Analysis**: Analyzes speech for common phonetic issues
4. **Word Timing**: Provides timing information for word-level analysis
5. **Authentication**: Ensures secure access through Clerk authentication

### Utility Functions

The API is supported by utility functions in `lib/google/speech-to-text.ts`:

1. `transcribeSpeech(options)`: Core function to convert speech to text
2. `analyzePhonetics(transcript)`: Analyzes speech for phonetic issues
3. `analyzeTargetSound(transcript, targetSound)`: Provides focused analysis on a specific sound
4. `getSuggestionTemplate(sound)`: Generates age-appropriate improvement suggestions

## Security Considerations

1. **Authentication**: All endpoints require Clerk authentication
2. **Environment Variables**: Google Cloud credentials are stored securely in environment variables
3. **Input Validation**: Proper validation of all request parameters
4. **Error Handling**: Secure error responses that don't leak sensitive information

## Examples

### Web Recording Example

```javascript
// Record audio in the browser
async function recordAndAnalyzeSpeech(targetSound) {
  // Create audio recorder
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const mediaRecorder = new MediaRecorder(stream);
  const audioChunks = [];
  
  mediaRecorder.addEventListener('dataavailable', (event) => {
    audioChunks.push(event.data);
  });
  
  // Start recording
  mediaRecorder.start();
  
  // Stop after 5 seconds (example)
  setTimeout(() => {
    mediaRecorder.stop();
  }, 5000);
  
  // When recording stops, send to API
  mediaRecorder.addEventListener('stop', async () => {
    const audioBlob = new Blob(audioChunks);
    const formData = new FormData();
    formData.append('audio', audioBlob);
    
    if (targetSound) {
      formData.append('targetSound', targetSound);
    }
    
    const response = await fetch('/api/speech/asr', {
      method: 'POST',
      body: formData
    });
    
    if (response.ok) {
      const result = await response.json();
      displayFeedback(result);
    }
  });
}

// Display feedback to the user
function displayFeedback(result) {
  console.log('Transcript:', result.transcript);
  console.log('Confidence:', result.confidence);
  
  if (result.targetSoundAnalysis) {
    console.log('Accuracy:', result.targetSoundAnalysis.accuracy + '%');
    console.log('Suggestions:', result.targetSoundAnalysis.suggestions);
  }
}
```

### Base64 Audio Example

```javascript
async function analyzeAudioFile(audioFile, targetSound) {
  // Read file as ArrayBuffer
  const buffer = await audioFile.arrayBuffer();
  
  // Convert to Base64
  const base64Audio = btoa(
    new Uint8Array(buffer).reduce(
      (data, byte) => data + String.fromCharCode(byte),
      ''
    )
  );
  
  // Send to API
  const response = await fetch('/api/speech/asr', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      audioContent: base64Audio,
      targetSound: targetSound
    })
  });
  
  if (response.ok) {
    return await response.json();
  }
}
```

## Best Practices and Limitations

1. **Audio Quality**: Best results require clear audio with minimal background noise.
2. **Duration**: Optimal recordings are between 1-30 seconds (maximum 60 seconds).
3. **Accuracy Considerations**: Perfect accuracy is not guaranteed, especially for children with significant speech impediments.
4. **Languages**: While multiple languages are supported, phonetic analysis is optimized for English.
5. **Privacy**: Audio data is not stored persistently after processing.

## Monitoring and Troubleshooting

Consider monitoring the following:
- API usage and quotas in Google Cloud Console
- Error rates and response times
- Transcription accuracy and phonetic analysis quality
- User feedback on the helpfulness of improvement suggestions 