import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { workspaceService } from '../services';
import type { UpdateWorkspaceRequest } from '../types';


export const workspaceKeys = {
  all: ['workspaces'] as const,
  lists: () => [...workspaceKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...workspaceKeys.lists(), { filters }] as const,
  details: () => [...workspaceKeys.all, 'detail'] as const,
  detail: (id: string) => [...workspaceKeys.details(), id] as const,
};




export const useWorkspaces = () => {
  return useQuery({
    queryKey: workspaceKeys.lists(),
    queryFn: workspaceService.getWorkspaces,
  });
};


export const useWorkspace = (workspaceId: string) => {
  return useQuery({
    queryKey: workspaceKeys.detail(workspaceId),
    queryFn: async () => {
      const workspace = await workspaceService.getWorkspace(workspaceId);
      console.log('🔍 Workspace API Response:', workspace);
      console.log('🔍 MemberIds:', workspace.memberIds, 'Type:', typeof workspace.memberIds, 'IsArray:', Array.isArray(workspace.memberIds));
      if (workspace.memberIds) {
        console.log('🔍 MemberIds Length:', workspace.memberIds.length);
        console.log('🔍 MemberIds Content:', workspace.memberIds);
      }
      return workspace;
    },
    enabled: !!workspaceId,
  });
};


export const useCreateWorkspace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: workspaceService.createWorkspace,
    onSuccess: async () => {
      
      await queryClient.invalidateQueries({ queryKey: workspaceKeys.lists() });
      await queryClient.refetchQueries({ queryKey: workspaceKeys.lists() });
    },
    onError: (error) => {
      console.error('Failed to create workspace:', error);
    },
  });
};


export const useUpdateWorkspace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ workspaceId, data }: { workspaceId: string; data: UpdateWorkspaceRequest }) =>
      workspaceService.updateWorkspace(workspaceId, data),
    onSuccess: (_, { workspaceId, data }) => {
      
      const currentWorkspace = queryClient.getQueryData(workspaceKeys.detail(workspaceId));
      if (currentWorkspace) {
        queryClient.setQueryData(workspaceKeys.detail(workspaceId), {
          ...currentWorkspace,
          ...data,
        });
      }

      
      const currentWorkspaces = queryClient.getQueryData(workspaceKeys.lists());
      if (currentWorkspaces && Array.isArray(currentWorkspaces)) {
        queryClient.setQueryData(workspaceKeys.lists(), 
          currentWorkspaces.map((workspace: any) => 
            workspace.workspaceId === workspaceId 
              ? { ...workspace, ...data }
              : workspace
          )
        );
      }
    },
    onError: (error) => {
      console.error('Failed to update workspace:', error);
    },
  });
};


export const useDeleteWorkspace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: workspaceService.deleteWorkspace,
    onSuccess: (_, workspaceId) => {
      
      queryClient.removeQueries({ queryKey: workspaceKeys.detail(workspaceId) });
      
      
      const currentWorkspaces = queryClient.getQueryData(workspaceKeys.lists());
      if (currentWorkspaces && Array.isArray(currentWorkspaces)) {
        queryClient.setQueryData(workspaceKeys.lists(), 
          currentWorkspaces.filter((workspace: any) => workspace.workspaceId !== workspaceId)
        );
      }
    },
    onError: (error) => {
      console.error('Failed to delete workspace:', error);
    },
  });
};


export const useAddWorkspaceMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ workspaceId, userId }: { workspaceId: string; userId: string }) =>
      workspaceService.addMember(workspaceId, { userId }),
    onSuccess: async (_, { workspaceId }) => {
      
      await queryClient.invalidateQueries({ queryKey: workspaceKeys.detail(workspaceId) });
      await queryClient.invalidateQueries({ queryKey: workspaceKeys.lists() });
      
      
      await queryClient.refetchQueries({ queryKey: workspaceKeys.detail(workspaceId) });
      await queryClient.refetchQueries({ queryKey: workspaceKeys.lists() });
    },
    onError: (error) => {
      console.error('Failed to add workspace member:', error);
    },
  });
};


export const useRemoveWorkspaceMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ workspaceId, userId }: { workspaceId: string; userId: string }) =>
      workspaceService.removeMember(workspaceId, userId),
    onSuccess: async (_, { workspaceId }) => {
      
      await queryClient.invalidateQueries({ queryKey: workspaceKeys.detail(workspaceId) });
      await queryClient.invalidateQueries({ queryKey: workspaceKeys.lists() });
      
      
      await queryClient.refetchQueries({ queryKey: workspaceKeys.detail(workspaceId) });
      await queryClient.refetchQueries({ queryKey: workspaceKeys.lists() });
    },
    onError: (error) => {
      console.error('Failed to remove workspace member:', error);
    },
  });
};