import { supabase, safeSupabaseCall } from '../client';
import { SpeechExercise, UserProgress } from '../types';
import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Get all speech exercises
 */
export async function getAllExercises() {
  return safeSupabaseCall<SpeechExercise[]>(async () => {
    const { data, error } = await supabase
      .from('speech_exercises')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return { data, error: null };
  });
}

/**
 * Get a specific exercise by ID
 */
export async function getExerciseById(id: string) {
  return safeSupabaseCall<SpeechExercise>(async () => {
    const { data, error } = await supabase
      .from('speech_exercises')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return { data, error: null };
  });
}

/**
 * Save (create or update) an exercise
 * @param exercise The exercise data to save
 * @param client Optional Supabase client with authentication
 */
export async function saveExercise(
  exercise: Partial<SpeechExercise>, 
  client?: SupabaseClient
) {
  // Use provided client or default to anonymous client
  const supabaseClient = client || supabase;
  
  return safeSupabaseCall<SpeechExercise>(async () => {
    try {
      // If exercise has an ID, update it
      if (exercise.id) {
        const { data, error } = await supabaseClient
          .from('speech_exercises')
          .update(exercise)
          .eq('id', exercise.id)
          .select()
          .single();
        
        if (error) {
          // Check if this is an RLS/auth issue
          if (error.code === '42501' || error.message.includes('policy')) {
            throw new Error('Permission denied: You need to be authenticated with the correct role to update exercises. Please sign in or check your permissions.');
          }
          
          throw error;
        }
        return { data, error: null };
      } 
      // Otherwise create a new exercise
      else {
        const { data, error } = await supabaseClient
          .from('speech_exercises')
          .insert(exercise)
          .select()
          .single();
        
        if (error) {
          // Check if this is an RLS/auth issue
          if (error.code === '42501' || error.message.includes('policy')) {
            throw new Error('Permission denied: You need to be authenticated with the correct role to add exercises. Please sign in or check your permissions.');
          }
          
          throw error;
        }
        return { data, error: null };
      }
    } catch (err) {
      throw err;
    }
  });
}

/**
 * Delete an exercise by ID
 */
export async function deleteExercise(id: string) {
  return safeSupabaseCall<null>(async () => {
    const { error } = await supabase
      .from('speech_exercises')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return { data: null, error: null };
  });
}

/**
 * Get exercises by type (repeat or reading)
 */
export async function getExercisesByType(type: string) {
  return safeSupabaseCall<SpeechExercise[]>(async () => {
    try {
      const { data, error } = await supabase
        .from('speech_exercises')
        .select('*')
        .eq('exercise_type', type)
        .order('difficulty_level', { ascending: true });
      
      if (error) {
        throw error;
      }
      
      // Make sure data is always an array
      if (!data) {
        return { data: [], error: null };
      }
      
      return { data, error: null };
    } catch (err) {
      throw err;
    }
  });
}

/**
 * Gets speech exercises by difficulty level
 */
export async function getExercisesByDifficulty(level: number) {
  return safeSupabaseCall<SpeechExercise[]>(async () => {
    const { data, error } = await supabase
      .from('speech_exercises')
      .select('*')
      .eq('difficulty_level', level)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  });
}

/**
 * Creates or updates a user's progress for an exercise
 */
export async function saveUserProgress(progress: Partial<UserProgress>) {
  return safeSupabaseCall<UserProgress>(async () => {
    // Check if progress record exists
    const { data: existingProgress, error: checkError } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', progress.user_id!)
      .eq('exercise_id', progress.exercise_id!)
      .maybeSingle();

    if (checkError) throw checkError;

    // If progress exists, update it; otherwise insert new record
    const { data, error } = existingProgress
      ? await supabase
          .from('user_progress')
          .update({
            ...progress,
            attempts: (existingProgress.attempts || 0) + 1,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingProgress.id)
          .select()
          .single()
      : await supabase
          .from('user_progress')
          .insert({
            ...progress,
            attempts: 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

    if (error) throw error;
    return { data, error: null };
  });
}

/**
 * Gets all exercises with user progress for a specific user
 */
export async function getExercisesWithProgress(userId: string) {
  return safeSupabaseCall<(SpeechExercise & { user_progress: UserProgress | null })[]>(async () => {
    const { data, error } = await supabase
      .from('speech_exercises')
      .select(`
        *,
        user_progress!inner(*)
      `)
      .eq('user_progress.user_id', userId);

    if (error) throw error;
    return { data, error: null };
  });
} 