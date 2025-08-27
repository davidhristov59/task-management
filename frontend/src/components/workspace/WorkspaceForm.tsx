import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useCreateWorkspace, useUpdateWorkspace } from '@/hooks';
import type { Workspace, CreateWorkspaceRequest, UpdateWorkspaceRequest } from '@/types';

const workspaceSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional().or(z.literal('')),
  ownerId: z.string().min(1, 'Owner ID is required'),
  memberIds: z.array(z.string()),
});

type WorkspaceFormData = z.infer<typeof workspaceSchema>;

interface WorkspaceFormProps {
  workspace?: Workspace | null;
  onClose: () => void;
  onSuccess?: () => void; // Optional callback for additional actions after success
}

export function WorkspaceForm({ workspace, onClose, onSuccess }: WorkspaceFormProps) {
  const isEditing = !!workspace;
  const createWorkspaceMutation = useCreateWorkspace();
  const updateWorkspaceMutation = useUpdateWorkspace();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<WorkspaceFormData>({
    resolver: zodResolver(workspaceSchema),
    defaultValues: {
      title: '',
      description: '',
      ownerId: 'current-user', // TODO: Get from auth context
      memberIds: [],
    },
  });

  // Populate form when editing
  useEffect(() => {
    if (workspace) {
      setValue('title', workspace.title);
      setValue('description', workspace.description || '');
      setValue('ownerId', workspace.ownerId);
      setValue('memberIds', workspace.memberIds || []);
    }
  }, [workspace, setValue]);

  const onSubmit = async (data: WorkspaceFormData) => {
    try {
      if (isEditing && workspace) {
        const updateData: UpdateWorkspaceRequest = {
          title: data.title,
          description: data.description,
          ownerId: data.ownerId,
          memberIds: data.memberIds,
        };
        await updateWorkspaceMutation.mutateAsync({
          workspaceId: workspace.workspaceId,
          data: updateData,
        });
      } else {
        const createData: CreateWorkspaceRequest = {
          title: data.title,
          description: data.description,
          ownerId: data.ownerId,
          memberIds: data.memberIds,
        };
        await createWorkspaceMutation.mutateAsync(createData);
      }
      
      // Reset form and close modal only after successful mutation
      reset();
      onSuccess?.(); // Call optional success callback
      onClose();
    } catch (error) {
      console.error('Failed to save workspace:', error);
      // You might want to show a toast notification here instead of console.error
      alert(`Failed to ${isEditing ? 'update' : 'create'} workspace. Please try again.`);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] bg-white border border-gray-200">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Workspace' : 'Create New Workspace'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Enter workspace title"
              {...register('title')}
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && (
              <p className="text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter workspace description (optional)"
              rows={3}
              {...register('description')}
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="ownerId">Owner ID *</Label>
            <Input
              id="ownerId"
              placeholder="Enter owner user ID"
              {...register('ownerId')}
              className={errors.ownerId ? 'border-red-500' : ''}
            />
            {errors.ownerId && (
              <p className="text-sm text-red-600">{errors.ownerId.message}</p>
            )}
            <p className="text-xs text-gray-500">
              This should be the user ID of the workspace owner
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-black hover:bg-gray-800 text-white"
            >
              {isSubmitting 
                ? (isEditing ? 'Updating...' : 'Creating...') 
                : (isEditing ? 'Update Workspace' : 'Create Workspace')
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}