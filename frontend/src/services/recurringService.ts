import api from './api';
import type {
  RecurrenceRule,
  CreateRecurringTaskRequest
} from '../types';

export const recurringService = {
  // Get recurring task settings
  getRecurringTask: async (taskId: string): Promise<RecurrenceRule> => {
    const response = await api.get<RecurrenceRule>(`/tasks/${taskId}/recurring`);
    return response.data;
  },

  // Create recurring task settings
  createRecurringTask: async (taskId: string, recurrence: CreateRecurringTaskRequest): Promise<RecurrenceRule> => {
    const response = await api.post<RecurrenceRule>(`/tasks/${taskId}/recurring`, recurrence);
    return response.data;
  },

  // Update recurring task settings
  updateRecurringTask: async (taskId: string, recurrence: CreateRecurringTaskRequest): Promise<RecurrenceRule> => {
    const response = await api.put<RecurrenceRule>(`/tasks/${taskId}/recurring`, recurrence);
    return response.data;
  },

  // Delete recurring task settings
  deleteRecurringTask: async (taskId: string): Promise<void> => {
    await api.delete(`/tasks/${taskId}/recurring`);
  },

  // Check if task has recurring settings
  hasRecurringSettings: async (taskId: string): Promise<boolean> => {
    try {
      await api.get(`/tasks/${taskId}/recurring`);
      return true;
    } catch (error) {
      return false;
    }
  }
};