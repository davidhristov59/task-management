import { create } from 'zustand';
import { api } from '../api/client';
import { ProjectView } from './workspace-store';

interface ProjectState {
  projects: ProjectView[];
  projectsByWorkspace: Record<string, ProjectView[]>;
  currentProject: ProjectView | null;
  isLoading: boolean;
  projectsLoadedWorkspaces: string[];  
  fetchProjects: (workspaceId: string) => Promise<void>;
  fetchProject: (workspaceId: string, projectId: string) => Promise<void>;
  createProject: (workspaceId: string, title: string, description?: string, ownerId?: string) => Promise<void>;
  updateProject: (workspaceId: string, projectId: string, data: Partial<{ title: string; description: string; status: string; ownerId: string; archived: boolean }>) => Promise<void>;
  setCurrentProject: (project: ProjectView | null) => void;
  archiveProject: (workspaceId: string, projectId: string) => Promise<void>;
  deleteProject: (workspaceId: string, projectId: string) => Promise<void>;
  getProjectsForWorkspace: (workspaceId: string) => ProjectView[];
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  projectsByWorkspace: {},
  currentProject: null,
  isLoading: false,
  projectsLoadedWorkspaces: [],
  
  fetchProjects: async (workspaceId: string) => {
    const { projectsLoadedWorkspaces } = get();
    
    set({ isLoading: true });
    try {
      const workspaceProjects = await api.getProjects(workspaceId);
      
      set(state => {
        // Store projects by workspace ID
        const updatedProjectsByWorkspace = {
          ...state.projectsByWorkspace,
          [workspaceId]: workspaceProjects
        };
        
        // Update the full projects array
        const updatedProjects = [
          ...state.projects.filter(p => p.workspaceId !== workspaceId),
          ...workspaceProjects
        ];
        
        // Track which workspaces we've loaded projects for
        const updatedLoadedWorkspaces = [...projectsLoadedWorkspaces];
        if (!updatedLoadedWorkspaces.includes(workspaceId)) {
          updatedLoadedWorkspaces.push(workspaceId);
        }
        
        return { 
          projects: updatedProjects,
          projectsByWorkspace: updatedProjectsByWorkspace,
          projectsLoadedWorkspaces: updatedLoadedWorkspaces,
          isLoading: false
        };
      });
    } catch (error) {
      console.error(`Error fetching projects for workspace ${workspaceId}:`, error);
      set({ isLoading: false });
    }
  },
  
  fetchProject: async (workspaceId: string, projectId: string) => {
    set({ isLoading: true });
    try {
      const project = await api.getProject(workspaceId, projectId);
      if (project) {
        set({ currentProject: project, isLoading: false });
      }
    } catch (error) {
      console.error(`Error fetching project ${projectId}:`, error);
      set({ isLoading: false });
    }
  },
  
  createProject: async (workspaceId: string, title: string, description?: string, ownerId?: string) => {
    set({ isLoading: true });
    try {
      const projectData = {
        title,
        description: description || "",
        ownerId: ownerId || ""  // Should be provided by the caller
      };
      
      await api.createProject(workspaceId, projectData);
      
      // Refresh projects for this workspace
      await get().fetchProjects(workspaceId);
    } catch (error) {
      console.error(`Error creating project in workspace ${workspaceId}:`, error);
    } finally {
      set({ isLoading: false });
    }
  },
  
  updateProject: async (workspaceId: string, projectId: string, data) => {
    set({ isLoading: true });
    try {
      await api.updateProject(workspaceId, projectId, data);
      
      // Refresh projects for this workspace
      await get().fetchProjects(workspaceId);
      
      // If this is the current project, update it
      const { currentProject } = get();
      if (currentProject && currentProject.projectId === projectId) {
        await get().fetchProject(workspaceId, projectId);
      }
    } catch (error) {
      console.error(`Error updating project ${projectId}:`, error);
    } finally {
      set({ isLoading: false });
    }
  },
  
  setCurrentProject: (project: ProjectView | null) => {
    set({ currentProject: project });
  },
  
  archiveProject: async (workspaceId: string, projectId: string) => {
    set({ isLoading: true });
    try {
      await api.archiveProject(workspaceId, projectId);
      
      // Refresh projects for this workspace
      await get().fetchProjects(workspaceId);
    } catch (error) {
      console.error(`Error archiving project ${projectId}:`, error);
    } finally {
      set({ isLoading: false });
    }
  },
  
  deleteProject: async (workspaceId: string, projectId: string) => {
    set({ isLoading: true });
    try {
      await api.deleteProject(workspaceId, projectId);
      
      // Update local state
      set(state => ({
        projects: state.projects.filter(p => p.projectId !== projectId),
        projectsByWorkspace: {
          ...state.projectsByWorkspace,
          [workspaceId]: (state.projectsByWorkspace[workspaceId] || [])
            .filter(p => p.projectId !== projectId)
        },
        currentProject: state.currentProject?.projectId === projectId ? null : state.currentProject
      }));
    } catch (error) {
      console.error(`Error deleting project ${projectId}:`, error);
    } finally {
      set({ isLoading: false });
    }
  },
  
  getProjectsForWorkspace: (workspaceId: string) => {
    const { projectsByWorkspace } = get();
    return projectsByWorkspace[workspaceId] || [];
  }
}));