import api from './api';
import type {
  RecurrenceRule,
  CreateRecurringTaskRequest,
  RecurrenceRuleResponse
} from '../types';

export const recurringService = {
  // Get recurring task settings
  getRecurringTask: async (taskId: string): Promise<RecurrenceRule> => {
    const response = await api.get<RecurrenceRuleResponse>(`/tasks/${taskId}/recurring`);
    return response.data.data;
  },

  // Create recurring task settings
  createRecurringTask: async (taskId: string, recurrence: CreateRecurringTaskRequest): Promise<RecurrenceRule> => {
    const response = await api.post<RecurrenceRuleResponse>(`/tasks/${taskId}/recurring`, recurrence);
    return response.data.data;
  },

  // Update recurring task settings
  updateRecurringTask: async (taskId: string, recurrence: CreateRecurringTaskRequest): Promise<RecurrenceRule> => {
    const response = await api.put<RecurrenceRuleResponse>(`/tasks/${taskId}/recurring`, recurrence);
    return response.data.data;
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