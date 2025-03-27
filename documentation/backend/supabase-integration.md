# Supabase Integration

This document outlines the integration of Supabase with the Speech Buddy application, providing backend database capabilities with full TypeScript support.

## Overview

Supabase is used as the primary database backend for the Speech Buddy application. It stores user profiles, speech exercises, progress tracking, achievements, and other data required by the application.

## Configuration

The Supabase connection is configured using environment variables stored in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Directory Structure

The Supabase integration is organized in the following directory structure:

```
lib/
  └── supabase/
      ├── client.ts           # Supabase client configuration
      ├── types.ts            # TypeScript types for database schema
      ├── index.ts            # Exports for easy imports
      ├── auth-middleware.ts  # Clerk auth integration with Supabase
      └── services/
          ├── user-service.ts     # User profile operations
          └── exercise-service.ts # Speech exercise operations
```

## Key Components

### Client Configuration (`client.ts`)

The Supabase client is initialized using the environment variables and provides error handling utilities:

- `supabase`: The main client instance
- `handleSupabaseError()`: Helper function for error handling
- `safeSupabaseCall()`: A wrapper for Supabase operations that handles errors consistently

### Database Types (`types.ts`)

Comprehensive TypeScript types for the database schema, including:

- `UserProfile`: User information and preferences
- `SpeechExercise`: Exercise content and metadata
- `UserProgress`: Tracking user completion of exercises
- `Achievement`: Achievements that users can unlock
- `UserAchievement`: Junction table tracking which users have which achievements

### Auth Integration (`auth-middleware.ts`)

Integration between Clerk Auth and Supabase, providing:

- `getSupabaseWithAuth()`: Authenticates Supabase client with Clerk JWT
- `getCurrentUserId()`: Helper to retrieve the current user ID from Clerk

### User Service (`services/user-service.ts`)

Operations for managing user profiles:

- `upsertUserProfile()`: Create or update a user profile
- `getUserProfile()`: Get a user's profile by ID
- `updateStreakCount()`: Update a user's streak counter
- `updateLastLogin()`: Update a user's last login timestamp
- `getUserAchievements()`: Get a user's achievements
- `getUserProgress()`: Get a user's progress across exercises

### Exercise Service (`services/exercise-service.ts`)

Operations for managing speech exercises:

- `getAllExercises()`: Get all available exercises
- `getExerciseById()`: Get a specific exercise by ID
- `getExercisesByType()`: Get exercises filtered by type
- `getExercisesByDifficulty()`: Get exercises filtered by difficulty level
- `saveUserProgress()`: Save a user's progress on an exercise
- `getExercisesWithProgress()`: Get exercises with the user's progress included

## Authentication Flow

1. User authenticates with Clerk Auth
2. Clerk generates a JWT token with the template 'supabase'
3. The JWT is used to authenticate requests to Supabase
4. User operations in Supabase are tied to the Clerk user ID

## Database Schema

### Tables

1. **user_profiles**
   - `id`: UUID, primary key
   - `user_id`: String, references Clerk user ID
   - `display_name`: String, nullable
   - `avatar_url`: String, nullable
   - `avatar_color`: String, nullable
   - `avatar_accessories`: String array, nullable
   - `streak_count`: Integer
   - `last_login`: Timestamp, nullable

2. **speech_exercises**
   - `id`: UUID, primary key
   - `title`: String
   - `description`: String, nullable
   - `exercise_type`: String (e.g., "repeat", "reading")
   - `content`: JSON (exercise-specific content)
   - `difficulty_level`: Integer
   - `age_group`: String, nullable

3. **user_progress**
   - `id`: UUID, primary key
   - `user_id`: String, references user_profiles
   - `exercise_id`: UUID, references speech_exercises
   - `completed_at`: Timestamp, nullable
   - `score`: Float, nullable
   - `attempts`: Integer
   - `feedback`: String, nullable

4. **achievements**
   - `id`: UUID, primary key
   - `title`: String
   - `description`: String
   - `icon_url`: String, nullable
   - `criteria`: JSON (achievement criteria)

5. **user_achievements**
   - `id`: UUID, primary key
   - `user_id`: String, references user_profiles
   - `achievement_id`: UUID, references achievements
   - `unlocked_at`: Timestamp

## Usage Examples

### Get User Profile

```typescript
import { getUserProfile } from '@/lib/supabase';

async function fetchUserProfile(userId: string) {
  const { data, error } = await getUserProfile(userId);
  
  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
  
  return data;
}
```

### Save Exercise Progress

```typescript
import { saveUserProgress } from '@/lib/supabase';

async function recordExerciseProgress(userId: string, exerciseId: string, score: number) {
  const { data, error } = await saveUserProgress({
    user_id: userId,
    exercise_id: exerciseId,
    score,
    completed_at: new Date().toISOString(),
  });
  
  if (error) {
    console.error('Error saving progress:', error);
    return false;
  }
  
  return true;
}
```

## Security Considerations

- Sensitive operations are protected by Clerk authentication
- Row-Level Security (RLS) policies in Supabase restrict data access
- Environment variables are kept secure and not exposed to the client
- Error handling prevents exposure of sensitive information 