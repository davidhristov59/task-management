import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SearchState {
  // Recent searches
  recentSearches: string[];
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;

  // Search preferences
  searchTypes: ('workspace' | 'project' | 'task')[];
  setSearchTypes: (types: ('workspace' | 'project' | 'task')[]) => void;

  // Search history for analytics
  searchHistory: Array<{
    query: string;
    timestamp: string;
    resultCount: number;
  }>;
  addSearchToHistory: (query: string, resultCount: number) => void;
}

export const useSearchStore = create<SearchState>()(
  persist(
    (set) => ({
      // Recent searches
      recentSearches: [],
      addRecentSearch: (query: string) => {
        const trimmedQuery = query.trim();
        if (!trimmedQuery || trimmedQuery.length < 2) return;
        
        set((state) => {
          const filtered = state.recentSearches.filter(s => s !== trimmedQuery);
          return {
            recentSearches: [trimmedQuery, ...filtered].slice(0, 10) // Keep only 10 recent searches
          };
        });
      },
      clearRecentSearches: () => set({ recentSearches: [] }),

      // Search preferences
      searchTypes: ['workspace', 'project', 'task'],
      setSearchTypes: (types) => set({ searchTypes: types }),

      // Search history
      searchHistory: [],
      addSearchToHistory: (query: string, resultCount: number) => {
        const trimmedQuery = query.trim();
        if (!trimmedQuery || trimmedQuery.length < 2) return;
        
        set((state) => ({
          searchHistory: [
            {
              query: trimmedQuery,
              timestamp: new Date().toISOString(),
              resultCount,
            },
            ...state.searchHistory.slice(0, 99) // Keep only 100 history items
          ]
        }));
      },
    }),
    {
      name: 'search-store',
      // Only persist preferences and recent searches, not full history
      partialize: (state) => ({
        recentSearches: state.recentSearches,
        searchTypes: state.searchTypes,
      }),
    }
  )
);