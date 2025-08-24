import api from './api';
import type {
  Task,
  CreateTaskRequest,
  UpdateTaskRequest,
  AssignTaskRequest,
  TasksResponse,
  TaskResponse
} from '../types';

export const taskService = {
  // Get all tasks in a project
  getTasks: async (workspaceId: string, projectId: string): Promise<Task[]> => {
    const response = await api.get<Task[]>(`/workspaces/${workspaceId}/projects/${projectId}/tasks`);
    return response.data;
  },

  // Get task by ID
  getTask: async (taskId: string): Promise<Task> => {
    const response = await api.get<Task>(`/tasks/${taskId}`);
    return response.data;
  },

  // Create new task
  createTask: async (workspaceId: string, projectId: string, task: CreateTaskRequest): Promise<Task> => {
    const response = await api.post<Task>(`/workspaces/${workspaceId}/projects/${projectId}/tasks`, task);
    return response.data;
  },

  // Update task
  updateTask: async (taskId: string, task: UpdateTaskRequest): Promise<Task> => {
    const response = await api.put<Task>(`/tasks/${taskId}`, task);
    return response.data;
  },

  // Delete task
  deleteTask: async (taskId: string): Promise<void> => {
    await api.delete(`/tasks/${taskId}`);
  },

  // Mark task as complete
  completeTask: async (taskId: string): Promise<void> => {
    await api.post(`/tasks/${taskId}/complete`);
  },

  // Mark task as incomplete
  uncompleteTask: async (taskId: string): Promise<void> => {
    await api.delete(`/tasks/${taskId}/complete`);
  },

  // Assign task to user
  assignTask: async (taskId: string, assignment: AssignTaskRequest): Promise<void> => {
    await api.post(`/tasks/${taskId}/assign`, assignment);
  },

  // Unassign task
  unassignTask: async (taskId: string): Promise<void> => {
    await api.delete(`/tasks/${taskId}/assign`);
  },

  // Get tasks assigned to a specific user
  getTasksByUser: async (userId: string): Promise<Task[]> => {
    const response = await api.get<Task[]>(`/tasks?assignedUserId=${userId}`);
    return response.data;
  },

  // Get tasks by status
  getTasksByStatus: async (workspaceId: string, projectId: string, status: string): Promise<Task[]> => {
    const response = await api.get<Task[]>(`/workspaces/${workspaceId}/projects/${projectId}/tasks?status=${status}`);
    return response.data;
  },

  // Search tasks
  searchTasks: async (workspaceId: string, projectId: string, query: string): Promise<Task[]> => {
    const response = await api.get<Task[]>(`/workspaces/${workspaceId}/projects/${projectId}/tasks?search=${encodeURIComponent(query)}`);
    return response.data;
  }
};