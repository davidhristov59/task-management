import api from './api';
import type {
  Comment,
  CreateCommentRequest,
  UpdateCommentRequest
} from '../types';

export const commentService = {
  // Get all comments for a task
  getComments: async (workspaceId: string, projectId: string, taskId: string): Promise<Comment[]> => {
    const response = await api.get<Comment[]>(`/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/comments`);
    return response.data;
  },

  // Get comment by ID
  getComment: async (workspaceId: string, projectId: string, taskId: string, commentId: string): Promise<Comment> => {
    const response = await api.get<Comment>(`/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/comments/${commentId}`);
    return response.data;
  },

  // Create new comment
  createComment: async (workspaceId: string, projectId: string, taskId: string, comment: CreateCommentRequest): Promise<Comment> => {
    const response = await api.post<Comment>(`/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/comments`, comment);
    return response.data;
  },

  // Update comment
  updateComment: async (workspaceId: string, projectId: string, taskId: string, commentId: string, comment: UpdateCommentRequest): Promise<Comment> => {
    const response = await api.put<Comment>(`/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/comments/${commentId}`, comment);
    return response.data;
  },

  // Delete comment
  deleteComment: async (workspaceId: string, projectId: string, taskId: string, commentId: string): Promise<void> => {
    await api.delete(`/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/comments/${commentId}`);
  },

  // Get comments by author
  getCommentsByAuthor: async (workspaceId: string, projectId: string, taskId: string, authorId: string): Promise<Comment[]> => {
    const response = await api.get<Comment[]>(`/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/comments?authorId=${authorId}`);
    return response.data;
  }
};