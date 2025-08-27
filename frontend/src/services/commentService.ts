import api from './api';
import type {
  Comment,
  CreateCommentRequest
} from '../types';

export const commentService = {
  
  getComments: async (workspaceId: string, projectId: string, taskId: string): Promise<Comment[]> => {
    
    const response = await api.get(`/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}`);
    const task = response.data;
    
    
    try {
      const comments = JSON.parse(task.comments || '[]');
      
      return comments.sort((a: Comment, b: Comment) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    } catch {
      return [];
    }
  },

  
  createComment: async (workspaceId: string, projectId: string, taskId: string, comment: CreateCommentRequest): Promise<void> => {
    
    await api.post(`/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/comments`, comment);
  },

  
  updateComment: async (workspaceId: string, projectId: string, taskId: string, commentId: string, comment: CreateCommentRequest): Promise<void> => {
    
    await api.put(`/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/comments/${commentId}`, comment);
  },

  
  deleteComment: async (workspaceId: string, projectId: string, taskId: string, commentId: string): Promise<void> => {
    
    await api.delete(`/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/comments/${commentId}`);
  }
};