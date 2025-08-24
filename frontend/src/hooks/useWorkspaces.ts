import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { workspaceService } from '../services';
import type { UpdateWorkspaceRequest } from '../types';

// Query keys
export const workspaceKeys = {
  all: ['workspaces'] as const,
  lists: () => [...workspaceKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...workspaceKeys.lists(), { filters }] as const,
  details: () => [...workspaceKeys.all, 'detail'] as const,
  detail: (id: string) => [...workspaceKeys.details(), id] as const,
};



// Get all workspaces
export const useWorkspaces = () => {
  return useQuery({
    queryKey: workspaceKeys.lists(),
    queryFn: workspaceService.getWorkspaces,
  });
};

// Get workspace by ID
export const useWorkspace = (workspaceId: string) => {
  return useQuery({
    queryKey: workspaceKeys.detail(workspaceId),
    queryFn: () => workspaceService.getWorkspace(workspaceId),
    enabled: !!workspaceId,
  });
};

// Create workspace
export const useCreateWorkspace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: workspaceService.createWorkspace,
    onSuccess: (workspaceId: string) => {
      // Invalidate and refetch workspaces list
      queryClient.invalidateQueries({ queryKey: workspaceKeys.lists() });
      
      // Note: We can't add to cache since we only have the ID, not the full workspace object
      // The list refetch will get the complete workspace data
    },
    onError: (error) => {
      console.error('Failed to create workspace:', error);
    },
  });
};

// Update workspace
export const useUpdateWorkspace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ workspaceId, data }: { workspaceId: string; data: UpdateWorkspaceRequest }) =>
      workspaceService.updateWorkspace(workspaceId, data),
    onSuccess: (_, { workspaceId }) => {
      // Invalidate workspace detail and list to refetch updated data
      queryClient.invalidateQueries({ queryKey: workspaceKeys.detail(workspaceId) });
      queryClient.invalidateQueries({ queryKey: workspaceKeys.lists() });
    },
    onError: (error) => {
      console.error('Failed to update workspace:', error);
    },
  });
};

// Delete workspace
export const useDeleteWorkspace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: workspaceService.deleteWorkspace,
    onSuccess: (_, workspaceId) => {
      // Remove workspace from cache
      queryClient.removeQueries({ queryKey: workspaceKeys.detail(workspaceId) });
      
      // Invalidate workspaces list
      queryClient.invalidateQueries({ queryKey: workspaceKeys.lists() });
    },
    onError: (error) => {
      console.error('Failed to delete workspace:', error);
    },
  });
};

// Add member to workspace
export const useAddWorkspaceMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ workspaceId, userId }: { workspaceId: string; userId: string }) =>
      workspaceService.addMember(workspaceId, { userId }),
    onSuccess: (_, { workspaceId }) => {
      // Invalidate workspace detail to refetch with new member
      queryClient.invalidateQueries({ queryKey: workspaceKeys.detail(workspaceId) });
      queryClient.invalidateQueries({ queryKey: workspaceKeys.lists() });
    },
    onError: (error) => {
      console.error('Failed to add workspace member:', error);
    },
  });
};

// Remove member from workspace
export const useRemoveWorkspaceMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ workspaceId, userId }: { workspaceId: string; userId: string }) =>
      workspaceService.removeMember(workspaceId, userId),
    onSuccess: (_, { workspaceId }) => {
      // Invalidate workspace detail to refetch without removed member
      queryClient.invalidateQueries({ queryKey: workspaceKeys.detail(workspaceId) });
      queryClient.invalidateQueries({ queryKey: workspaceKeys.lists() });
    },
    onError: (error) => {
      console.error('Failed to remove workspace member:', error);
    },
  });
};