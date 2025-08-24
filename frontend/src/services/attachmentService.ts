import api from './api';
import type {
  Attachment,
  CreateAttachmentRequest,
  AttachmentsResponse,
  AttachmentResponse
} from '../types';

export const attachmentService = {
  // Get all attachments for a task
  getAttachments: async (taskId: string): Promise<Attachment[]> => {
    const response = await api.get<Attachment[]>(`/tasks/${taskId}/attachments`);
    return response.data;
  },

  // Get attachment by ID
  getAttachment: async (taskId: string, attachmentId: string): Promise<Attachment> => {
    const response = await api.get<Attachment>(`/tasks/${taskId}/attachments/${attachmentId}`);
    return response.data;
  },

  // Create new attachment (upload file)
  createAttachment: async (taskId: string, attachment: CreateAttachmentRequest): Promise<Attachment> => {
    const response = await api.post<Attachment>(`/tasks/${taskId}/attachments`, attachment);
    return response.data;
  },

  // Upload file attachment with FormData
  uploadAttachment: async (taskId: string, file: File): Promise<Attachment> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileName', file.name);
    formData.append('fileType', file.type);
    formData.append('fileSize', file.size.toString());

    const response = await api.post<Attachment>(`/tasks/${taskId}/attachments/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete attachment
  deleteAttachment: async (taskId: string, attachmentId: string): Promise<void> => {
    await api.delete(`/tasks/${taskId}/attachments/${attachmentId}`);
  },

  // Download attachment
  downloadAttachment: async (taskId: string, attachmentId: string): Promise<Blob> => {
    const response = await api.get(`/tasks/${taskId}/attachments/${attachmentId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Get attachment download URL
  getAttachmentDownloadUrl: (taskId: string, attachmentId: string): string => {
    return `${api.defaults.baseURL}/tasks/${taskId}/attachments/${attachmentId}/download`;
  }
};