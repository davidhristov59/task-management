import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { projectService } from '../services';
import type { CreateProjectRequest, UpdateProjectRequest } from '../types';
import { taskKeys } from './useTasks';


export const projectKeys = {
  all: ['projects'] as const,
  lists: () => [...projectKeys.all, 'list'] as const,
  list: (workspaceId: string, filters?: Record<string, any>) =>
    [...projectKeys.lists(), workspaceId, { filters }] as const,
  details: () => [...projectKeys.all, 'detail'] as const,
  detail: (workspaceId: string, projectId: string) =>
    [...projectKeys.details(), workspaceId, projectId] as const,
};


export const useProjects = (workspaceId: string) => {
  return useQuery({
    queryKey: projectKeys.list(workspaceId),
    queryFn: () => projectService.getProjects(workspaceId),
    enabled: !!workspaceId,
  });
};


export const useProject = (workspaceId: string, projectId: string) => {
  return useQuery({
    queryKey: projectKeys.detail(workspaceId, projectId),
    queryFn: () => projectService.getProject(workspaceId, projectId),
    enabled: !!workspaceId && !!projectId,
  });
};


export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ workspaceId, data }: { workspaceId: string; data: CreateProjectRequest }) =>
      projectService.createProject(workspaceId, data),
    onSuccess: (newProject, { workspaceId }) => {
      console.log('Create project success:', newProject);

      
      queryClient.invalidateQueries({
        queryKey: projectKeys.list(workspaceId),
        refetchType: 'active'
      });

      
      queryClient.invalidateQueries({
        queryKey: projectKeys.lists(),
        refetchType: 'active'
      });

      
      if (newProject && newProject.projectId && newProject.projectId.value) {
        queryClient.setQueryData(
          projectKeys.detail(workspaceId, newProject.projectId.value),
          newProject
        );
      }
    },
    onError: (error) => {
      console.error('Failed to create project:', error);
    },
  });
};


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
    onSuccess: async (updatedProject, { workspaceId, projectId }) => {
      console.log('Update project success:', updatedProject);

      
      if (updatedProject && updatedProject.projectId && updatedProject.projectId.value) {
        queryClient.setQueryData(
          projectKeys.detail(workspaceId, updatedProject.projectId.value),
          updatedProject
        );
      }

      
      await queryClient.invalidateQueries({
        queryKey: projectKeys.list(workspaceId),
        refetchType: 'active'
      });

      
      await queryClient.invalidateQueries({
        queryKey: projectKeys.lists(),
        refetchType: 'active'
      });

      
      await queryClient.invalidateQueries({
        queryKey: projectKeys.detail(workspaceId, projectId),
        refetchType: 'active'
      });

      
      await queryClient.invalidateQueries({
        queryKey: taskKeys.list(workspaceId, projectId),
        refetchType: 'active'
      });
    },
    onError: (error) => {
      console.error('Failed to update project:', error);
    },
  });
};


export const useDeleteProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ workspaceId, projectId }: { workspaceId: string; projectId: string }) =>
      projectService.deleteProject(workspaceId, projectId),
    onSuccess: async (_, { workspaceId, projectId }) => {
      
      queryClient.removeQueries({
        queryKey: projectKeys.detail(workspaceId, projectId)
      });

      
      await queryClient.invalidateQueries({
        queryKey: projectKeys.list(workspaceId),
        refetchType: 'active'
      });

      
      await queryClient.invalidateQueries({
        queryKey: projectKeys.lists(),
        refetchType: 'active'
      });
    },
    onError: (error) => {
      console.error('Failed to delete project:', error);
    },
  });
};


export const useArchiveProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ workspaceId, projectId, archived }: {
      workspaceId: string;
      projectId: string;
      archived: boolean
    }) => {
      if (archived) {
        return projectService.archiveProject(workspaceId, projectId);
      } else {
        return projectService.unarchiveProject(workspaceId, projectId);
      }
    },
    onSuccess: async (_, { workspaceId, projectId }) => {
      
      await queryClient.invalidateQueries({
        queryKey: projectKeys.detail(workspaceId, projectId),
        refetchType: 'active'
      });

      
      await queryClient.invalidateQueries({
        queryKey: projectKeys.list(workspaceId),
        refetchType: 'active'
      });

      
      await queryClient.invalidateQueries({
        queryKey: projectKeys.lists(),
        refetchType: 'active'
      });

      
      await queryClient.invalidateQueries({
        queryKey: taskKeys.list(workspaceId, projectId),
        refetchType: 'active'
      });
    },
    onError: (error) => {
      console.error('Failed to archive project:', error);
    },
  });
};