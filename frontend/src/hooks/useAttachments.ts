import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { attachmentService } from '../services';
import type { CreateAttachmentRequest } from '../types';

// Query keys
export const attachmentKeys = {
  all: ['attachments'] as const,
  lists: () => [...attachmentKeys.all, 'list'] as const,
  list: (taskId: string) => [...attachmentKeys.lists(), taskId] as const,
};

// Get attachments for a task
export const useAttachments = (taskId: string) => {
  return useQuery({
    queryKey: attachmentKeys.list(taskId),
    queryFn: () => attachmentService.getAttachments(taskId),
    enabled: !!taskId,
  });
};

// Create attachment
export const useCreateAttachment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      taskId, 
      data 
    }: { 
      taskId: string; 
      data: CreateAttachmentRequest 
    }) => attachmentService.createAttachment(taskId, data),
    onSuccess: (_, { taskId }) => {
      // Invalidate and refetch attachments list for this task
      queryClient.invalidateQueries({ queryKey: attachmentKeys.list(taskId) });
    },
    onError: (error) => {
      console.error('Failed to create attachment:', error);
    },
  });
};

// Delete attachment
export const useDeleteAttachment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, attachmentId }: { taskId: string; attachmentId: string }) =>
      attachmentService.deleteAttachment(taskId, attachmentId),
    onSuccess: (_, { taskId }) => {
      // Invalidate attachments list
      queryClient.invalidateQueries({ queryKey: attachmentKeys.list(taskId) });
    },
    onError: (error) => {
      console.error('Failed to delete attachment:', error);
    },
  });
};