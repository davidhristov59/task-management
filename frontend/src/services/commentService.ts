import api from './api';
import type {
  Comment,
  CreateCommentRequest,
  UpdateCommentRequest
} from '../types';

export const commentService = {
  // Get all comments for a task
  getComments: async (taskId: string): Promise<Comment[]> => {
    const response = await api.get<Comment[]>(`/tasks/${taskId}/comments`);
    return response.data;
  },

  // Get comment by ID
  getComment: async (taskId: string, commentId: string): Promise<Comment> => {
    const response = await api.get<Comment>(`/tasks/${taskId}/comments/${commentId}`);
    return response.data;
  },

  // Create new comment
  createComment: async (taskId: string, comment: CreateCommentRequest): Promise<Comment> => {
    const response = await api.post<Comment>(`/tasks/${taskId}/comments`, comment);
    return response.data;
  },

  // Update comment
  updateComment: async (taskId: string, commentId: string, comment: UpdateCommentRequest): Promise<Comment> => {
    const response = await api.put<Comment>(`/tasks/${taskId}/comments/${commentId}`, comment);
    return response.data;
  },

  // Delete comment
  deleteComment: async (taskId: string, commentId: string): Promise<void> => {
    await api.delete(`/tasks/${taskId}/comments/${commentId}`);
  },

  // Get comments by author
  getCommentsByAuthor: async (taskId: string, authorId: string): Promise<Comment[]> => {
    const response = await api.get<Comment[]>(`/tasks/${taskId}/comments?authorId=${authorId}`);
    return response.data;
  }
};