# Dashboard Component Documentation

## Overview
The dashboard serves as the central hub for the Speech Buddy application, providing users with an overview of their progress, access to speech exercises, and personalization options.

## File Location
`app/dashboard/page.tsx`

## Features

### 1. Header with Authentication
- Logo and app name with animation effects
- User streak counter (days of consistent practice)
- Clerk UserButton for account management

### 2. Progress Tracking
- Overall progress percentage with animated progress bar
- Speech Adventure Map with visual progression path
- Completed and locked speech sound exercises visualization
- Interactive nodes showing progress status

### 3. Exercise Access
- Quick access buttons to different practice exercises:
  - "Repeat After Me" for pronunciation practice
  - "Reading Practice" for sentence-level speech practice
- Visual indicators for exercise types with appropriate icons

### 4. Avatar Customization
- Tab-based interface for avatar selection and customization
- Multiple avatar options with preview functionality
- Customization options including:
  - Accessories (hat, glasses, bowtie, cape)
  - Color options for avatar customization
- Save button for storing user preferences

### 5. Achievements System
- Visual badge display for completed achievements
- Locked and unlocked achievement states
- Progress-based achievements (streaks, sound mastery)
- Gamification elements to encourage continued practice

## UI Components Used
- Shadcn UI components:
  - Card, CardHeader, CardContent, CardFooter
  - Button with variants
  - Progress bar
  - Tabs, TabsList, TabsTrigger, TabsContent
- Lucide icons for visual cues
- Next.js Image component for optimized image display
- Animation classes from the custom Tailwind configuration

## State Management
- React useState for managing:
  - Progress percentage
  - Selected avatar
  - Streak count
- React useEffect for animation timing

## Responsive Design
- Two-column layout for desktop (grid with md:grid-cols-2)
- Single column layout for mobile devices
- Consistent spacing with container classes and gap utilities
- Appropriately sized components for different screen sizes

## Kid-Friendly Features
- Bright, engaging color scheme using primary and secondary colors
- Playful animations including bounce and pulse effects
- Achievement badges with emoji icons
- Visual progress indicators
- Simple, clear language appropriate for children 8-13

## Integration Points
- Authentication with Clerk (UserButton)
- Links to speech exercise components
- Future data persistence with Supabase (currently using dummy data)

## Usage Example
The dashboard is accessed after successful authentication through the onboarding or sign-in process. It serves as the main landing page for authenticated users and the starting point for all speech practice activities. 