import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { commentService } from '../services';
import type { CreateCommentRequest, UpdateCommentRequest } from '../types';

// Query keys
export const commentKeys = {
  all: ['comments'] as const,
  lists: () => [...commentKeys.all, 'list'] as const,
  list: (workspaceId: string, projectId: string, taskId: string) => [...commentKeys.lists(), workspaceId, projectId, taskId] as const,
};

// Get comments for a task
export const useComments = (workspaceId: string, projectId: string, taskId: string) => {
  return useQuery({
    queryKey: commentKeys.list(workspaceId, projectId, taskId),
    queryFn: () => commentService.getComments(workspaceId, projectId, taskId),
    enabled: !!workspaceId && !!projectId && !!taskId,
  });
};

// Create comment
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
      // Invalidate comments list and task data to get updated comments
      queryClient.invalidateQueries({ queryKey: commentKeys.list(workspaceId, projectId, taskId) });
      // Also invalidate task queries since comments are embedded in task data
      queryClient.invalidateQueries({ queryKey: ['tasks', workspaceId, projectId, taskId] });
    },
    onError: (error) => {
      console.error('Failed to create comment:', error);
    },
  });
};

// Update comment
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
      // Invalidate comments list and task data to reflect changes
      queryClient.invalidateQueries({ queryKey: commentKeys.list(workspaceId, projectId, taskId) });
      // Also invalidate task queries since comments are embedded in task data
      queryClient.invalidateQueries({ queryKey: ['tasks', workspaceId, projectId, taskId] });
    },
    onError: (error) => {
      console.error('Failed to update comment:', error);
    },
  });
};

// Delete comment
export const useDeleteComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ workspaceId, projectId, taskId, commentId }: { workspaceId: string; projectId: string; taskId: string; commentId: string }) =>
      commentService.deleteComment(workspaceId, projectId, taskId, commentId),
    onSuccess: (_, { workspaceId, projectId, taskId }) => {
      // Invalidate comments list and task data
      queryClient.invalidateQueries({ queryKey: commentKeys.list(workspaceId, projectId, taskId) });
      // Also invalidate task queries since comments are embedded in task data
      queryClient.invalidateQueries({ queryKey: ['tasks', workspaceId, projectId, taskId] });
    },
    onError: (error) => {
      console.error('Failed to delete comment:', error);
    },
  });
};