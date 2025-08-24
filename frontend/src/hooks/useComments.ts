import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { commentService } from '../services';
import type { CreateCommentRequest, UpdateCommentRequest } from '../types';

// Query keys
export const commentKeys = {
  all: ['comments'] as const,
  lists: () => [...commentKeys.all, 'list'] as const,
  list: (taskId: string) => [...commentKeys.lists(), taskId] as const,
};

// Get comments for a task
export const useComments = (taskId: string) => {
  return useQuery({
    queryKey: commentKeys.list(taskId),
    queryFn: () => commentService.getComments(taskId),
    enabled: !!taskId,
  });
};

// Create comment
export const useCreateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      taskId, 
      data 
    }: { 
      taskId: string; 
      data: CreateCommentRequest 
    }) => commentService.createComment(taskId, data),
    onSuccess: (_, { taskId }) => {
      // Invalidate and refetch comments list for this task
      queryClient.invalidateQueries({ queryKey: commentKeys.list(taskId) });
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
      taskId, 
      commentId, 
      data 
    }: { 
      taskId: string; 
      commentId: string; 
      data: UpdateCommentRequest 
    }) => commentService.updateComment(taskId, commentId, data),
    onSuccess: (_, { taskId }) => {
      // Invalidate comments list to reflect changes
      queryClient.invalidateQueries({ queryKey: commentKeys.list(taskId) });
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
    mutationFn: ({ taskId, commentId }: { taskId: string; commentId: string }) =>
      commentService.deleteComment(taskId, commentId),
    onSuccess: (_, { taskId }) => {
      // Invalidate comments list
      queryClient.invalidateQueries({ queryKey: commentKeys.list(taskId) });
    },
    onError: (error) => {
      console.error('Failed to delete comment:', error);
    },
  });
};