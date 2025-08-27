import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { attachmentService } from '../services';
import { taskKeys } from './useTasks';
import type { CreateAttachmentRequest } from '../types';


export const attachmentKeys = {
  all: ['attachments'] as const,
  lists: () => [...attachmentKeys.all, 'list'] as const,
  list: (workspaceId: string, projectId: string, taskId: string) => [...attachmentKeys.lists(), workspaceId, projectId, taskId] as const,
};


export const useAttachments = (workspaceId: string, projectId: string, taskId: string) => {
  return useQuery({
    queryKey: attachmentKeys.list(workspaceId, projectId, taskId),
    queryFn: () => attachmentService.getAttachments(workspaceId, projectId, taskId),
    enabled: !!workspaceId && !!projectId && !!taskId,
  });
};


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
      
      queryClient.invalidateQueries({ queryKey: attachmentKeys.list(workspaceId, projectId, taskId) });
      
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(taskId) });
      queryClient.invalidateQueries({ queryKey: taskKeys.list(workspaceId, projectId) });
      
      queryClient.refetchQueries({ queryKey: attachmentKeys.list(workspaceId, projectId, taskId) });
      queryClient.refetchQueries({ queryKey: taskKeys.detail(taskId) });
    },
    onError: (error) => {
      console.error('Failed to create attachment:', error);
    },
  });
};


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
      
      queryClient.invalidateQueries({ queryKey: attachmentKeys.list(workspaceId, projectId, taskId) });
      
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(taskId) });
      queryClient.invalidateQueries({ queryKey: taskKeys.list(workspaceId, projectId) });
      
      queryClient.refetchQueries({ queryKey: attachmentKeys.list(workspaceId, projectId, taskId) });
      queryClient.refetchQueries({ queryKey: taskKeys.detail(taskId) });
    },
    onError: (error) => {
      console.error('Failed to upload attachment:', error);
    },
  });
};


export const useDeleteAttachment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ workspaceId, projectId, taskId, fileId }: { workspaceId: string; projectId: string; taskId: string; fileId: string }) =>
      attachmentService.deleteAttachment(workspaceId, projectId, taskId, fileId),
    onSuccess: (_, { workspaceId, projectId, taskId }) => {
      
      queryClient.invalidateQueries({ queryKey: attachmentKeys.list(workspaceId, projectId, taskId) });
      
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(taskId) });
      queryClient.invalidateQueries({ queryKey: taskKeys.list(workspaceId, projectId) });
      
      queryClient.refetchQueries({ queryKey: attachmentKeys.list(workspaceId, projectId, taskId) });
      queryClient.refetchQueries({ queryKey: taskKeys.detail(taskId) });
    },
    onError: (error) => {
      console.error('Failed to delete attachment:', error);
    },
  });
};