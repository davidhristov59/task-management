import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { taskService } from '../services';
import type { CreateTaskRequest, UpdateTaskRequest } from '../types';


export const taskKeys = {
  all: ['tasks'] as const,
  lists: () => [...taskKeys.all, 'list'] as const,
  list: (workspaceId: string, projectId: string, filters?: Record<string, any>) => 
    [...taskKeys.lists(), workspaceId, projectId, { filters }] as const,
  details: () => [...taskKeys.all, 'detail'] as const,
  detail: (taskId: string) => [...taskKeys.details(), taskId] as const,
};


export const useTasks = (workspaceId: string, projectId: string) => {
  return useQuery({
    queryKey: taskKeys.list(workspaceId, projectId),
    queryFn: () => taskService.getTasks(workspaceId, projectId),
    enabled: !!workspaceId && !!projectId,
  });
};


export const useTask = (workspaceId: string, projectId: string, taskId: string) => {
  return useQuery({
    queryKey: taskKeys.detail(taskId),
    queryFn: () => taskService.getTask(workspaceId, projectId, taskId),
    enabled: !!workspaceId && !!projectId && !!taskId,
  });
};


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
    onSuccess: (_result, { workspaceId, projectId }) => {
      
      queryClient.invalidateQueries({ 
        queryKey: taskKeys.list(workspaceId, projectId) 
      });
      
      
      
    },
    onError: (error) => {
      console.error('Failed to create task:', error);
    },
  });
};


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
      
      queryClient.invalidateQueries({ 
        queryKey: taskKeys.list(workspaceId, projectId) 
      });
      
      
      queryClient.invalidateQueries({ 
        queryKey: taskKeys.detail(taskId) 
      });
    },
    onError: (error) => {
      console.error('Failed to update task:', error);
    },
  });
};


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
      
      await queryClient.cancelQueries({ queryKey: taskKeys.list(workspaceId, projectId) });

      
      const previousTasks = queryClient.getQueryData(taskKeys.list(workspaceId, projectId));

      
      queryClient.setQueryData(taskKeys.list(workspaceId, projectId), (old: any) => {
        if (!old) return old;
        return old.filter((task: any) => task.taskId !== taskId);
      });

      
      return { previousTasks };
    },
    onError: (err, { workspaceId, projectId }, context) => {
      
      if (context?.previousTasks) {
        queryClient.setQueryData(taskKeys.list(workspaceId, projectId), context.previousTasks);
      }
      console.error('Failed to delete task:', err);
    },
    onSuccess: (_, { workspaceId, projectId, taskId }) => {
      
      queryClient.removeQueries({ queryKey: taskKeys.detail(taskId) });
      
      
      queryClient.invalidateQueries({ queryKey: taskKeys.list(workspaceId, projectId) });
    },
  });
};


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
      
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(taskId) });
      queryClient.invalidateQueries({ queryKey: taskKeys.list(workspaceId, projectId) });
    },
    onError: (error) => {
      console.error('Failed to complete task:', error);
    },
  });
};


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
      
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(taskId) });
      queryClient.invalidateQueries({ queryKey: taskKeys.list(workspaceId, projectId) });
    },
    onError: (error) => {
      console.error('Failed to assign task:', error);
    },
  });
};


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
      
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(taskId) });
      queryClient.invalidateQueries({ queryKey: taskKeys.list(workspaceId, projectId) });
    },
    onError: (error) => {
      console.error('Failed to unassign task:', error);
    },
  });
};