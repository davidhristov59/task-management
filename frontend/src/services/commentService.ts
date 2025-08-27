import api from './api';
import type {
  Comment,
  CreateCommentRequest,
  UpdateCommentRequest
} from '../types';

export const commentService = {
  // Get all comments for a task (extracted from task data)
  getComments: async (workspaceId: string, projectId: string, taskId: string): Promise<Comment[]> => {
    // Comments are embedded in task data, so we fetch the task and extract comments
    const response = await api.get(`/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}`);
    const task = response.data;
    
    // Parse comments from JSON string
    try {
      return JSON.parse(task.comments || '[]');
    } catch {
      return [];
    }
  },

  // Create new comment
  createComment: async (workspaceId: string, projectId: string, taskId: string, comment: CreateCommentRequest): Promise<void> => {
    // API responds with 201 Created and no body
    await api.post(`/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/comments`, comment);
  },

  // Update comment
  updateComment: async (workspaceId: string, projectId: string, taskId: string, commentId: string, comment: CreateCommentRequest): Promise<void> => {
    // API responds with 200 OK and no body
    await api.put(`/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/comments/${commentId}`, comment);
  },

  // Delete comment
  deleteComment: async (workspaceId: string, projectId: string, taskId: string, commentId: string): Promise<void> => {
    // API responds with 204 No Content and no body
    await api.delete(`/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/comments/${commentId}`);
  }
};