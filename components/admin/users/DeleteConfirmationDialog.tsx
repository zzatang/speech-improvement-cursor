import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { User } from '@/lib/supabase/services/user-service';

interface DeleteConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
  error?: any;
  user: User | null;
  suspend?: boolean;
}

export default function DeleteConfirmationDialog({ open, onClose, onConfirm, isLoading, error, user, suspend }: DeleteConfirmationDialogProps) {
  const isReenable = suspend && user?.status === 'suspended';
  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-md w-full">
        <DialogHeader>
          <DialogTitle>
            {isReenable
              ? 'Re-enable User'
              : suspend
                ? 'Suspend User'
                : 'Delete User'}
          </DialogTitle>
          <DialogDescription>
            {isReenable
              ? `Are you sure you want to re-enable ${user?.name || 'this user'}? They will regain access to their account.`
              : suspend
                ? `Are you sure you want to suspend ${user?.name || 'this user'}? They will not be able to access their account until reactivated.`
                : `Are you sure you want to delete ${user?.name || 'this user'}? This action cannot be undone.`}
          </DialogDescription>
        </DialogHeader>
        {error && <div className="text-red-600 mb-2">{error.message || 'An error occurred'}</div>}
        <div className="flex gap-2 justify-end mt-4">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
          <Button variant={isReenable ? 'default' : suspend ? 'default' : 'destructive'} onClick={onConfirm} disabled={isLoading}>
            {isLoading
              ? isReenable
                ? 'Re-enabling...'
                : suspend
                  ? 'Suspending...'
                  : 'Deleting...'
              : isReenable
                ? 'Re-enable'
                : suspend
                  ? 'Suspend'
                  : 'Delete'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 