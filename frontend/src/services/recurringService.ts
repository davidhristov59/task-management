import api from './api';
import type {
  CreateRecurringTaskRequest
} from '../types';

export const recurringService = {
  
  createRecurringTask: async (
    workspaceId: string, 
    projectId: string, 
    taskId: string, 
    recurrence: CreateRecurringTaskRequest
  ): Promise<void> => {
    await api.post(`/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/recurring`, recurrence);
  },

  
  updateRecurringTask: async (
    workspaceId: string, 
    projectId: string, 
    taskId: string, 
    recurrence: CreateRecurringTaskRequest
  ): Promise<void> => {
    await api.post(`/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/recurring`, recurrence);
  }
};