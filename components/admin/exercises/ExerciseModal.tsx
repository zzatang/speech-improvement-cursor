import { useState } from 'react';
import { SpeechExercise } from '@/lib/supabase/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import ExerciseForm, { ExerciseFormValues } from './ExerciseForm';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ExerciseModalProps {
  open: boolean;
  onClose: () => void;
  exercise: SpeechExercise | null;
  onSubmit: (values: ExerciseFormValues) => void;
  isLoading?: boolean;
  error?: any;
}

export default function ExerciseModal({ open, onClose, exercise, onSubmit, isLoading, error }: ExerciseModalProps) {
  const [jsonError, setJsonError] = useState<string | null>(null);

  function handleFormSubmit(values: ExerciseFormValues) {
    setJsonError(null);
    let parsedContent = {};
    try {
      parsedContent = values.content ? JSON.parse(values.content) : {};
    } catch (err) {
      setJsonError('Invalid JSON in content field. Please check the format.');
      return;
    }
    onSubmit({ ...values, content: values.content });
  }

  // Accessibility: unique ids for title/description
  const titleId = 'exercise-modal-title';
  const descId = 'exercise-modal-desc';

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent
        className="max-w-md w-full"
        aria-modal="true"
        role="dialog"
        aria-labelledby={titleId}
        aria-describedby={descId}
      >
        <DialogHeader>
          <DialogTitle id={titleId}>{exercise ? 'Edit Exercise' : 'Add Exercise'}</DialogTitle>
          <DialogDescription id={descId}>
            {exercise ? 'Update exercise details below.' : 'Fill out the form to add a new exercise.'}
          </DialogDescription>
        </DialogHeader>
        <Button size="icon" variant="ghost" className="absolute top-2 right-2" onClick={onClose} aria-label="Close modal">
          <X className="w-5 h-5" />
        </Button>
        {jsonError && <div className="text-red-600 mb-2">{jsonError}</div>}
        {error && <div className="text-red-600 mb-2">{error.message || 'An error occurred'}</div>}
        <ExerciseForm
          initialValues={exercise ? {
            title: exercise.title,
            exercise_type: exercise.exercise_type,
            difficulty_level: exercise.difficulty_level,
            age_group: exercise.age_group || '',
            description: exercise.description || '',
            content: JSON.stringify(exercise.content, null, 2),
          } : undefined}
          onSubmit={handleFormSubmit}
          isLoading={isLoading}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
} 