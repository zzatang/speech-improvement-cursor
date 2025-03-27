# Reading Practice Component Documentation

## Overview
The Reading Practice component provides a guided reading exercise that helps children improve their speech fluency, pronunciation, and pacing through interactive word highlighting and customizable reading speeds.

## File Location
`app/practice/reading/page.tsx`

## Features

### 1. Word Highlighting and Pacing
- Sequential word highlighting that guides the reader through the text
- Customizable reading speed (words per minute)
- Visual pacing bar showing progress through the current text
- Smooth transitions between words with appropriate styling

### 2. Reading Settings
- Adjustable reading speed using a slider (30-200 WPM)
- Option to use recommended speed for each text difficulty
- Toggle for showing/hiding the pacing bar
- Toggle for automatic advancement to the next text

### 3. Recording and Feedback
- Voice recording capability using the MediaRecorder API
- Synchronized recording with reading exercise
- Automated feedback after practice completion
- Focus on specific speech sounds in each text

### 4. Text Selection
- Multiple practice texts with varying difficulty levels
- Texts focused on specific speech sounds (vowels, P, S, Th, W)
- Navigation between texts with previous/next buttons
- Progress tracking through the text library

### 5. User Interface
- Clean, distraction-free reading environment
- Visually distinct highlighted words
- Large, touch-friendly control buttons
- Settings panel for customization options

## UI Components Used
- Shadcn UI components:
  - Card, CardHeader, CardContent, CardFooter
  - Button with variants (primary, outline, ghost)
  - Progress bar for pacing visualization
  - Slider for speed adjustment
  - Switch for toggleable options
  - Alert for feedback display
- Lucide icons for visual cues
- Next.js Link component for navigation

## Technical Implementation
- React state management for reading flow
- Word timing calculation based on WPM
- Dynamic word styling based on reading position
- setTimeout-based timing system for word progression
- MediaRecorder for optional voice recording
- Cleanup effects to prevent memory leaks

## Responsive Design
- Appropriate text sizing for readability
- Mobile-friendly control buttons
- Adaptive layout for different screen sizes
- Clear visual hierarchy with proper spacing

## Kid-Friendly Features
- Simple, clear instructions
- Visual progress tracking
- Encouraging feedback messages
- Bite-sized reading passages appropriate for children 8-13
- Fun, engaging text content with tongue twisters and rhymes

## Integration Points
- Authentication with Clerk (UserButton)
- Navigation to/from dashboard
- Future integration with speech analysis API (currently simulated)

## Usage Flow
1. User selects a reading exercise from the dashboard
2. User can adjust reading settings (speed, pacing bar, auto-advance)
3. User presses play to start the guided reading with highlighted words
4. User can optionally record their voice while reading along
5. System provides feedback on reading performance
6. User can navigate to the next reading text or retry the current one

## Customization Options
- Reading speed (WPM) adjustment
- Pacing bar visibility toggle
- Auto-advancement toggle
- Multiple text options with different focuses and difficulties

## Future Enhancements
- Real-time pronunciation feedback on specific words
- Visual speech sound highlighting (e.g., highlighting specific phonemes)
- Customizable text size and font options for accessibility
- Achievement system for completing reading exercises
- Reading level assessment based on performance 