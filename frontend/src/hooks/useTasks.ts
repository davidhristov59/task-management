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
export const useTask = (taskId: string) => {
  return useQuery({
    queryKey: taskKeys.detail(taskId),
    queryFn: () => taskService.getTask(taskId),
    enabled: !!taskId,
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
    onSuccess: (newTask, { workspaceId, projectId }) => {
      // Invalidate and refetch tasks list for this project
      queryClient.invalidateQueries({ 
        queryKey: taskKeys.list(workspaceId, projectId) 
      });
      
      // Add the new task to the cache
      queryClient.setQueryData(taskKeys.detail(newTask.taskId), newTask);
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
    mutationFn: ({ taskId, data }: { taskId: string; data: UpdateTaskRequest }) =>
      taskService.updateTask(taskId, data),
    onSuccess: (updatedTask) => {
      // Update the task in cache
      queryClient.setQueryData(taskKeys.detail(updatedTask.taskId), updatedTask);
      
      // Invalidate tasks list to reflect changes
      queryClient.invalidateQueries({ 
        queryKey: taskKeys.list(updatedTask.workspaceId, updatedTask.projectId) 
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
    mutationFn: taskService.deleteTask,
    onSuccess: (_, taskId) => {
      // Remove task from cache
      queryClient.removeQueries({ queryKey: taskKeys.detail(taskId) });
      
      // Invalidate all task lists (we don't know which project it belonged to)
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
    },
    onError: (error) => {
      console.error('Failed to delete task:', error);
    },
  });
};

// Complete task
export const useCompleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: taskService.completeTask,
    onSuccess: (_, taskId) => {
      // Invalidate task detail and tasks list to refetch with updated status
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(taskId) });
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
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
    mutationFn: ({ taskId, userId }: { taskId: string; userId: string }) =>
      taskService.assignTask(taskId, { userId }),
    onSuccess: (_, { taskId }) => {
      // Invalidate task detail and tasks list to refetch with updated assignment
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(taskId) });
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
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
    mutationFn: taskService.unassignTask,
    onSuccess: (_, taskId) => {
      // Invalidate task detail and tasks list to refetch without assignment
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(taskId) });
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
    },
    onError: (error) => {
      console.error('Failed to unassign task:', error);
    },
  });
};