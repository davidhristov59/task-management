import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;

  
  currentWorkspaceId: string | null;
  currentProjectId: string | null;
  setCurrentWorkspace: (workspaceId: string | null) => void;
  setCurrentProject: (projectId: string | null) => void;

  
  taskViewMode: 'grid' | 'board';
  setTaskViewMode: (mode: 'grid' | 'board') => void;

  
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      
      sidebarCollapsed: false,
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      
      currentWorkspaceId: null,
      currentProjectId: null,
      setCurrentWorkspace: (workspaceId) => set({ 
        currentWorkspaceId: workspaceId,
        
        currentProjectId: workspaceId ? null : null
      }),
      setCurrentProject: (projectId) => set({ currentProjectId: projectId }),

      
      taskViewMode: 'board',
      setTaskViewMode: (mode) => set({ taskViewMode: mode }),

      
      theme: 'light',
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'ui-store',
      
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        taskViewMode: state.taskViewMode,
        theme: state.theme,
      }),
    }
  )
);