import api from './api';
import type {
  Project,
  CreateProjectRequest,
  UpdateProjectRequest,
  ProjectsResponse,
  ProjectResponse
} from '../types';

export const projectService = {
  // Get all projects in a workspace
  getProjects: async (workspaceId: string): Promise<Project[]> => {
    const response = await api.get<ProjectsResponse>(`/workspaces/${workspaceId}/projects`);
    return response.data.data;
  },

  // Get project by ID
  getProject: async (workspaceId: string, projectId: string): Promise<Project> => {
    const response = await api.get<ProjectResponse>(`/workspaces/${workspaceId}/projects/${projectId}`);
    return response.data.data;
  },

  // Create new project
  createProject: async (workspaceId: string, project: CreateProjectRequest): Promise<Project> => {
    const response = await api.post<ProjectResponse>(`/workspaces/${workspaceId}/projects`, project);
    return response.data.data;
  },

  // Update project
  updateProject: async (workspaceId: string, projectId: string, project: UpdateProjectRequest): Promise<Project> => {
    const response = await api.put<ProjectResponse>(`/workspaces/${workspaceId}/projects/${projectId}`, project);
    return response.data.data;
  },

  // Delete project
  deleteProject: async (workspaceId: string, projectId: string): Promise<void> => {
    await api.delete(`/workspaces/${workspaceId}/projects/${projectId}`);
  },

  // Archive project
  archiveProject: async (workspaceId: string, projectId: string): Promise<void> => {
    await api.post(`/workspaces/${workspaceId}/projects/${projectId}/archive`);
  },

  // Unarchive project
  unarchiveProject: async (workspaceId: string, projectId: string): Promise<void> => {
    await api.delete(`/workspaces/${workspaceId}/projects/${projectId}/archive`);
  },

  // Get archived projects
  getArchivedProjects: async (workspaceId: string): Promise<Project[]> => {
    const response = await api.get<ProjectsResponse>(`/workspaces/${workspaceId}/projects?archived=true`);
    return response.data.data;
  }
};