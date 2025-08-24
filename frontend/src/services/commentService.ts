import api from './api';
import type {
  Comment,
  CreateCommentRequest,
  UpdateCommentRequest,
  CommentsResponse,
  CommentResponse
} from '../types';

export const commentService = {
  // Get all comments for a task
  getComments: async (taskId: string): Promise<Comment[]> => {
    const response = await api.get<CommentsResponse>(`/tasks/${taskId}/comments`);
    return response.data.data;
  },

  // Get comment by ID
  getComment: async (taskId: string, commentId: string): Promise<Comment> => {
    const response = await api.get<CommentResponse>(`/tasks/${taskId}/comments/${commentId}`);
    return response.data.data;
  },

  // Create new comment
  createComment: async (taskId: string, comment: CreateCommentRequest): Promise<Comment> => {
    const response = await api.post<CommentResponse>(`/tasks/${taskId}/comments`, comment);
    return response.data.data;
  },

  // Update comment
  updateComment: async (taskId: string, commentId: string, comment: UpdateCommentRequest): Promise<Comment> => {
    const response = await api.put<CommentResponse>(`/tasks/${taskId}/comments/${commentId}`, comment);
    return response.data.data;
  },

  // Delete comment
  deleteComment: async (taskId: string, commentId: string): Promise<void> => {
    await api.delete(`/tasks/${taskId}/comments/${commentId}`);
  },

  // Get comments by author
  getCommentsByAuthor: async (taskId: string, authorId: string): Promise<Comment[]> => {
    const response = await api.get<CommentsResponse>(`/tasks/${taskId}/comments?authorId=${authorId}`);
    return response.data.data;
  }
};