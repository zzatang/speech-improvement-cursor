import { supabase, safeSupabaseCall } from '../client';
import { SpeechExercise, UserProgress } from '../types';

/**
 * Gets all speech exercises
 */
export async function getAllExercises() {
  return safeSupabaseCall<SpeechExercise[]>(async () => {
    const { data, error } = await supabase
      .from('speech_exercises')
      .select('*')
      .order('difficulty_level', { ascending: true });

    if (error) throw error;
    return { data, error: null };
  });
}

/**
 * Gets a speech exercise by ID
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
 * Gets speech exercises by type
 */
export async function getExercisesByType(exerciseType: string) {
  return safeSupabaseCall<SpeechExercise[]>(async () => {
    const { data, error } = await supabase
      .from('speech_exercises')
      .select('*')
      .eq('exercise_type', exerciseType)
      .order('difficulty_level', { ascending: true });

    if (error) throw error;
    return { data, error: null };
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