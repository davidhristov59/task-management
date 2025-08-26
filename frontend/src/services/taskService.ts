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
  // Get all tasks in a project
  getTasks: async (workspaceId: string, projectId: string): Promise<NormalizedTask[]> => {
    const response = await api.get<Task[]>(`/workspaces/${workspaceId}/projects/${projectId}/tasks`);
    return normalizeTasks(response.data);
  },

  // Get task by ID
  getTask: async (workspaceId: string, projectId: string, taskId: string): Promise<NormalizedTask> => {
    const response = await api.get<Task>(`/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}`);
    return normalizeTask(response.data);
  },

  // Create new task
  createTask: async (workspaceId: string, projectId: string, task: CreateTaskRequest): Promise<NormalizedTask> => {
    const response = await api.post<Task>(`/workspaces/${workspaceId}/projects/${projectId}/tasks`, task);
    return normalizeTask(response.data);
  },

  // Update task
  updateTask: async (workspaceId: string, projectId: string, taskId: string, task: UpdateTaskRequest): Promise<NormalizedTask> => {
    const response = await api.put<Task>(`/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}`, task);
    return normalizeTask(response.data);
  },

  // Delete task
  deleteTask: async (workspaceId: string, projectId: string, taskId: string): Promise<void> => {
    await api.delete(`/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}`);
    // Handle 204 No Content response - no data to return
    return;
  },

  // Mark task as complete
  completeTask: async (workspaceId: string, projectId: string, taskId: string): Promise<void> => {
    await api.post(`/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/complete`);
  },

  // Mark task as incomplete
  uncompleteTask: async (workspaceId: string, projectId: string, taskId: string): Promise<void> => {
    await api.delete(`/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/complete`);
  },

  // Assign task to user
  assignTask: async (workspaceId: string, projectId: string, taskId: string, assignment: AssignTaskRequest): Promise<void> => {
    await api.post(`/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/assign`, assignment);
  },

  // Unassign task
  unassignTask: async (workspaceId: string, projectId: string, taskId: string): Promise<void> => {
    await api.delete(`/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/assign`);
  },

  // Get tasks assigned to a specific user
  getTasksByUser: async (workspaceId: string, projectId: string, userId: string): Promise<NormalizedTask[]> => {
    const response = await api.get<Task[]>(`/workspaces/${workspaceId}/projects/${projectId}/tasks?assignedUserId=${userId}`);
    return normalizeTasks(response.data);
  },

  // Get tasks by status
  getTasksByStatus: async (workspaceId: string, projectId: string, status: string): Promise<NormalizedTask[]> => {
    const response = await api.get<Task[]>(`/workspaces/${workspaceId}/projects/${projectId}/tasks?status=${status}`);
    return normalizeTasks(response.data);
  },

  // Search tasks
  searchTasks: async (workspaceId: string, projectId: string, query: string): Promise<NormalizedTask[]> => {
    const response = await api.get<Task[]>(`/workspaces/${workspaceId}/projects/${projectId}/tasks?search=${encodeURIComponent(query)}`);
    return normalizeTasks(response.data);
  }
};