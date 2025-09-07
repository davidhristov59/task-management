import api from './api';
import type {
  Project,
  CreateProjectRequest,
  UpdateProjectRequest
} from '../types';

export const projectService = {

  getProjects: async (workspaceId: string): Promise<Project[]> => {
    const response = await api.get<Project[]>(`/workspaces/${workspaceId}/projects`);
    return response.data;
  },


  getProject: async (workspaceId: string, projectId: string): Promise<Project> => {
    const response = await api.get<Project>(`/workspaces/${workspaceId}/projects/${projectId}`);
    return response.data;
  },


  createProject: async (workspaceId: string, project: CreateProjectRequest): Promise<Project> => {
    console.log('Creating project:', { workspaceId, project });
    const response = await api.post<Project>(`/workspaces/${workspaceId}/projects`, project);
    console.log('Create project response:', response.data);
    return response.data;
  },


  updateProject: async (workspaceId: string, projectId: string, project: UpdateProjectRequest): Promise<Project> => {
    console.log('Updating project:', { workspaceId, projectId, project });
    const response = await api.put<Project>(`/workspaces/${workspaceId}/projects/${projectId}`, project);
    console.log('Update project response:', response.data);
    return response.data;
  },


  deleteProject: async (workspaceId: string, projectId: string): Promise<void> => {
    await api.delete(`/workspaces/${workspaceId}/projects/${projectId}`);
  },

  toggleArchiveProject: async (workspaceId: string, projectId: string): Promise<Project> => {
    const response = await api.post<Project>(
        `/workspaces/${workspaceId}/projects/${projectId}/archive`
    );
    return response.data;
  },

  getArchivedProjects: async (workspaceId: string): Promise<Project[]> => {
    const response = await api.get<Project[]>(`/workspaces/${workspaceId}/projects?archived=true`);
    return response.data;
  }
};