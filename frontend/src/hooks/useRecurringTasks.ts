import { useMutation, useQueryClient } from '@tanstack/react-query';
import { recurringService } from '../services';
import type { CreateRecurringTaskRequest } from '../types';

// Create recurring task
export const useCreateRecurringTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      workspaceId,
      projectId,
      taskId, 
      data 
    }: { 
      workspaceId: string;
      projectId: string;
      taskId: string; 
      data: CreateRecurringTaskRequest 
    }) => recurringService.createRecurringTask(workspaceId, projectId, taskId, data),
    onSuccess: (_, { workspaceId, projectId, taskId }) => {
      // Invalidate tasks query to refresh the task list
      queryClient.invalidateQueries({ queryKey: ['tasks', workspaceId, projectId] });
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
    },
    onError: (error) => {
      console.error('Failed to create recurring task:', error);
    },
  });
};

// Update recurring task (same as create since backend uses same endpoint)
export const useUpdateRecurringTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      workspaceId,
      projectId,
      taskId, 
      data 
    }: { 
      workspaceId: string;
      projectId: string;
      taskId: string; 
      data: CreateRecurringTaskRequest 
    }) => recurringService.updateRecurringTask(workspaceId, projectId, taskId, data),
    onSuccess: (_, { workspaceId, projectId, taskId }) => {
      // Invalidate tasks query to refresh the task list
      queryClient.invalidateQueries({ queryKey: ['tasks', workspaceId, projectId] });
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
    },
    onError: (error) => {
      console.error('Failed to update recurring task:', error);
    },
  });
};