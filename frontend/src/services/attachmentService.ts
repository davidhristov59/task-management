import api from './api';
import type {
  Attachment,
  CreateAttachmentRequest
} from '../types';

export const attachmentService = {
  // Get all attachments for a task
  getAttachments: async (workspaceId: string, projectId: string, taskId: string): Promise<Attachment[]> => {
    const response = await api.get<Attachment[]>(`/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/attachments`);
    return response.data;
  },

  // Get attachment by ID
  getAttachment: async (workspaceId: string, projectId: string, taskId: string, attachmentId: string): Promise<Attachment> => {
    const response = await api.get<Attachment>(`/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/attachments/${attachmentId}`);
    return response.data;
  },

  // Create new attachment (upload file)
  createAttachment: async (workspaceId: string, projectId: string, taskId: string, attachment: CreateAttachmentRequest): Promise<Attachment> => {
    const response = await api.post<Attachment>(`/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/attachments`, attachment);
    return response.data;
  },

  // Upload file attachment with FormData
  uploadAttachment: async (workspaceId: string, projectId: string, taskId: string, file: File): Promise<Attachment> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileName', file.name);
    formData.append('fileType', file.type);
    formData.append('fileSize', file.size.toString());

    const response = await api.post<Attachment>(`/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/attachments/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete attachment
  deleteAttachment: async (workspaceId: string, projectId: string, taskId: string, attachmentId: string): Promise<void> => {
    await api.delete(`/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/attachments/${attachmentId}`);
  },

  // Download attachment
  downloadAttachment: async (workspaceId: string, projectId: string, taskId: string, attachmentId: string): Promise<Blob> => {
    const response = await api.get(`/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/attachments/${attachmentId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Get attachment download URL
  getAttachmentDownloadUrl: (workspaceId: string, projectId: string, taskId: string, attachmentId: string): string => {
    return `${api.defaults.baseURL}/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/attachments/${attachmentId}/download`;
  }
};