import api from './api';
import type {
  Attachment,
  CreateAttachmentRequest
} from '../types';

export const attachmentService = {
  // Get all attachments for a task (extracted from task data)
  getAttachments: async (workspaceId: string, projectId: string, taskId: string): Promise<Attachment[]> => {
    // Attachments are embedded in task data, so we fetch the task and extract attachments
    const response = await api.get(`/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}`);
    const task = response.data;
    
    // Parse attachments from JSON string
    try {
      return JSON.parse(task.attachments || '[]');
    } catch {
      return [];
    }
  },



  // Create new attachment
  createAttachment: async (workspaceId: string, projectId: string, taskId: string, attachment: CreateAttachmentRequest): Promise<void> => {
    // API responds with 201 Created and no body
    await api.post(`/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/attachments`, attachment);
  },

  // Upload file attachment with FormData
  uploadAttachment: async (workspaceId: string, projectId: string, taskId: string, file: File): Promise<void> => {
    // Create attachment metadata first
    const attachmentData: CreateAttachmentRequest = {
      fileName: file.name,
      fileType: file.type || 'application/octet-stream',
      fileSize: file.size
    };

    // API responds with 201 Created and no body
    await api.post(`/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/attachments`, attachmentData);
  },

  // Delete attachment
  deleteAttachment: async (workspaceId: string, projectId: string, taskId: string, fileId: string): Promise<void> => {
    // API responds with 204 No Content and no body
    await api.delete(`/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/attachments/${fileId}`);
  },

  // Download attachment
  downloadAttachment: async (workspaceId: string, projectId: string, taskId: string, fileId: string): Promise<Blob> => {
    const response = await api.get(`/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/attachments/${fileId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Get attachment download URL
  getAttachmentDownloadUrl: (workspaceId: string, projectId: string, taskId: string, fileId: string): string => {
    return `${api.defaults.baseURL}/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/attachments/${fileId}/download`;
  }
};