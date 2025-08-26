import api from './api';
import type {
  Workspace,
  CreateWorkspaceRequest,
  UpdateWorkspaceRequest,
  AddWorkspaceMemberRequest
} from '../types';

export const workspaceService = {
  // Helper function to transform API workspace response
  transformWorkspace: (apiWorkspace: any): Workspace => {
    // Transform memberIdsList (array of JSON strings) to memberIds (array of strings)
    let memberIds: string[] = [];
    
    if (apiWorkspace.memberIdsList && Array.isArray(apiWorkspace.memberIdsList)) {
      memberIds = apiWorkspace.memberIdsList.map((memberStr: string) => {
        try {
          const memberObj = JSON.parse(memberStr);
          return memberObj.userId || memberStr;
        } catch (error) {
          // If parsing fails, return the string as-is
          return memberStr;
        }
      });
    } else if (apiWorkspace.memberIds && Array.isArray(apiWorkspace.memberIds)) {
      // Fallback to memberIds if it exists
      memberIds = apiWorkspace.memberIds;
    }

    return {
      ...apiWorkspace,
      memberIds,
      // Remove the original memberIdsList to avoid confusion
      memberIdsList: undefined,
    };
  },

  // Get all workspaces
  getWorkspaces: async (): Promise<Workspace[]> => {
    const response = await api.get<any[]>('/workspaces');
    return response.data.map(workspaceService.transformWorkspace);
  },

  // Get workspace by ID
  getWorkspace: async (workspaceId: string): Promise<Workspace> => {
    const response = await api.get<any>(`/workspaces/${workspaceId}`);
    return workspaceService.transformWorkspace(response.data);
  },

  // Create new workspace
  createWorkspace: async (workspace: CreateWorkspaceRequest): Promise<string> => {
    const response = await api.post<string>('/workspaces', workspace);
    return response.data; // API returns just the workspace ID as a string
  },

  // Update workspace
  updateWorkspace: async (workspaceId: string, workspace: UpdateWorkspaceRequest): Promise<void> => {
    await api.put(`/workspaces/${workspaceId}`, workspace);
    // API returns just 200 OK status, no body
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
    const response = await api.get<string[]>(`/workspaces/${workspaceId}/members`);
    return response.data;
  }
};