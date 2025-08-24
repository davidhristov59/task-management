import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { projectService } from '../services';
import type { CreateProjectRequest, UpdateProjectRequest } from '../types';

// Query keys
export const projectKeys = {
  all: ['projects'] as const,
  lists: () => [...projectKeys.all, 'list'] as const,
  list: (workspaceId: string, filters?: Record<string, any>) => 
    [...projectKeys.lists(), workspaceId, { filters }] as const,
  details: () => [...projectKeys.all, 'detail'] as const,
  detail: (workspaceId: string, projectId: string) => 
    [...projectKeys.details(), workspaceId, projectId] as const,
};

// Get projects in a workspace
export const useProjects = (workspaceId: string) => {
  return useQuery({
    queryKey: projectKeys.list(workspaceId),
    queryFn: () => projectService.getProjects(workspaceId),
    enabled: !!workspaceId,
  });
};

// Get project by ID
export const useProject = (workspaceId: string, projectId: string) => {
  return useQuery({
    queryKey: projectKeys.detail(workspaceId, projectId),
    queryFn: () => projectService.getProject(workspaceId, projectId),
    enabled: !!workspaceId && !!projectId,
  });
};

// Create project
export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ workspaceId, data }: { workspaceId: string; data: CreateProjectRequest }) =>
      projectService.createProject(workspaceId, data),
    onSuccess: (newProject, { workspaceId }) => {
      // Invalidate and refetch projects list for this workspace
      queryClient.invalidateQueries({ queryKey: projectKeys.list(workspaceId) });
      
      // Add the new project to the cache
      queryClient.setQueryData(
        projectKeys.detail(workspaceId, newProject.projectId), 
        newProject
      );
    },
    onError: (error) => {
      console.error('Failed to create project:', error);
    },
  });
};

// Update project
export const useUpdateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      workspaceId, 
      projectId, 
      data 
    }: { 
      workspaceId: string; 
      projectId: string; 
      data: UpdateProjectRequest 
    }) => projectService.updateProject(workspaceId, projectId, data),
    onSuccess: (updatedProject, { workspaceId }) => {
      // Update the project in cache
      queryClient.setQueryData(
        projectKeys.detail(workspaceId, updatedProject.projectId), 
        updatedProject
      );
      
      // Invalidate projects list to reflect changes
      queryClient.invalidateQueries({ queryKey: projectKeys.list(workspaceId) });
    },
    onError: (error) => {
      console.error('Failed to update project:', error);
    },
  });
};

// Delete project
export const useDeleteProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ workspaceId, projectId }: { workspaceId: string; projectId: string }) =>
      projectService.deleteProject(workspaceId, projectId),
    onSuccess: (_, { workspaceId, projectId }) => {
      // Remove project from cache
      queryClient.removeQueries({ 
        queryKey: projectKeys.detail(workspaceId, projectId) 
      });
      
      // Invalidate projects list
      queryClient.invalidateQueries({ queryKey: projectKeys.list(workspaceId) });
    },
    onError: (error) => {
      console.error('Failed to delete project:', error);
    },
  });
};

// Archive project
export const useArchiveProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ workspaceId, projectId }: { workspaceId: string; projectId: string }) =>
      projectService.archiveProject(workspaceId, projectId),
    onSuccess: (_, { workspaceId, projectId }) => {
      // Invalidate project detail and projects list to refetch with updated status
      queryClient.invalidateQueries({ 
        queryKey: projectKeys.detail(workspaceId, projectId) 
      });
      queryClient.invalidateQueries({ queryKey: projectKeys.list(workspaceId) });
    },
    onError: (error) => {
      console.error('Failed to archive project:', error);
    },
  });
};