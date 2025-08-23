import { create } from 'zustand';
import { api } from '../api/client';

// Updated types to match the backend model
export interface WorkspaceView {
  id: string;
  title: string;
  description: string;
  ownerId: string;
  memberIds: string[];
  archived: boolean;
  createdAt: string;
  lastModifiedAt: string;
}

export interface ProjectView {
  projectId: string;
  title: string;
  description: string;
  workspaceId: string;
  ownerId: string;
  status: string;
  archived: boolean;
  createdAt: string;
  lastModifiedAt: string;
}

interface WorkspaceState {
  workspaces: WorkspaceView[];
  currentWorkspace: WorkspaceView | null;
  members: string[];
  projects: ProjectView[];
  isLoading: boolean;
  error: string | null;
  fetchWorkspaces: () => Promise<void>;
  fetchWorkspace: (id: string) => Promise<void>;
  createWorkspace: (data: { title: string; description?: string; ownerId: string; memberIds?: string[] }) => Promise<void>;
  setCurrentWorkspace: (workspace: WorkspaceView | null) => void;
  fetchMembers: (workspaceId: string) => Promise<void>;
  addMember: (workspaceId: string, memberId: string) => Promise<void>;
  removeMember: (workspaceId: string, memberId: string) => Promise<void>;
  fetchProjects: (workspaceId: string) => Promise<void>;
  createProject: (workspaceId: string, title: string, description?: string, ownerId?: string) => Promise<void>;
  updateWorkspace: (id: string, data: { title?: string; description?: string; ownerId?: string; memberIds?: string[]; archived?: boolean }) => Promise<void>;
  deleteWorkspace: (id: string) => Promise<void>;
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  workspaces: [],
  currentWorkspace: null,
  members: [],
  projects: [],
  isLoading: false,
  error: null,
  
  fetchWorkspaces: async () => {
    try {
      set({ isLoading: true, error: null });
      const data = await api.getWorkspaces();
      
      if (Array.isArray(data) && data.length > 0) {
        set({ workspaces: data });
        console.log("Workspaces set in store:", data);
        
        const { fetchProjects } = get();
        for (const workspace of data) {
          fetchProjects(workspace.id).catch(err => 
            console.error(`Error loading projects for workspace ${workspace.id}:`, err)
          );
        }
      } else {
        console.warn("API returned empty or invalid workspaces array:", data);
        set({ workspaces: [] });
      }
    } catch (error) {
      console.error("Error in fetchWorkspaces:", error);
      set({ error: error instanceof Error ? error.message : "Failed to fetch workspaces" });
    } finally {
      set({ isLoading: false });
    }
  },
  
