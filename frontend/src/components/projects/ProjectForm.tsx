import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { type Project } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useCreateProject, useUpdateProject } from '@/hooks/useProjects';

const projectSchema = z.object({
  title: z.string().min(1, 'Project name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  ownerId: z.string().min(1, 'Owner ID is required'),
});

type ProjectFormData = z.infer<typeof projectSchema>;

interface ProjectFormProps {
  workspaceId: string;
  project?: Project;
  onSuccess: () => void;
  onCancel: () => void;
}

const ProjectForm: React.FC<ProjectFormProps> = ({
  workspaceId,
  project,
  onSuccess,
  onCancel
}) => {
  const createProjectMutation = useCreateProject();
  const updateProjectMutation = useUpdateProject();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: project?.title || '',
      description: project?.description || '',
      ownerId: project?.ownerId || 'current-user', 
    }
  });

  

  const onSubmit = async (data: ProjectFormData) => {
    console.log('Form submitted with data:', data);
    console.log('Form validation errors:', errors);
    
    
    if (Object.keys(errors).length > 0) {
      console.log('Form has validation errors, not submitting');
      return;
    }
    
    try {
      if (project) {
        console.log('Updating project:', project.projectId.value);
        const result = await updateProjectMutation.mutateAsync({
          workspaceId,
          projectId: project.projectId.value,
          data
        });
        console.log('Update result:', result);
      } else {
        console.log('Creating new project in workspace:', workspaceId);
        const result = await createProjectMutation.mutateAsync({
          workspaceId,
          data
        });
        console.log('Create result:', result);
      }
      console.log('API call successful, calling onSuccess callback');
      onSuccess();
    } catch (error) {
      console.error('Failed to save project:', error);
      console.error('Error details:', error);
      
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Project Name *</Label>
        <Input
          id="title"
          {...register('title')}
          placeholder="Enter project name"
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
          {...register('description')}
          placeholder="Enter project description (optional)"
          rows={3}
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
          {...register('ownerId')}
          placeholder="Enter owner user ID"
          className={errors.ownerId ? 'border-red-500' : ''}
        />
        {errors.ownerId && (
          <p className="text-sm text-red-600">{errors.ownerId.message}</p>
        )}
        <p className="text-xs text-gray-500">
          This should be the user ID of the project owner
        </p>
      </div>

      {/* Error display */}
      {(createProjectMutation.error || updateProjectMutation.error) && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">
            Error: {createProjectMutation.error?.message || updateProjectMutation.error?.message}
          </p>
        </div>
      )}

      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || createProjectMutation.isPending || updateProjectMutation.isPending}
          className="bg-black hover:bg-gray-800 text-white"
        >
          {(isSubmitting || createProjectMutation.isPending || updateProjectMutation.isPending) 
            ? (project ? 'Updating...' : 'Creating...') 
            : (project ? 'Update Project' : 'Create Project')}
        </Button>
      </div>
    </form>
  );
};

export default ProjectForm;