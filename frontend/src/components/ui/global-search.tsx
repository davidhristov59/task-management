import { useState, useEffect, useRef } from 'react';
import { Search, X, Briefcase, FolderOpen, CheckSquare, Loader2, Clock, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Input } from './input';
import { Button } from './button';
import { Badge } from './badge';
import { useGlobalSearch } from '../../hooks/useGlobalSearch';
import { useSearchStore } from '../../stores/searchStore';
import type { GlobalSearchResult } from '../../types';

interface GlobalSearchProps {
    className?: string;
}

export function GlobalSearch({ className }: GlobalSearchProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const navigate = useNavigate();
    const searchRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const { data: results, isLoading, error } = useGlobalSearch(query);
    const { recentSearches, addRecentSearch, addSearchToHistory } = useSearchStore();

    // Reset selected index when results change or query changes
    useEffect(() => {
        setSelectedIndex(-1);
    }, [results, query]);

    // Handle keyboard shortcuts and navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Global shortcuts
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(true);
                setTimeout(() => inputRef.current?.focus(), 100);
                return;
            }

            // Only handle these keys when search is open
            if (!isOpen) return;

            switch (e.key) {
                case 'Escape':
                    e.preventDefault();
                    e.stopPropagation();
                    handleClose();
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    // Handle navigation for both search results and recent searches
                    if (query && results && results.length > 0) {
                        setSelectedIndex(prev =>
                            prev < results.length - 1 ? prev + 1 : 0
                        );
                    } else if (!query && recentSearches.length > 0) {
                        setSelectedIndex(prev =>
                            prev < recentSearches.length - 1 ? prev + 1 : 0
                        );
                    }
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    // Handle navigation for both search results and recent searches
                    if (query && results && results.length > 0) {
                        setSelectedIndex(prev =>
                            prev > 0 ? prev - 1 : results.length - 1
                        );
                    } else if (!query && recentSearches.length > 0) {
                        setSelectedIndex(prev =>
                            prev > 0 ? prev - 1 : recentSearches.length - 1
                        );
                    }
                    break;
                case 'Enter':
                    e.preventDefault();
                    if (query && selectedIndex >= 0 && results && results[selectedIndex]) {
                        handleResultClick(results[selectedIndex]);
                    } else if (!query && selectedIndex >= 0 && recentSearches[selectedIndex]) {
                        handleRecentSearchClick(recentSearches[selectedIndex]);
                    }
                    break;
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, results, selectedIndex, query, recentSearches]);

    // Handle click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                handleClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isOpen]);

    const handleResultClick = (result: GlobalSearchResult) => {
        // Add to search history
        if (query) {
            addRecentSearch(query);
            addSearchToHistory(query, results?.length || 0);
        }

        switch (result.type) {
            case 'workspace':
                navigate(`/workspaces/${result.id}`);
                break;
            case 'project':
                navigate(`/workspaces/${result.workspaceId}/projects/${result.id}`);
                break;
            case 'task':
                navigate(`/workspaces/${result.workspaceId}/projects/${result.projectId}/tasks/${result.id}`);
                break;
        }
        handleClose();
    };

    const handleRecentSearchClick = (recentQuery: string) => {
        setQuery(recentQuery);
        setTimeout(() => inputRef.current?.focus(), 100);
    };

    const handleClose = () => {
        setIsOpen(false);
        setQuery('');
        setSelectedIndex(-1);
    };

    const getResultIcon = (type: string) => {
        switch (type) {
            case 'workspace':
                return <Briefcase className="h-4 w-4 text-blue-500" />;
            case 'project':
                return <FolderOpen className="h-4 w-4 text-green-500" />;
            case 'task':
                return <CheckSquare className="h-4 w-4 text-purple-500" />;
            default:
                return <Search className="h-4 w-4 text-gray-400" />;
        }
    };

    const getResultBadgeColor = (type: string) => {
        switch (type) {
            case 'workspace':
                return 'bg-blue-100 text-blue-800';
            case 'project':
                return 'bg-green-100 text-green-800';
            case 'task':
                return 'bg-purple-100 text-purple-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className={`relative ${className}`} ref={searchRef}>
            {/* Search trigger */}
            <div
                className="relative cursor-pointer"
                onClick={() => {
                    setIsOpen(true);
                    setTimeout(() => inputRef.current?.focus(), 100);
                }}
            >
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <div className="w-64 h-10 bg-gray-50 border border-gray-300 rounded-md pl-10 pr-16 flex items-center text-sm text-gray-500 hover:bg-gray-100 transition-colors">
                    Search everything...
                </div>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <kbd className="px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100 border border-gray-300 rounded">
                        ⌘ + K
                    </kbd>
                </div>
            </div>

            {/* Search modal */}
            {isOpen && (
                <div 
                    className="fixed inset-0 z-50 backdrop-blur-xs flex items-start justify-center pt-20"
                    onClick={handleClose}
                >
                    <div 
                        className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[32rem] overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Search input */}
                        <div className="p-4 border-b border-gray-200">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    ref={inputRef}
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Escape') {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleClose();
                                        }
                                    }}
                                    placeholder="Search workspaces, projects, and tasks..."
                                    className="pl-10 pr-10 text-base h-12"
                                    autoFocus
                                />
                                {query && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                                        onClick={() => setQuery('')}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Search results */}
                        <div className="max-h-[26rem] overflow-y-auto">
                            {isLoading && query && (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                                    <span className="ml-2 text-gray-600">Searching...</span>
                                </div>
                            )}

                            {error && (
                                <div className="p-4 text-center text-red-600">
                                    <p>Error searching. Please try again.</p>
                                </div>
                            )}

                            {!isLoading && !error && query && results && results.length === 0 && (
                                <div className="p-8 text-center text-gray-500">
                                    <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                    <p className="text-lg font-medium mb-2">No results found</p>
                                    <p>Try searching with different keywords</p>
                                </div>
                            )}

                            {!isLoading && !error && results && results.length > 0 && (
                                <div className="py-2">
                                    {results.map((result: GlobalSearchResult, index: number) => (
                                        <div
                                            key={`${result.type}-${result.id}`}
                                            className={`px-4 py-3 cursor-pointer border-b border-gray-100 last:border-b-0 ${index === selectedIndex
                                                ? 'bg-blue-50 border-blue-200'
                                                : 'hover:bg-gray-50'
                                                }`}
                                            onClick={() => handleResultClick(result)}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="mt-1">
                                                    {getResultIcon(result.type)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4 className="font-medium text-gray-900 truncate">
                                                            {result.title}
                                                        </h4>
                                                        <Badge className={`text-xs ${getResultBadgeColor(result.type)}`}>
                                                            {result.type}
                                                        </Badge>
                                                    </div>
                                                    {result.description && (
                                                        <p className="text-sm text-gray-600 line-clamp-2">
                                                            {result.description}
                                                        </p>
                                                    )}
                                                    {result.breadcrumb && (
                                                        <p className="text-xs text-gray-400 mt-1">
                                                            {result.breadcrumb}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Keyboard shortcuts help */}
                                    <div className="px-4 py-2 border-t border-gray-100 bg-gray-50">
                                        <p className="text-xs text-gray-500 text-center">
                                            Use <kbd className="px-1 py-0.5 bg-white border border-gray-200 rounded text-xs">↑↓</kbd> to navigate,
                                            <kbd className="px-1 py-0.5 bg-white border border-gray-200 rounded text-xs ml-1">Enter</kbd> to select,
                                            <kbd className="px-1 py-0.5 bg-white border border-gray-200 rounded text-xs ml-1">Esc</kbd> to close
                                        </p>
                                    </div>
                                </div>
                            )}

                            {!query && (
                                <div className="p-8 text-center text-gray-500">
                                    <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                    <p className="text-lg font-medium mb-2">Search everything</p>
                                    <p>Find workspaces, projects, and tasks quickly</p>

                                    {/* Recent searches */}
                                    {recentSearches.length > 0 && (
                                        <div className="mt-6 text-left">
                                            <div className="flex items-center gap-2 mb-3 text-sm font-medium text-gray-700">
                                                <Clock className="h-4 w-4" />
                                                Recent searches
                                            </div>
                                            <div className="space-y-1">
                                                {recentSearches.slice(0, 5).map((recentQuery, index) => (
                                                    <button
                                                        key={index}
                                                        onClick={() => handleRecentSearchClick(recentQuery)}
                                                        className={`w-full text-left px-3 py-2 text-sm text-gray-600 rounded-md transition-colors ${!query && index === selectedIndex
                                                            ? 'bg-blue-50 text-blue-700'
                                                            : 'hover:bg-gray-50'
                                                            }`}
                                                    >
                                                        <TrendingUp className="h-3 w-3 inline mr-2 text-gray-400" />
                                                        {recentQuery}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="mt-4 text-sm space-y-1">
                                        <p>Press <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">⌘K</kbd> to open search</p>
                                        <p className="text-xs text-gray-400">Use <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">↑↓</kbd> to navigate, <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Enter</kbd> to select</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}