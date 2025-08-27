import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { globalSearchService } from '../services/globalSearchService';
import type { GlobalSearchResult } from '../types';


export function useGlobalSearch(query: string, enabled: boolean = true) {
  
  const debouncedQuery = useMemo(() => {
    if (!query || query.length < 2) return '';
    return query.trim();
  }, [query]);

  return useQuery<GlobalSearchResult[]>({
    queryKey: ['globalSearch', debouncedQuery],
    queryFn: () => globalSearchService.search({ query: debouncedQuery, limit: 20 }),
    enabled: enabled && debouncedQuery.length >= 2, 
    staleTime: 30000, 
    gcTime: 300000, 
  });
}


export function useWorkspaceSearch(workspaceId: string, query: string, enabled: boolean = true) {
  return useQuery<GlobalSearchResult[]>({
    queryKey: ['workspaceSearch', workspaceId, query],
    queryFn: () => globalSearchService.searchInWorkspace(workspaceId, query),
    enabled: enabled && query.length >= 2 && !!workspaceId,
    staleTime: 30000,
    gcTime: 300000,
  });
}


export function useProjectSearch(workspaceId: string, projectId: string, query: string, enabled: boolean = true) {
  return useQuery<GlobalSearchResult[]>({
    queryKey: ['projectSearch', workspaceId, projectId, query],
    queryFn: () => globalSearchService.searchInProject(workspaceId, projectId, query),
    enabled: enabled && query.length >= 2 && !!workspaceId && !!projectId,
    staleTime: 30000,
    gcTime: 300000,
  });
}