import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { recurringService } from '../services';
import type { CreateRecurringTaskRequest } from '../types';

// Query keys
export const recurringTaskKeys = {
  all: ['recurringTasks'] as const,
  details: () => [...recurringTaskKeys.all, 'detail'] as const,
  detail: (taskId: string) => [...recurringTaskKeys.details(), taskId] as const,
};

// Get recurring task settings
export const useRecurringTask = (taskId: string) => {
  return useQuery({
    queryKey: recurringTaskKeys.detail(taskId),
    queryFn: () => recurringService.getRecurringTask(taskId),
    enabled: !!taskId,
  });
};

// Create recurring task
export const useCreateRecurringTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      taskId, 
      data 
    }: { 
      taskId: string; 
      data: CreateRecurringTaskRequest 
    }) => recurringService.createRecurringTask(taskId, data),
    onSuccess: (_, { taskId }) => {
      // Invalidate recurring task settings for this task
      queryClient.invalidateQueries({ queryKey: recurringTaskKeys.detail(taskId) });
    },
    onError: (error) => {
      console.error('Failed to create recurring task:', error);
    },
  });
};

// Update recurring task
export const useUpdateRecurringTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      taskId, 
      data 
    }: { 
      taskId: string; 
      data: CreateRecurringTaskRequest 
    }) => recurringService.updateRecurringTask(taskId, data),
    onSuccess: (_, { taskId }) => {
      // Invalidate recurring task settings
      queryClient.invalidateQueries({ queryKey: recurringTaskKeys.detail(taskId) });
    },
    onError: (error) => {
      console.error('Failed to update recurring task:', error);
    },
  });
};

// Delete recurring task
export const useDeleteRecurringTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: recurringService.deleteRecurringTask,
    onSuccess: (_, taskId) => {
      // Remove recurring task settings from cache
      queryClient.removeQueries({ queryKey: recurringTaskKeys.detail(taskId) });
    },
    onError: (error) => {
      console.error('Failed to delete recurring task:', error);
    },
  });
};