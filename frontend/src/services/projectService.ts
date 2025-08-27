import api from './api';
import type {
  Project,
  CreateProjectRequest,
  UpdateProjectRequest
} from '../types';

export const projectService = {
  // Get all projects in a workspace
  getProjects: async (workspaceId: string): Promise<Project[]> => {
    const response = await api.get<Project[]>(`/workspaces/${workspaceId}/projects`);
    return response.data;
  },

  // Get project by ID
  getProject: async (workspaceId: string, projectId: string): Promise<Project> => {
    const response = await api.get<Project>(`/workspaces/${workspaceId}/projects/${projectId}`);
    return response.data;
  },

  // Create new project
  createProject: async (workspaceId: string, project: CreateProjectRequest): Promise<Project> => {
    console.log('Creating project:', { workspaceId, project });
    const response = await api.post<Project>(`/workspaces/${workspaceId}/projects`, project);
    console.log('Create project response:', response.data);
    return response.data;
  },

  // Update project
  updateProject: async (workspaceId: string, projectId: string, project: UpdateProjectRequest): Promise<Project> => {
    console.log('Updating project:', { workspaceId, projectId, project });
    const response = await api.put<Project>(`/workspaces/${workspaceId}/projects/${projectId}`, project);
    console.log('Update project response:', response.data);
    return response.data;
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
    await api.post(`/workspaces/${workspaceId}/projects/${projectId}/archive`);
  },

  // Get archived projects
  getArchivedProjects: async (workspaceId: string): Promise<Project[]> => {
    const response = await api.get<Project[]>(`/workspaces/${workspaceId}/projects?archived=true`);
    return response.data;
  }
};