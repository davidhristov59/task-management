import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { attachmentService } from '../services';
import type { CreateAttachmentRequest } from '../types';

// Query keys
export const attachmentKeys = {
  all: ['attachments'] as const,
  lists: () => [...attachmentKeys.all, 'list'] as const,
  list: (workspaceId: string, projectId: string, taskId: string) => [...attachmentKeys.lists(), workspaceId, projectId, taskId] as const,
};

// Get attachments for a task
export const useAttachments = (workspaceId: string, projectId: string, taskId: string) => {
  return useQuery({
    queryKey: attachmentKeys.list(workspaceId, projectId, taskId),
    queryFn: () => attachmentService.getAttachments(workspaceId, projectId, taskId),
    enabled: !!workspaceId && !!projectId && !!taskId,
  });
};

// Create attachment
export const useCreateAttachment = () => {
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
      data: CreateAttachmentRequest 
    }) => attachmentService.createAttachment(workspaceId, projectId, taskId, data),
    onSuccess: (_, { workspaceId, projectId, taskId }) => {
      // Invalidate and refetch attachments list for this task
      queryClient.invalidateQueries({ queryKey: attachmentKeys.list(workspaceId, projectId, taskId) });
    },
    onError: (error) => {
      console.error('Failed to create attachment:', error);
    },
  });
};

// Upload attachment
export const useUploadAttachment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      workspaceId,
      projectId,
      taskId, 
      file 
    }: { 
      workspaceId: string;
      projectId: string;
      taskId: string; 
      file: File 
    }) => attachmentService.uploadAttachment(workspaceId, projectId, taskId, file),
    onSuccess: (_, { workspaceId, projectId, taskId }) => {
      // Invalidate and refetch attachments list for this task
      queryClient.invalidateQueries({ queryKey: attachmentKeys.list(workspaceId, projectId, taskId) });
    },
    onError: (error) => {
      console.error('Failed to upload attachment:', error);
    },
  });
};

// Delete attachment
export const useDeleteAttachment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ workspaceId, projectId, taskId, attachmentId }: { workspaceId: string; projectId: string; taskId: string; attachmentId: string }) =>
      attachmentService.deleteAttachment(workspaceId, projectId, taskId, attachmentId),
    onSuccess: (_, { workspaceId, projectId, taskId }) => {
      // Invalidate attachments list
      queryClient.invalidateQueries({ queryKey: attachmentKeys.list(workspaceId, projectId, taskId) });
    },
    onError: (error) => {
      console.error('Failed to delete attachment:', error);
    },
  });
};