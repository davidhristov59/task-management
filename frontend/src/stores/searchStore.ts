import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SearchState {
  
  recentSearches: string[];
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;

  
  searchTypes: ('workspace' | 'project' | 'task')[];
  setSearchTypes: (types: ('workspace' | 'project' | 'task')[]) => void;

  
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
      
      recentSearches: [],
      addRecentSearch: (query: string) => {
        const trimmedQuery = query.trim();
        if (!trimmedQuery || trimmedQuery.length < 2) return;
        
        set((state) => {
          const filtered = state.recentSearches.filter(s => s !== trimmedQuery);
          return {
            recentSearches: [trimmedQuery, ...filtered].slice(0, 10) 
          };
        });
      },
      clearRecentSearches: () => set({ recentSearches: [] }),

      
      searchTypes: ['workspace', 'project', 'task'],
      setSearchTypes: (types) => set({ searchTypes: types }),

      
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
            ...state.searchHistory.slice(0, 99) 
          ]
        }));
      },
    }),
    {
      name: 'search-store',
      
      partialize: (state) => ({
        recentSearches: state.recentSearches,
        searchTypes: state.searchTypes,
      }),
    }
  )
);