import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  // Sidebar state
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;

  // Navigation state
  currentWorkspaceId: string | null;
  currentProjectId: string | null;
  setCurrentWorkspace: (workspaceId: string | null) => void;
  setCurrentProject: (projectId: string | null) => void;

  // View preferences
  taskViewMode: 'list' | 'board';
  setTaskViewMode: (mode: 'list' | 'board') => void;

  // User preferences
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      // Sidebar state
      sidebarCollapsed: false,
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      // Navigation state
      currentWorkspaceId: null,
      currentProjectId: null,
      setCurrentWorkspace: (workspaceId) => set({ 
        currentWorkspaceId: workspaceId,
        // Clear project when workspace changes
        currentProjectId: workspaceId ? null : null
      }),
      setCurrentProject: (projectId) => set({ currentProjectId: projectId }),

      // View preferences
      taskViewMode: 'list',
      setTaskViewMode: (mode) => set({ taskViewMode: mode }),

      // User preferences
      theme: 'light',
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'ui-store',
      // Only persist user preferences, not navigation state
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        taskViewMode: state.taskViewMode,
        theme: state.theme,
      }),
    }
  )
);