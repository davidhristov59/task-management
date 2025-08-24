import api from './api';
import type {
  Workspace,
  CreateWorkspaceRequest,
  UpdateWorkspaceRequest,
  AddWorkspaceMemberRequest,
  WorkspacesResponse,
  WorkspaceResponse,
  ApiResponse
} from '../types';

export const workspaceService = {
  // Get all workspaces
  getWorkspaces: async (): Promise<Workspace[]> => {
    const response = await api.get<WorkspacesResponse>('/workspaces');
    return response.data.data;
  },

  // Get workspace by ID
  getWorkspace: async (workspaceId: string): Promise<Workspace> => {
    const response = await api.get<WorkspaceResponse>(`/workspaces/${workspaceId}`);
    return response.data.data;
  },

  // Create new workspace
  createWorkspace: async (workspace: CreateWorkspaceRequest): Promise<Workspace> => {
    const response = await api.post<WorkspaceResponse>('/workspaces', workspace);
    return response.data.data;
  },

  // Update workspace
  updateWorkspace: async (workspaceId: string, workspace: UpdateWorkspaceRequest): Promise<Workspace> => {
    const response = await api.put<WorkspaceResponse>(`/workspaces/${workspaceId}`, workspace);
    return response.data.data;
  },

  // Delete workspace
  deleteWorkspace: async (workspaceId: string): Promise<void> => {
    await api.delete(`/workspaces/${workspaceId}`);
  },

  // Add member to workspace
  addMember: async (workspaceId: string, member: AddWorkspaceMemberRequest): Promise<void> => {
    await api.post(`/workspaces/${workspaceId}/members`, member);
  },

  // Remove member from workspace
  removeMember: async (workspaceId: string, userId: string): Promise<void> => {
    await api.delete(`/workspaces/${workspaceId}/members/${userId}`);
  },

  // Get workspace members
  getMembers: async (workspaceId: string): Promise<string[]> => {
    const response = await api.get<ApiResponse<string[]>>(`/workspaces/${workspaceId}/members`);
    return response.data.data;
  }
};