import { SpeechExercise } from '@/lib/supabase/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ExerciseViewModalProps {
  open: boolean;
  onClose: () => void;
  exercise: SpeechExercise | null;
}

export default function ExerciseViewModal({ open, onClose, exercise }: ExerciseViewModalProps) {
  if (!exercise) return null;

  // Format the exercise content as a pretty JSON string
  const formattedContent = JSON.stringify(exercise.content, null, 2);

  // Convert exercise type to a more readable format
  const formatExerciseType = (type: string): string => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent
        className="max-w-md w-full"
        aria-modal="true"
        role="dialog"
        aria-labelledby="exercise-view-title"
        aria-describedby="exercise-view-desc"
      >
        <DialogHeader>
          <DialogTitle id="exercise-view-title">Exercise Details</DialogTitle>
          <DialogDescription id="exercise-view-desc">
            Viewing details for exercise: {exercise.title}
          </DialogDescription>
        </DialogHeader>
        <Button size="icon" variant="ghost" className="absolute top-2 right-2" onClick={onClose} aria-label="Close modal">
          <X className="w-5 h-5" />
        </Button>

        <div className="space-y-4 py-2">
          <div>
            <h3 className="text-sm font-semibold text-gray-500">Title</h3>
            <p className="text-lg font-medium text-blue-900">{exercise.title}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-500">Exercise Type</h3>
            <p className="text-base text-gray-700 capitalize">{formatExerciseType(exercise.exercise_type)}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-500">Difficulty Level</h3>
            <p className="text-base text-amber-700 font-medium">{exercise.difficulty_level}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-500">Age Group</h3>
            <p className="text-base text-gray-700">{exercise.age_group || 'Not specified'}</p>
          </div>
          
          {exercise.description && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500">Description</h3>
              <p className="text-base text-gray-700">{exercise.description}</p>
            </div>
          )}
          
          <div>
            <h3 className="text-sm font-semibold text-gray-500">Content</h3>
            <pre className="p-3 bg-gray-50 rounded-md text-xs overflow-auto max-h-60 border border-gray-200 text-gray-800 font-mono">
              {formattedContent}
            </pre>
          </div>
          
          <div className="mt-4 pt-2 border-t">
            <p className="text-xs text-gray-500">
              Created: {new Date(exercise.created_at).toLocaleString()}
              <br />
              Last Updated: {new Date(exercise.updated_at).toLocaleString()}
            </p>
          </div>
        </div>
        
        <div className="mt-4 flex justify-end">
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 