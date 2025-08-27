import api from './api';
import type {
  Task,
  CreateTaskRequest,
  UpdateTaskRequest,
  AssignTaskRequest
} from '../types';
import { normalizeTask, normalizeTasks } from '../utils/taskUtils';
import type { NormalizedTask } from '../utils/taskUtils';

export const taskService = {
  
  getTasks: async (workspaceId: string, projectId: string): Promise<NormalizedTask[]> => {
    const response = await api.get<Task[]>(`/workspaces/${workspaceId}/projects/${projectId}/tasks`);
    return normalizeTasks(response.data);
  },

  
  getTask: async (workspaceId: string, projectId: string, taskId: string): Promise<NormalizedTask> => {
    const response = await api.get<Task>(`/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}`);
    return normalizeTask(response.data);
  },

  
  createTask: async (workspaceId: string, projectId: string, task: CreateTaskRequest): Promise<{ taskId: string }> => {
    const response = await api.post(`/workspaces/${workspaceId}/projects/${projectId}/tasks`, task);
    
    
    if (response.data && response.data.value) {
      return { taskId: response.data.value };
    }
    
    
    const taskId = response.headers['location']?.split('/').pop();
    if (taskId) {
      return { taskId };
    }
    
    
    const tempId = `temp-${Date.now()}`;
    console.warn('No task ID found in response, using temporary ID:', tempId);
    return { taskId: tempId };
  },

  
  updateTask: async (workspaceId: string, projectId: string, taskId: string, task: UpdateTaskRequest): Promise<void> => {
    await api.put(`/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}`, task);
    
    
    return;
  },

  
  deleteTask: async (workspaceId: string, projectId: string, taskId: string): Promise<void> => {
    await api.delete(`/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}`);
    
    return;
  },

  
  completeTask: async (workspaceId: string, projectId: string, taskId: string): Promise<void> => {
    await api.post(`/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/complete`);
  },

  
  uncompleteTask: async (workspaceId: string, projectId: string, taskId: string): Promise<void> => {
    await api.delete(`/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/complete`);
  },

  
  assignTask: async (workspaceId: string, projectId: string, taskId: string, assignment: AssignTaskRequest): Promise<void> => {
    await api.post(`/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/assign`, assignment);
  },

  
  unassignTask: async (workspaceId: string, projectId: string, taskId: string): Promise<void> => {
    await api.delete(`/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/assign`);
  },

  
  getTasksByUser: async (workspaceId: string, projectId: string, userId: string): Promise<NormalizedTask[]> => {
    const response = await api.get<Task[]>(`/workspaces/${workspaceId}/projects/${projectId}/tasks?assignedUserId=${userId}`);
    return normalizeTasks(response.data);
  },

  
  getTasksByStatus: async (workspaceId: string, projectId: string, status: string): Promise<NormalizedTask[]> => {
    const response = await api.get<Task[]>(`/workspaces/${workspaceId}/projects/${projectId}/tasks?status=${status}`);
    return normalizeTasks(response.data);
  },

  
  searchTasks: async (workspaceId: string, projectId: string, query: string): Promise<NormalizedTask[]> => {
    const response = await api.get<Task[]>(`/workspaces/${workspaceId}/projects/${projectId}/tasks?search=${encodeURIComponent(query)}`);
    return normalizeTasks(response.data);
  }
};