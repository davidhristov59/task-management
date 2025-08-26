import { QueryClient } from '@tanstack/react-query';
import { showToast } from '../components/ui/toast';
import { getApiError, isNetworkError, isServerError } from '../services/api';

// Global error handler for React Query
const handleQueryError = (error: any, context?: string) => {
  const apiError = getApiError(error);
  
  // Don't show toast for network errors (handled by offline indicator)
  if (isNetworkError(error)) {
    console.warn(`${context || 'Query'} failed due to network error:`, apiError.message);
    return;
  }
  
  // Show different messages based on error type
  if (isServerError(error)) {
    showToast.error(`Server error: ${apiError.message}`);
  } else {
    showToast.error(apiError.message);
  }
  
  console.error(`${context || 'Query'} failed:`, apiError);
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 5 minutes
      staleTime: 5 * 60 * 1000,
      // Keep data in cache for 10 minutes
      gcTime: 10 * 60 * 1000,
      // Retry failed requests with smart retry logic
      retry: (failureCount, error) => {
        // Don't retry client errors (4xx)
        if (error && (error as any).response?.status >= 400 && (error as any).response?.status < 500) {
          return false;
        }
        // Retry up to 3 times for network/server errors
        return failureCount < 3;
      },
      // Progressive retry delay
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Refetch on window focus for fresh data
      refetchOnWindowFocus: true,
      // Refetch on reconnect to get latest data
      refetchOnReconnect: true,
    },
    mutations: {
      // Don't retry mutations by default (they should be idempotent if retried)
      retry: 0,
      // Global error handler for mutations
      onError: (error) => handleQueryError(error, 'Mutation'),
    },
  },
});

// Enhanced mutation defaults with success/error handling
queryClient.setMutationDefaults(['workspace'], {
  onSuccess: (_data, _variables, context) => {
    // Invalidate related queries
    queryClient.invalidateQueries({ queryKey: ['workspaces'] });
    
    // Show success message based on operation
    if (context && typeof context === 'object' && 'operation' in context) {
      const operation = (context as any).operation;
      switch (operation) {
        case 'create':
          showToast.success('Workspace created successfully');
          break;
        case 'update':
          showToast.success('Workspace updated successfully');
          break;
        case 'delete':
          showToast.success('Workspace deleted successfully');
          break;
        case 'addMember':
          showToast.success('Member added to workspace');
          break;
        case 'removeMember':
          showToast.success('Member removed from workspace');
          break;
      }
    }
  },
  onError: (error) => handleQueryError(error, 'Workspace operation'),
});

queryClient.setMutationDefaults(['project'], {
  onSuccess: (_data, _variables, context) => {
    // Invalidate related queries
    queryClient.invalidateQueries({ queryKey: ['projects'] });
    queryClient.invalidateQueries({ queryKey: ['workspaces'] });
    
    if (context && typeof context === 'object' && 'operation' in context) {
      const operation = (context as any).operation;
      switch (operation) {
        case 'create':
          showToast.success('Project created successfully');
          break;
        case 'update':
          showToast.success('Project updated successfully');
          break;
        case 'delete':
          showToast.success('Project deleted successfully');
          break;
        case 'archive':
          showToast.success('Project archived successfully');
          break;
      }
    }
  },
  onError: (error) => handleQueryError(error, 'Project operation'),
});

queryClient.setMutationDefaults(['task'], {
  onSuccess: (_data, _variables, context) => {
    // Invalidate related queries
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
    queryClient.invalidateQueries({ queryKey: ['projects'] });
    
    if (context && typeof context === 'object' && 'operation' in context) {
      const operation = (context as any).operation;
      switch (operation) {
        case 'create':
          showToast.success('Task created successfully');
          break;
        case 'update':
          showToast.success('Task updated successfully');
          break;
        case 'delete':
          showToast.success('Task deleted successfully');
          break;
        case 'complete':
          showToast.success('Task completed successfully');
          break;
        case 'assign':
          showToast.success('Task assigned successfully');
          break;
        case 'unassign':
          showToast.success('Task unassigned successfully');
          break;
      }
    }
  },
  onError: (error) => handleQueryError(error, 'Task operation'),
});

queryClient.setMutationDefaults(['comment'], {
  onSuccess: (_data, _variables, context) => {
    queryClient.invalidateQueries({ queryKey: ['comments'] });
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
    
    if (context && typeof context === 'object' && 'operation' in context) {
      const operation = (context as any).operation;
      switch (operation) {
        case 'create':
          showToast.success('Comment added successfully');
          break;
        case 'update':
          showToast.success('Comment updated successfully');
          break;
        case 'delete':
          showToast.success('Comment deleted successfully');
          break;
      }
    }
  },
  onError: (error) => handleQueryError(error, 'Comment operation'),
});

queryClient.setMutationDefaults(['attachment'], {
  onSuccess: (_data, _variables, context) => {
    queryClient.invalidateQueries({ queryKey: ['attachments'] });
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
    
    if (context && typeof context === 'object' && 'operation' in context) {
      const operation = (context as any).operation;
      switch (operation) {
        case 'create':
          showToast.success('File attached successfully');
          break;
        case 'delete':
          showToast.success('Attachment removed successfully');
          break;
      }
    }
  },
  onError: (error) => handleQueryError(error, 'Attachment operation'),
});