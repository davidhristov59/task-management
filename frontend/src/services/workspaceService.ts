import api from './api';
import type {
  Workspace,
  CreateWorkspaceRequest,
  UpdateWorkspaceRequest,
  AddWorkspaceMemberRequest
} from '../types';

export const workspaceService = {
  
  transformWorkspace: (apiWorkspace: any): Workspace => {
    
    let memberIds: string[] = [];
    
    if (apiWorkspace.memberIdsList && Array.isArray(apiWorkspace.memberIdsList)) {
      memberIds = apiWorkspace.memberIdsList.map((memberStr: string) => {
        try {
          const memberObj = JSON.parse(memberStr);
          return memberObj.userId || memberStr;
        } catch (error) {
          
          return memberStr;
        }
      });
    } else if (apiWorkspace.memberIds && Array.isArray(apiWorkspace.memberIds)) {
      
      memberIds = apiWorkspace.memberIds;
    }

    return {
      ...apiWorkspace,
      memberIds,
      
      memberIdsList: undefined,
    };
  },

  
  getWorkspaces: async (): Promise<Workspace[]> => {
    const response = await api.get<any[]>('/workspaces');
    return response.data.map(workspaceService.transformWorkspace);
  },

  
  getWorkspace: async (workspaceId: string): Promise<Workspace> => {
    const response = await api.get<any>(`/workspaces/${workspaceId}`);
    return workspaceService.transformWorkspace(response.data);
  },

  
  createWorkspace: async (workspace: CreateWorkspaceRequest): Promise<string> => {
    const response = await api.post<string>('/workspaces', workspace);
    return response.data; 
  },

  
  updateWorkspace: async (workspaceId: string, workspace: UpdateWorkspaceRequest): Promise<void> => {
    await api.put(`/workspaces/${workspaceId}`, workspace);
    
  },

  
  deleteWorkspace: async (workspaceId: string): Promise<void> => {
    await api.delete(`/workspaces/${workspaceId}`);
  },

  
  addMember: async (workspaceId: string, member: AddWorkspaceMemberRequest): Promise<void> => {
    await api.post(`/workspaces/${workspaceId}/members`, member);
  },

  
  removeMember: async (workspaceId: string, userId: string): Promise<void> => {
    await api.delete(`/workspaces/${workspaceId}/members/${userId}`);
  },

  
  getMembers: async (workspaceId: string): Promise<string[]> => {
    const response = await api.get<string[]>(`/workspaces/${workspaceId}/members`);
    return response.data;
  }
};