  fetchWorkspace: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      const workspace = await api.getWorkspace(id);
      if (workspace) {
        set({ currentWorkspace: workspace });
        console.log("Current workspace set:", workspace);
        
        // Also fetch projects for this workspace
        get().fetchProjects(id);
      } else {
        console.log("Workspace not found:", id);
      }
    } catch (error) {
      console.error("Error fetching workspace:", error);
      set({ error: error instanceof Error ? error.message : "Failed to fetch workspace" });
    } finally {
      set({ isLoading: false });
    }
  },
  
  createWorkspace: async (data) => {
    try {
      set({ isLoading: true, error: null });
      
      const workspaceData = {
        title: data.title,
        description: data.description || "",
        ownerId: data.ownerId,
        memberIds: data.memberIds || []
      };
      
      const response = await api.createWorkspace(workspaceData);
      console.log("Created workspace response:", response);
      
      // The backend returns the workspace ID, so we need to fetch the workspace
      await get().fetchWorkspaces();
    } catch (error){
      console.error("Error creating workspace:", error);
      set({ error: error instanceof Error ? error.message : "Failed to create workspace" });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
  
  setCurrentWorkspace: (workspace) => {
    set({ currentWorkspace: workspace });
  },
  
  fetchMembers: async (workspaceId: string) => {
    try {
      set({ isLoading: true, error: null });
      
      // Get the workspace which contains the member IDs
      const workspace = await api.getWorkspace(workspaceId);
      if (workspace) {
        set({ members: workspace.memberIds || [] });
      }
    } catch (error) {
      console.error(`Failed to fetch members for workspace ${workspaceId}:`, error);
      set({ error: error instanceof Error ? error.message : "Failed to fetch workspace members" });
    } finally {
      set({ isLoading: false });
    }
  },
  
  addMember: async (workspaceId: string, memberId: string) => {
    try {
      set({ isLoading: true, error: null });
      
      await api.addMemberToWorkspace(workspaceId, memberId);
      
      // Update the members list
      await get().fetchMembers(workspaceId);
    } catch (error) {
      console.error(`Failed to add member to workspace ${workspaceId}:`, error);
      set({ error: error instanceof Error ? error.message : "Failed to add member to workspace" });
    } finally {
      set({ isLoading: false });
    }
  },
  
  removeMember: async (workspaceId: string, memberId: string) => {
    try {
      set({ isLoading: true, error: null });
      
      await api.removeMemberFromWorkspace(workspaceId, memberId);
      
      // Update the members list
      await get().fetchMembers(workspaceId);
    } catch (error) {
      console.error(`Failed to remove member from workspace ${workspaceId}:`, error);
      set({ error: error instanceof Error ? error.message : "Failed to remove member from workspace" });
    } finally {
      set({ isLoading: false });
    }
  },
    fetchProjects: async (workspaceId: string) => {
    try {
      set({ isLoading: true, error: null });
      
      const projects = await api.getProjects(workspaceId);
      
      if (Array.isArray(projects)) {
        set({ projects });
      } else {
        console.warn("API returned empty or invalid projects array for workspace", workspaceId);
      }
    } catch (error) {
      console.error(`Failed to fetch projects for workspace ${workspaceId}:`, error);
      set({ error: error instanceof Error ? error.message : "Failed to fetch projects" });
    } finally {
      set({ isLoading: false });
    }
  },
  
  createProject: async (workspaceId: string, title: string, description?: string, ownerId?: string) => {
    try {
      set({ isLoading: true, error: null });
      
      // Get the current workspace to use its owner as the project owner if not provided
      const { currentWorkspace } = get();
      const projectOwnerId = ownerId || (currentWorkspace ? currentWorkspace.ownerId : "");
      
      const projectData = {
        title,
        description: description || "",
        ownerId: projectOwnerId
      };
      
      await api.createProject(workspaceId, projectData);
      
      // Refresh the projects list
      await get().fetchProjects(workspaceId);
    } catch (error) {
      console.error(`Failed to create project in workspace ${workspaceId}:`, error);
      set({ error: error instanceof Error ? error.message : "Failed to create project" });
    } finally {
      set({ isLoading: false });
    }
  },
  
  updateWorkspace: async (id: string, data) => {
    try {
      set({ isLoading: true, error: null });
      
      await api.updateWorkspace(id, data);
      
      // Refresh the workspaces list
      await get().fetchWorkspaces();
    } catch (error) {
      console.error(`Failed to update workspace ${id}:`, error);
      set({ error: error instanceof Error ? error.message : "Failed to update workspace" });
    } finally {
      set({ isLoading: false });
    }
  },
  
  deleteWorkspace: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      
      await api.deleteWorkspace(id);
      
      // Remove the workspace from our state
      set(state => ({
        workspaces: state.workspaces.filter(w => w.id !== id),
        currentWorkspace: state.currentWorkspace?.id === id ? null : state.currentWorkspace
      }));
    } catch (error) {
      console.error(`Failed to delete workspace ${id}:`, error);
      set({ error: error instanceof Error ? error.message : "Failed to delete workspace" });
    } finally {
      set({ isLoading: false });
    }
  }
}));