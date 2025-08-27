import api from './api';
import type {
  CreateRecurringTaskRequest
} from '../types';

export const recurringService = {
  // Create recurring task settings
  createRecurringTask: async (
    workspaceId: string, 
    projectId: string, 
    taskId: string, 
    recurrence: CreateRecurringTaskRequest
  ): Promise<void> => {
    await api.post(`/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/recurring`, recurrence);
  },

  // Update recurring task settings (same endpoint and request as create)
  updateRecurringTask: async (
    workspaceId: string, 
    projectId: string, 
    taskId: string, 
    recurrence: CreateRecurringTaskRequest
  ): Promise<void> => {
    await api.post(`/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/recurring`, recurrence);
  }
};