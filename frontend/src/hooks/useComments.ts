import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { commentService } from '../services';
import { taskKeys } from './useTasks';
import type { CreateCommentRequest } from '../types';


export const commentKeys = {
  all: ['comments'] as const,
  lists: () => [...commentKeys.all, 'list'] as const,
  list: (workspaceId: string, projectId: string, taskId: string) => [...commentKeys.lists(), workspaceId, projectId, taskId] as const,
};


export const useComments = (workspaceId: string, projectId: string, taskId: string) => {
  return useQuery({
    queryKey: commentKeys.list(workspaceId, projectId, taskId),
    queryFn: () => commentService.getComments(workspaceId, projectId, taskId),
    enabled: !!workspaceId && !!projectId && !!taskId,
  });
};


export const useCreateComment = () => {
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
      data: CreateCommentRequest 
    }) => commentService.createComment(workspaceId, projectId, taskId, data),
    onSuccess: (_, { workspaceId, projectId, taskId }) => {
      
      queryClient.invalidateQueries({ queryKey: commentKeys.list(workspaceId, projectId, taskId) });
      
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(taskId) });
      queryClient.invalidateQueries({ queryKey: taskKeys.list(workspaceId, projectId) });
      
      queryClient.refetchQueries({ queryKey: commentKeys.list(workspaceId, projectId, taskId) });
      queryClient.refetchQueries({ queryKey: taskKeys.detail(taskId) });
    },
    onError: (error) => {
      console.error('Failed to create comment:', error);
    },
  });
};


export const useUpdateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      workspaceId,
      projectId,
      taskId, 
      commentId, 
      data 
    }: { 
      workspaceId: string;
      projectId: string;
      taskId: string; 
      commentId: string; 
      data: CreateCommentRequest
    }) => commentService.updateComment(workspaceId, projectId, taskId, commentId, data),
    onSuccess: (_, { workspaceId, projectId, taskId }) => {
      
      queryClient.invalidateQueries({ queryKey: commentKeys.list(workspaceId, projectId, taskId) });
      
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(taskId) });
      queryClient.invalidateQueries({ queryKey: taskKeys.list(workspaceId, projectId) });
      
      queryClient.refetchQueries({ queryKey: commentKeys.list(workspaceId, projectId, taskId) });
      queryClient.refetchQueries({ queryKey: taskKeys.detail(taskId) });
    },
    onError: (error) => {
      console.error('Failed to update comment:', error);
    },
  });
};


export const useDeleteComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ workspaceId, projectId, taskId, commentId }: { workspaceId: string; projectId: string; taskId: string; commentId: string }) =>
      commentService.deleteComment(workspaceId, projectId, taskId, commentId),
    onSuccess: (_, { workspaceId, projectId, taskId }) => {
      
      queryClient.invalidateQueries({ queryKey: commentKeys.list(workspaceId, projectId, taskId) });
      
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(taskId) });
      queryClient.invalidateQueries({ queryKey: taskKeys.list(workspaceId, projectId) });
      
      queryClient.refetchQueries({ queryKey: commentKeys.list(workspaceId, projectId, taskId) });
      queryClient.refetchQueries({ queryKey: taskKeys.detail(taskId) });
    },
    onError: (error) => {
      console.error('Failed to delete comment:', error);
    },
  });
};