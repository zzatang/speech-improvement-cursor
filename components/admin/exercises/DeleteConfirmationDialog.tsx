import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { SpeechExercise } from '@/lib/supabase/types';

interface DeleteConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
  error?: any;
  exercise: SpeechExercise | null;
}

export default function DeleteConfirmationDialog({ open, onClose, onConfirm, isLoading, error, exercise }: DeleteConfirmationDialogProps) {
  // Accessibility: unique ids for title/description
  const titleId = 'delete-exercise-dialog-title';
  const descId = 'delete-exercise-dialog-desc';

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
          <DialogTitle id={titleId}>Delete Exercise</DialogTitle>
          <DialogDescription id={descId}>
            {`Are you sure you want to delete "${exercise?.title || 'this exercise'}"? This action cannot be undone.`}
          </DialogDescription>
        </DialogHeader>
        {error && <div className="text-red-600 mb-2">{error.message || 'An error occurred'}</div>}
        <div className="flex gap-2 justify-end mt-4">
          <Button variant="outline" onClick={onClose} disabled={isLoading} aria-label="Cancel delete dialog">Cancel</Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isLoading} aria-label="Confirm delete exercise">
            {isLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 