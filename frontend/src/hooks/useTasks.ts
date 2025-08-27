import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { taskService } from '../services';
import type { CreateTaskRequest, UpdateTaskRequest } from '../types';

// Query keys
export const taskKeys = {
  all: ['tasks'] as const,
  lists: () => [...taskKeys.all, 'list'] as const,
  list: (workspaceId: string, projectId: string, filters?: Record<string, any>) => 
    [...taskKeys.lists(), workspaceId, projectId, { filters }] as const,
  details: () => [...taskKeys.all, 'detail'] as const,
  detail: (taskId: string) => [...taskKeys.details(), taskId] as const,
};

// Get tasks in a project
export const useTasks = (workspaceId: string, projectId: string) => {
  return useQuery({
    queryKey: taskKeys.list(workspaceId, projectId),
    queryFn: () => taskService.getTasks(workspaceId, projectId),
    enabled: !!workspaceId && !!projectId,
  });
};

// Get task by ID
export const useTask = (workspaceId: string, projectId: string, taskId: string) => {
  return useQuery({
    queryKey: taskKeys.detail(taskId),
    queryFn: () => taskService.getTask(workspaceId, projectId, taskId),
    enabled: !!workspaceId && !!projectId && !!taskId,
  });
};

// Create task
export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      workspaceId, 
      projectId, 
      data 
    }: { 
      workspaceId: string; 
      projectId: string; 
      data: CreateTaskRequest 
    }) => taskService.createTask(workspaceId, projectId, data),
    onSuccess: (result, { workspaceId, projectId }) => {
      // Invalidate and refetch tasks list for this project
      queryClient.invalidateQueries({ 
        queryKey: taskKeys.list(workspaceId, projectId) 
      });
      
      // We only get the taskId back, not the full task data
      // The task list will be refetched due to the invalidation above
    },
    onError: (error) => {
      console.error('Failed to create task:', error);
    },
  });
};

// Update task
export const useUpdateTask = () => {
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
      data: UpdateTaskRequest 
    }) => taskService.updateTask(workspaceId, projectId, taskId, data),
    onSuccess: (_, { workspaceId, projectId, taskId }) => {
      // Update returns void, so we just invalidate the cache to refetch fresh data
      queryClient.invalidateQueries({ 
        queryKey: taskKeys.list(workspaceId, projectId) 
      });
      
      // Also invalidate the specific task detail
      queryClient.invalidateQueries({ 
        queryKey: taskKeys.detail(taskId) 
      });
    },
    onError: (error) => {
      console.error('Failed to update task:', error);
    },
  });
};

// Delete task
export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      workspaceId, 
      projectId, 
      taskId 
    }: { 
      workspaceId: string; 
      projectId: string; 
      taskId: string 
    }) => taskService.deleteTask(workspaceId, projectId, taskId),
    onMutate: async ({ workspaceId, projectId, taskId }) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: taskKeys.list(workspaceId, projectId) });

      // Snapshot the previous value
      const previousTasks = queryClient.getQueryData(taskKeys.list(workspaceId, projectId));

      // Optimistically update to the new value
      queryClient.setQueryData(taskKeys.list(workspaceId, projectId), (old: any) => {
        if (!old) return old;
        return old.filter((task: any) => task.taskId !== taskId);
      });

      // Return a context object with the snapshotted value
      return { previousTasks };
    },
    onError: (err, { workspaceId, projectId }, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousTasks) {
        queryClient.setQueryData(taskKeys.list(workspaceId, projectId), context.previousTasks);
      }
      console.error('Failed to delete task:', err);
    },
    onSuccess: (_, { workspaceId, projectId, taskId }) => {
      // Remove task from cache
      queryClient.removeQueries({ queryKey: taskKeys.detail(taskId) });
      
      // Invalidate tasks list for this project to ensure fresh data
      queryClient.invalidateQueries({ queryKey: taskKeys.list(workspaceId, projectId) });
    },
  });
};

// Complete task
export const useCompleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      workspaceId, 
      projectId, 
      taskId 
    }: { 
      workspaceId: string; 
      projectId: string; 
      taskId: string 
    }) => taskService.completeTask(workspaceId, projectId, taskId),
    onSuccess: (_, { workspaceId, projectId, taskId }) => {
      // Invalidate task detail and tasks list to refetch with updated status
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(taskId) });
      queryClient.invalidateQueries({ queryKey: taskKeys.list(workspaceId, projectId) });
    },
    onError: (error) => {
      console.error('Failed to complete task:', error);
    },
  });
};

// Assign task
export const useAssignTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      workspaceId, 
      projectId, 
      taskId, 
      userId 
    }: { 
      workspaceId: string; 
      projectId: string; 
      taskId: string; 
      userId: string 
    }) => taskService.assignTask(workspaceId, projectId, taskId, { userId }),
    onSuccess: (_, { workspaceId, projectId, taskId }) => {
      // Invalidate task detail and tasks list to refetch with updated assignment
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(taskId) });
      queryClient.invalidateQueries({ queryKey: taskKeys.list(workspaceId, projectId) });
    },
    onError: (error) => {
      console.error('Failed to assign task:', error);
    },
  });
};

// Unassign task
export const useUnassignTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      workspaceId, 
      projectId, 
      taskId 
    }: { 
      workspaceId: string; 
      projectId: string; 
      taskId: string 
    }) => taskService.unassignTask(workspaceId, projectId, taskId),
    onSuccess: (_, { workspaceId, projectId, taskId }) => {
      // Invalidate task detail and tasks list to refetch without assignment
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(taskId) });
      queryClient.invalidateQueries({ queryKey: taskKeys.list(workspaceId, projectId) });
    },
    onError: (error) => {
      console.error('Failed to unassign task:', error);
    },
  });
};