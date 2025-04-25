"use client";

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { 
  getAllExercises, 
  saveExercise, 
  deleteExercise,
  getExerciseById
} from '@/lib/supabase/services/exercise-service';
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
import DeleteConfirmationDialog from '@/components/admin/exercises/DeleteConfirmationDialog';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ExerciseFormValues } from '@/components/admin/exercises/ExerciseForm';
import { toast } from 'sonner';

export default function ExercisesAdminPage() {
  const { user } = useUser();
  const queryClient = useQueryClient();

  // React Query: Fetch exercises
  const { data: exercises = [], isLoading, isError, error } = useQuery({
    queryKey: ['exercises'],
    queryFn: getAllExercises,
    enabled: !!user,
  });

  // Mutations
  const saveMutation = useMutation({
    mutationFn: saveExercise,
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
    onError: (err: any) => toast.error(err.message || 'Failed to save exercise'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteExercise(id),
    onSuccess: () => {
      toast.success('Exercise deleted');
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
      setIsDeleteDialogOpen(false);
      setSelectedExercise(null);
    },
    onError: (err: any) => toast.error(err.message || 'Failed to delete exercise'),
  });

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
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<SpeechExercise | null>(null);

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

  // Handlers
  const handleAdd = () => {
    setSelectedExercise(null);
    setIsModalOpen(true);
  };
  const handleView = (exercise: SpeechExercise) => setSelectedExercise(exercise);
  const handleEdit = (exercise: SpeechExercise) => {
    setSelectedExercise(exercise);
    setIsModalOpen(true);
  };
  const handleDelete = (exercise: SpeechExercise) => {
    setSelectedExercise(exercise);
    setIsDeleteDialogOpen(true);
  };

  if (!user) {
    return (
      <div style={{
        height: '100%',
        minHeight: '500px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          width: '400px',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '1.5rem',
            borderBottom: '1px solid #e5e7eb'
          }}>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: 'bold',
              textAlign: 'center',
              margin: 0
            }}>Authentication Required</h3>
          </div>
          <div style={{
            padding: '1.5rem',
            textAlign: 'center'
          }}>
            <p style={{
              marginBottom: '1rem',
              color: '#6b7280'
            }}>Please sign in to access the admin panel</p>
            <Link href="/sign-in" style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.5rem 1rem',
              backgroundColor: '#3b82f6',
              color: 'white',
              borderRadius: '0.375rem',
              fontWeight: '500',
              fontSize: '0.875rem',
              textDecoration: 'none'
            }}>
              Sign In
            </Link>
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
          <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg rounded-lg px-4 py-2 flex items-center gap-2 transition" onClick={handleAdd}>
            <Plus className="w-5 h-5" /> Add Exercise
          </Button>
        </div>
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
            </svg>
          </div>
        )}
        {!isLoading && (Array.isArray(exercises) ? exercises.length === 0 : true) && (
          <div className="text-center text-gray-500 py-12">
            <p className="text-lg">No exercises found.</p>
            <p className="text-sm">Add your first exercise to get started!</p>
          </div>
        )}
        <ExerciseTable
          exercises={Array.isArray(exercises) ? exercises : []}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
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