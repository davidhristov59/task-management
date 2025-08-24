import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 5 minutes
      staleTime: 5 * 60 * 1000,
      // Keep data in cache for 10 minutes
      gcTime: 10 * 60 * 1000,
      // Retry failed requests only once for development
      retry: 1,
      // Shorter retry delay for development
      retryDelay: 1000,
      // Don't refetch on window focus during development
      refetchOnWindowFocus: false,
      // Don't refetch on reconnect during development
      refetchOnReconnect: false,
    },
    mutations: {
      // Don't retry failed mutations during development
      retry: 0,
    },
  },
});

// Global error handler for queries
queryClient.setMutationDefaults(['workspace'], {
  onError: (error) => {
    console.error('Workspace operation failed:', error);
  },
});

queryClient.setMutationDefaults(['project'], {
  onError: (error) => {
    console.error('Project operation failed:', error);
  },
});

queryClient.setMutationDefaults(['task'], {
  onError: (error) => {
    console.error('Task operation failed:', error);
  },
});