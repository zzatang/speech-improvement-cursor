# Repeat After Me Component Documentation

## Overview
The "Repeat After Me" exercise is a core speech practice component that allows children to listen to phrases with specific speech sounds and record themselves repeating them, receiving feedback on their pronunciation.

## File Location
`app/practice/repeat/page.tsx`

## Features

### 1. Text-to-Speech Integration
- Plays target phrases using Google Cloud TTS (Australian accent)
- Loading and playback state indicators
- Volume toggle control
- Phrase display with clear typography

### 2. Voice Recording
- Microphone access using the MediaRecorder API
- Visual recording progress indicator (0-5 second timer)
- Start/stop recording controls
- Recording state visualization

### 3. Speech Analysis
- Integration with Google Cloud Speech-to-Text for analysis
- Loading state during analysis
- Targeted feedback on pronunciation of specific sounds
- Visual feedback presentation

### 4. Exercise Navigation
- Previous/next phrase navigation
- Multiple difficulty levels
- Sound-specific exercises (R, S, L, Th sounds)
- Browser-based audio processing

### 5. User Guidance
- Clear instructions for the exercise
- Visual cues for each step of the process
- Pronunciation tips and best practices
- Kid-friendly language and design

## UI Components Used
- Shadcn UI components:
  - Card, CardHeader, CardContent, CardFooter
  - Button with variants (primary, outline, ghost)
  - Progress bar for recording visualization
  - Alert for feedback display
- Lucide icons for visual affordances
- Next.js Link component for navigation
- Native HTML5 audio element for playback

## Technical Implementation
- React state management for exercise flow
- React useRef for audio element and MediaRecorder references
- Browser MediaRecorder API for audio capture
- Cleanup effects to handle component unmounting
- Async/await pattern for audio processing

## Responsive Design
- Mobile-friendly interface with appropriate component sizing
- Centered content with maximum width constraint
- Touch-friendly large buttons for recording and playback
- Clear text hierarchy with appropriate font sizes

## Kid-Friendly Features
- Large, colorful buttons for primary actions
- Clear visual feedback for current state
- Encouraging feedback messages
- Simple language appropriate for children 8-13
- Tips section with actionable guidance

## Integration Points
- Authentication with Clerk (UserButton)
- Google Cloud TTS API (currently simulated)
- Google Cloud STT API for speech analysis (currently simulated)
- Navigation to/from dashboard

## Usage Flow
1. User navigates to the Repeat After Me exercise from the dashboard
2. User clicks the play button to hear the target phrase with Australian accent
3. User clicks the record button and repeats the phrase
4. System analyzes the recording and provides targeted feedback
5. User can practice multiple times or navigate to the next phrase
6. Progress is tracked and reported back to the dashboard (future enhancement)

## Future Enhancements
- Real-time waveform visualization during recording
- Phonetic breakdown of troublesome sounds
- Achievement unlocking based on practice completion
- Word-level highlighting for precise feedback
- Customized difficulty progression based on user performance 