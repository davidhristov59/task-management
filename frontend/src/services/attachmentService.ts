import api from './api';
import type {
  Attachment,
  CreateAttachmentRequest
} from '../types';

export const attachmentService = {
  
  getAttachments: async (workspaceId: string, projectId: string, taskId: string): Promise<Attachment[]> => {
    
    const response = await api.get(`/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}`);
    const task = response.data;
    
    
    try {
      return JSON.parse(task.attachments || '[]');
    } catch {
      return [];
    }
  },



  
  createAttachment: async (workspaceId: string, projectId: string, taskId: string, attachment: CreateAttachmentRequest): Promise<void> => {
    
    await api.post(`/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/attachments`, attachment);
  },

  
  uploadAttachment: async (workspaceId: string, projectId: string, taskId: string, file: File): Promise<void> => {
    
    const attachmentData: CreateAttachmentRequest = {
      fileName: file.name,
      fileType: file.type || 'application/octet-stream',
      fileSize: file.size
    };

    
    await api.post(`/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/attachments`, attachmentData);
  },

  
  deleteAttachment: async (workspaceId: string, projectId: string, taskId: string, fileId: string): Promise<void> => {
    
    await api.delete(`/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/attachments/${fileId}`);
  },

  
  downloadAttachment: async (workspaceId: string, projectId: string, taskId: string, fileId: string): Promise<Blob> => {
    const response = await api.get(`/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/attachments/${fileId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  
  getAttachmentDownloadUrl: (workspaceId: string, projectId: string, taskId: string, fileId: string): string => {
    return `${api.defaults.baseURL}/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/attachments/${fileId}/download`;
  }
};