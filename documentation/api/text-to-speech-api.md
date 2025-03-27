# Text-to-Speech API Documentation

This document provides detailed information about the Text-to-Speech API implemented for the Speech Buddy application, including endpoints, request/response formats, and usage examples.

## Overview

The Text-to-Speech API leverages Google Cloud's Text-to-Speech service to generate high-quality Australian-accented speech specifically tailored for children with speech impediments. The API is designed to support the "Repeat After Me" and "Reading Practice" exercises in the application.

## Configuration

The TTS functionality is configured via environment variables in `.env.local`:

```
# Google Cloud APIs
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_CLOUD_CREDENTIALS={"type":"service_account",...}

# Google Cloud Text-to-Speech
GOOGLE_TTS_VOICE_NAME=en-AU-Neural2-B
GOOGLE_TTS_LANGUAGE_CODE=en-AU
GOOGLE_TTS_SPEAKING_RATE=0.9
```

## API Endpoints

### 1. General TTS Endpoint

**URL:** `/api/speech/tts`

#### POST Request

Synthesizes speech from provided text.

**Request Body:**

```json
{
  "text": "Text to convert to speech",
  "voiceName": "en-AU-Neural2-B", // Optional
  "languageCode": "en-AU", // Optional
  "speakingRate": 0.9 // Optional
}
```

**Response:**
- Audio content (MP3 format) with appropriate headers
- Status 200 for success
- Status 400, 401, or 500 for errors

#### GET Request

Lists available voices.

**Response:**

```json
{
  "voices": [
    {
      "name": "en-AU-Neural2-B",
      "languageCode": "en-AU",
      "ssmlGender": "MALE",
      "naturalSampleRateHertz": 24000
    },
    ...
  ]
}
```

### 2. Speech Practice Endpoint

**URL:** `/api/speech/practice`

#### POST Request

Generates audio for practice exercises focused on specific sounds.

**Request Body:**

```json
{
  "sound": "r", // Target sound: r, s, th, l
  "difficulty": 2, // 1-3 where 3 is hardest
  "customText": "Custom phrase to synthesize" // Optional
}
```

**Response:**
- Audio content (MP3 format) with appropriate headers
- Status 200 for success
- Status 400, 401, or 500 for errors

#### GET Request

Retrieves available practice options.

**Response:**

```json
{
  "availableSounds": ["r", "s", "th", "l"],
  "difficultyLevels": [
    { "level": 1, "name": "Easy", "description": "Simple, short phrases" },
    { "level": 2, "name": "Medium", "description": "Longer phrases with more complex structure" },
    { "level": 3, "name": "Hard", "description": "Challenging phrases with multiple instances of the target sound" }
  ]
}
```

## Utility Functions

The API is supported by utility functions in `lib/google/text-to-speech.ts`:

1. `synthesizeSpeech(options)`: Core function to convert text to speech
2. `getAvailableVoices(languageCode)`: Retrieves available voices
3. `formatForTTS(text)`: Formats text with SSML for better pronunciation
4. `generatePracticeSpeech(sound, difficulty)`: Generates practice exercises for specific sounds

## Error Handling

All endpoints include proper error handling with descriptive error messages:

- 400 Bad Request: Missing or invalid parameters
- 401 Unauthorized: User not authenticated
- 500 Internal Server Error: Issues with the Google Cloud TTS service

## Security Considerations

1. **Authentication**: All endpoints require Clerk authentication
2. **Environment Variables**: Google Cloud credentials are stored securely in environment variables
3. **Rate Limiting**: Consider implementing rate limiting for production use

## Examples

### Basic TTS Request

```javascript
const response = await fetch('/api/speech/tts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ text: 'Hello, this is a test.' })
});

if (response.ok) {
  const audioBlob = await response.blob();
  const audioUrl = URL.createObjectURL(audioBlob);
  const audio = new Audio(audioUrl);
  audio.play();
}
```

### Speech Practice Request

```javascript
const response = await fetch('/api/speech/practice', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ sound: 'r', difficulty: 2 })
});

if (response.ok) {
  const audioBlob = await response.blob();
  const audioUrl = URL.createObjectURL(audioBlob);
  const audio = new Audio(audioUrl);
  audio.play();
}
```

## Implementation Notes

1. The TTS API uses the neural voice model for higher quality audio
2. Speech is configured with a slightly slower rate (0.9) to improve clarity for children
3. The API includes child-friendly audio profiles using `effectsProfileId`
4. Practice phrases are carefully designed to focus on specific speech sounds at appropriate difficulty levels
5. SSML tags are used to add appropriate pauses and improve pronunciation

## Monitoring and Maintenance

Consider monitoring the following:
- API usage and quotas in Google Cloud Console
- Error rates and response times
- User feedback on voice quality and accent appropriateness 