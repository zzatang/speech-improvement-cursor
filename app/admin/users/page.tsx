"use client";

import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Eye, Ban } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUserProfile, getAllUsers, createUser, updateUser, deleteUser, suspendUser, enableUser, User, UserInput } from '@/lib/supabase/services/user-service';
import UserTable from '@/components/admin/users/UserTable';
import { toast } from 'sonner';
import { useState } from 'react';
import UserForm from '@/components/admin/users/UserForm';
import UserModal from '@/components/admin/users/UserModal';
import DeleteConfirmationDialog from '@/components/admin/users/DeleteConfirmationDialog';

export default function AdminUsersPage() {
  const { user, isLoaded } = useUser();
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSuspendDialogOpen, setIsSuspendDialogOpen] = useState(false);

  // Fetch user profile from Supabase to get the role
  const {
    data: profileResult,
    isLoading: isProfileLoading,
    isError: isProfileError,
    error: profileError,
  } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: () => user?.id ? getUserProfile(user.id) : Promise.resolve({ data: null, error: null }),
    enabled: !!user?.id,
  });

  const profile = profileResult?.data;
  const isAdmin = profile && ((profile as any).role === 'admin');

  // Always call the users query, but only enable it for admins
  const { data: users, isLoading, isError, error } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: getAllUsers,
    enabled: !!isAdmin,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (input: UserInput) => createUser(input),
    onSuccess: () => {
      toast.success('User created');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsModalOpen(false);
    },
    onError: (err: any) => toast.error(err.message || 'Failed to create user'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UserInput }) => updateUser(id, input),
    onSuccess: () => {
      toast.success('User updated');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsModalOpen(false);
    },
    onError: (err: any) => toast.error(err.message || 'Failed to update user'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: () => {
      toast.success('User deleted');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsDeleteDialogOpen(false);
    },
    onError: (err: any) => toast.error(err.message || 'Failed to delete user'),
  });

  const suspendMutation = useMutation({
    mutationFn: (id: string) => suspendUser(id),
    onSuccess: () => {
      toast.success('User suspended');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsSuspendDialogOpen(false);
    },
    onError: (err: any) => toast.error(err.message || 'Failed to suspend user'),
  });

  const enableMutation = useMutation({
    mutationFn: (id: string) => enableUser(id),
    onSuccess: () => {
      toast.success('User re-enabled');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsSuspendDialogOpen(false);
    },
    onError: (err: any) => toast.error(err.message || 'Failed to re-enable user'),
  });

  // Handlers for table actions
  const handleView = (user: User) => setSelectedUser(user);
  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };
  const handleDelete = (user: User) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };
  const handleSuspend = (user: User) => {
    setSelectedUser(user);
    setIsSuspendDialogOpen(true);
  };

  // Add User handler
  const handleAddUser = () => {
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  // UI rendering logic
  if (!isLoaded || isProfileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-xl shadow p-8 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h2>
          <p className="text-gray-700">You do not have permission to view this page.</p>
        </div>
      </div>
    );
  }

  // Render
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-amber-50 py-10 px-2 md:px-0">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-extrabold text-blue-800 tracking-tight drop-shadow-sm">Manage Users</h1>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg rounded-lg px-4 py-2 flex items-center gap-2 transition" onClick={handleAddUser}>
            <Plus className="w-5 h-5" /> Add User
          </Button>
        </div>

        {isLoading && <div>Loading users...</div>}
        {isError && <div className="text-red-600">Error: {error?.message || 'Failed to load users'}</div>}
        {users && (
          <UserTable
            users={users}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onSuspend={handleSuspend}
          />
        )}
        {/* User Modal for Add/Edit */}
        <UserModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          user={selectedUser}
          onSubmit={(input: UserInput) => {
            if (selectedUser) {
              updateMutation.mutate({ id: selectedUser.id, input });
            } else {
              createMutation.mutate(input);
            }
          }}
          isLoading={createMutation.isPending || updateMutation.isPending}
          error={createMutation.error || updateMutation.error}
        />
        {/* Delete Confirmation Dialog */}
        <DeleteConfirmationDialog
          open={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={() => selectedUser && deleteMutation.mutate(selectedUser.id)}
          isLoading={deleteMutation.isPending}
          error={deleteMutation.error}
          user={selectedUser}
        />
        {/* Suspend Confirmation Dialog */}
        <DeleteConfirmationDialog
          open={isSuspendDialogOpen}
          onClose={() => setIsSuspendDialogOpen(false)}
          onConfirm={() => {
            if (selectedUser) {
              if (selectedUser.status === 'suspended') {
                enableMutation.mutate(selectedUser.id);
              } else {
                suspendMutation.mutate(selectedUser.id);
              }
            }
          }}
          isLoading={suspendMutation.isPending || enableMutation.isPending}
          error={suspendMutation.error || enableMutation.error}
          user={selectedUser}
          suspend
        />
      </div>
    </div>
  );
} 