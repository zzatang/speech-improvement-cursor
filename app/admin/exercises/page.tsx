"use client";

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { 
  getAllExercises, 
  saveExercise, 
  deleteExercise,
  getExerciseById
} from '@/lib/supabase/services/exercise-service';
import { getUserProfile } from '@/lib/supabase/services/user-service';
import { SpeechExercise } from '@/lib/supabase/types';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Pencil, 
  Trash, 
  AlertCircle, 
  ChevronDown, 
  Loader2,
  Plus
} from 'lucide-react';
import ExerciseTable from '@/components/admin/exercises/ExerciseTable';
import ExerciseModal from '@/components/admin/exercises/ExerciseModal';
import ExerciseViewModal from '@/components/admin/exercises/ExerciseViewModal';
import DeleteConfirmationDialog from '@/components/admin/exercises/DeleteConfirmationDialog';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ExerciseFormValues } from '@/components/admin/exercises/ExerciseForm';
import { toast } from 'sonner';
import { useSupabase } from '@/utils/supabase/context';
import React from 'react';

export default function ExercisesAdminPage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const queryClient = useQueryClient();
  const supabaseClient = useSupabase();

  // Fetch user profile from Supabase to get the role
  const {
    data: profileResult,
    isLoading: isProfileLoading,
  } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: () => user?.id ? getUserProfile(user.id) : Promise.resolve({ data: null, error: null }),
    enabled: !!user?.id,
  });

  const profile = profileResult?.data;
  const isAdmin = profile && ((profile as any).role === 'admin');

  // React Query: Fetch exercises
  const { 
    data: exercisesResponse, 
    isLoading, 
    isError, 
    error 
  } = useQuery({
    queryKey: ['exercises'],
    queryFn: async () => {
      try {
        const result = await getAllExercises();
        
        // For development mode: return sample exercises when no env vars
        if (!result.data || result.data.length === 0) {
          if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
            // Return sample exercises when in mock/dev mode for better UX
            return { 
              data: [
                {
                  id: '1',
                  title: 'Sample Exercise 1',
                  description: 'This is a sample exercise for development',
                  exercise_type: 'repeat',
                  content: { 
                    focus: 'S Sounds',
                    phrases: ['Sally sells seashells by the seashore']
                  },
                  difficulty_level: 1,
                  age_group: '8-13',
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                },
                {
                  id: '2',
                  title: 'Sample Exercise 2',
                  description: 'Another sample exercise',
                  exercise_type: 'reading',
                  content: { 
                    text: 'The quick brown fox jumps over the lazy dog.',
                    focus: 'Smooth Reading'
                  },
                  difficulty_level: 2,
                  age_group: '8-13',
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                }
              ],
              error: null
            };
          }
        }
        
        return result;
      } catch (err) {
        console.error('Error fetching exercises:', err);
        throw err;
      }
    },
    enabled: !!isAdmin,
  });

  // Extract the exercises from the response
  const exercises = exercisesResponse?.data || [];

  // Memoize the processed exercises array
  const memoizedExercises = React.useMemo(() => exercises, [exercisesResponse?.data]);

  // Form state
  const [isEditing, setIsEditing] = useState(false);
  const [currentExercise, setCurrentExercise] = useState<SpeechExercise>({
    id: '',
    title: '',
    description: null,
    exercise_type: 'repeat',
    content: {},
    difficulty_level: 1,
    age_group: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });

  // For content editing as a string
  const [contentText, setContentText] = useState('{}');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<SpeechExercise | null>(null);
  
  // Add filter state
  const [difficultyFilter, setDifficultyFilter] = useState<number | null>(null);

  // Filter exercises based on selected difficulty
  const filteredExercises = React.useMemo(() => {
    if (!difficultyFilter) {
      return memoizedExercises;
    }
    
    return memoizedExercises.filter((exercise: SpeechExercise) => exercise.difficulty_level === difficultyFilter);
  }, [memoizedExercises, difficultyFilter]);

  // Update contentText when currentExercise changes
  useEffect(() => {
    if (currentExercise.content) {
      try {
        setContentText(JSON.stringify(currentExercise.content, null, 2));
      } catch (err) {
        console.error('Error stringifying content:', err);
        setContentText('{}');
      }
    } else {
      setContentText('{}');
    }
  }, [currentExercise.content]);

  // Mutations
  const saveMutation = useMutation({
    mutationFn: async (exerciseData: Partial<SpeechExercise>) => {
      if (!isSignedIn) {
        return Promise.reject(new Error("You must be signed in to create or edit exercises"));
      }
      if (!supabaseClient) {
        return Promise.reject(new Error("Supabase client not available. Please refresh the page."));
      }
      
      // Check if we're in mock mode (Supabase env vars missing)
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        // Create a mock response for add/update
        return new Promise<{data: SpeechExercise, error: null}>((resolve) => {
          setTimeout(() => {
            // Mock response with ID and timestamps
            const mockResponse = {
              ...exerciseData,
              id: exerciseData.id || `mock-${Date.now()}`,
              created_at: exerciseData.created_at || new Date().toISOString(),
              updated_at: new Date().toISOString()
            } as SpeechExercise;
            
            resolve({data: mockResponse, error: null});
          }, 500); // simulate network delay
        });
      }
      
      // Use the authenticated client for the operation
      return saveExercise(exerciseData, supabaseClient);
    },
    onSuccess: (_data, _variables, _context) => {
      if (selectedExercise && selectedExercise.id) {
        toast.success('Exercise updated');
      } else {
        toast.success('Exercise added');
      }
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
      setIsModalOpen(false);
      setSelectedExercise(null);
    },
    onError: (err: any) => {
      console.error("Error saving exercise:", err);
      
      // Give more specific guidance if it's likely a JWT template issue
      if (err.message && (
        err.message.includes("policy") || 
        err.message.includes("permission") || 
        err.message.includes("row level security")
      )) {
        toast.error("Authentication error: Make sure you've configured the Clerk JWT template for Supabase as described in the documentation.");
      } else {
        toast.error(err.message || 'Failed to save exercise');
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      // Check if we're in mock mode (Supabase env vars missing)
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        // Create a mock delete response
        return new Promise<{data: null, error: null}>((resolve) => {
          setTimeout(() => {
            resolve({data: null, error: null});
          }, 500); // simulate network delay
        });
      }
      
      return deleteExercise(id);
    },
    onSuccess: () => {
      toast.success('Exercise deleted');
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
      setIsDeleteDialogOpen(false);
      setSelectedExercise(null);
    },
    onError: (err: any) => toast.error(err.message || 'Failed to delete exercise'),
  });

  // Handlers
  const handleAdd = () => {
    setSelectedExercise(null);
    setIsModalOpen(true);
  };
  
  const handleView = (exercise: SpeechExercise) => {
    setSelectedExercise(exercise);
    setIsViewModalOpen(true);
  };
  
  const handleEdit = (exercise: SpeechExercise) => {
    setSelectedExercise(exercise);
    setIsModalOpen(true);
  };
  
  const handleDelete = (exercise: SpeechExercise) => {
    setSelectedExercise(exercise);
    setIsDeleteDialogOpen(true);
  };

  // Handle loading state
  if (!isLoaded || isProfileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  // Check if the user is signed in and has admin role
  if (!isSignedIn || !isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-amber-50 py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-extrabold text-blue-800 mb-8">Manage Exercises</h1>
          <div className="bg-white rounded-xl shadow p-8">
            <div className="text-red-600 font-semibold">Access denied. You do not have permission to view this page.</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-amber-50 py-10 px-2 md:px-0">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-extrabold text-blue-800 tracking-tight drop-shadow-sm">Manage Exercises</h1>
          <div className="flex items-center gap-4">
            {/* Filter component placed next to Add button for visibility */}
            {!isLoading && Array.isArray(exercises) && exercises.length > 0 && (
              <div className="flex items-center gap-2">
                <select 
                  id="difficulty-filter"
                  value={difficultyFilter || 0}
                  onChange={(e) => setDifficultyFilter(parseInt(e.target.value) || null)}
                  className="px-3 py-2 h-10 border rounded-md border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700 shadow-sm text-sm"
                >
                  <option value={0}>All Difficulty Levels</option>
                  <option value={1}>Level 1</option>
                  <option value={2}>Level 2</option>
                  <option value={3}>Level 3</option>
                  <option value={4}>Level 4</option>
                  <option value={5}>Level 5</option>
                </select>
                {difficultyFilter && (
                  <button 
                    onClick={() => setDifficultyFilter(null)}
                    className="text-xs text-blue-600 hover:text-blue-800 underline"
                  >
                    Clear
                  </button>
                )}
              </div>
            )}
            <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg rounded-lg px-4 py-2 flex items-center gap-2 transition" onClick={handleAdd}>
              <Plus className="w-5 h-5" /> Add Exercise
            </Button>
          </div>
        </div>
        
        {/* Show filtered count when filter is active */}
        {!isLoading && difficultyFilter && Array.isArray(exercises) && exercises.length > 0 && (
          <div className="mb-4 p-2 bg-blue-50 border border-blue-100 rounded-md text-center">
            <span className="text-sm text-blue-700">
              Showing {filteredExercises.length} of {exercises.length} exercises (Difficulty Level: {difficultyFilter})
            </span>
          </div>
        )}
        
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
            </svg>
          </div>
        )}
        
        {!isLoading && (
          <>
            {filteredExercises.length === 0 ? (
              <div className="text-center text-gray-500 py-12">
                <p className="text-lg">No exercises found.</p>
                <p className="text-sm">Add your first exercise to get started!</p>
              </div>
            ) : (
              <ExerciseTable
                exercises={filteredExercises}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            )}
          </>
        )}
        <ExerciseModal
          open={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedExercise(null);
          }}
          exercise={selectedExercise}
          onSubmit={(values: ExerciseFormValues) => {
            const now = new Date().toISOString();
            if (selectedExercise && selectedExercise.id) {
              // Edit
              saveMutation.mutate({
                ...selectedExercise,
                ...values,
                id: selectedExercise.id,
                created_at: selectedExercise.created_at || now,
                updated_at: now,
                title: values.title,
                exercise_type: values.exercise_type,
                difficulty_level: values.difficulty_level,
                age_group: values.age_group || null,
                description: values.description || null,
                content: values.content ? JSON.parse(values.content) : {},
              });
            } else {
              // Add
              saveMutation.mutate({
                created_at: now,
                updated_at: now,
                title: values.title,
                exercise_type: values.exercise_type,
                difficulty_level: values.difficulty_level,
                age_group: values.age_group || null,
                description: values.description || null,
                content: values.content ? JSON.parse(values.content) : {},
              });
            }
          }}
          isLoading={saveMutation.isPending}
          error={saveMutation.error}
        />
        <ExerciseViewModal
          open={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedExercise(null);
          }}
          exercise={selectedExercise}
        />
        <DeleteConfirmationDialog
          open={isDeleteDialogOpen}
          onClose={() => {
            setIsDeleteDialogOpen(false);
            setSelectedExercise(null);
          }}
          onConfirm={() => selectedExercise && deleteMutation.mutate(selectedExercise.id)}
          isLoading={deleteMutation.isPending}
          error={deleteMutation.error}
          exercise={selectedExercise}
        />
      </div>
    </div>
  );
}