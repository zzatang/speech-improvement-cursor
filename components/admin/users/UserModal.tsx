import { User, UserInput } from '@/lib/supabase/services/user-service';
import UserForm from './UserForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface UserModalProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
  onSubmit: (input: UserInput) => void;
  isLoading?: boolean;
  error?: any;
}

export default function UserModal({ open, onClose, user, onSubmit, isLoading, error }: UserModalProps) {
  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-md w-full">
        <DialogHeader>
          <DialogTitle>{user ? 'Edit User' : 'Add User'}</DialogTitle>
          <DialogDescription>
            {user ? 'Update user details below.' : 'Fill out the form to add a new user.'}
          </DialogDescription>
        </DialogHeader>
        <Button size="icon" variant="ghost" className="absolute top-2 right-2" onClick={onClose} aria-label="Close">
          <X className="w-5 h-5" />
        </Button>
        {error && <div className="text-red-600 mb-2">{error.message || 'An error occurred'}</div>}
        <UserForm
          initialValues={user ? {
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status,
          } : undefined}
          onSubmit={onSubmit}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
} 