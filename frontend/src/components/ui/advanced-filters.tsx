import { useState } from 'react';
import { Filter, X, ChevronDown } from 'lucide-react';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Badge } from './badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from './dropdown-menu';
import { TaskStatus, TaskPriority, ProjectStatus } from '../../types';

export interface FilterOptions {
  search?: string;
  status?: TaskStatus | ProjectStatus | 'all';
  priority?: TaskPriority | 'all';
  assignment?: 'assigned' | 'unassigned' | 'all';
  tags?: string[];
  categories?: string[];
  dateRange?: {
    from?: string;
    to?: string;
  };
}

export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

interface AdvancedFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  sortOptions: SortOptions;
  onSortChange: (sort: SortOptions) => void;
  availableTags?: string[];
  availableCategories?: string[];
  showTaskFilters?: boolean;
  showProjectFilters?: boolean;
  className?: string;
}

export function AdvancedFilters({
  filters,
  onFiltersChange,
  sortOptions,
  onSortChange,
  availableTags = [],
  availableCategories = [],
  showTaskFilters = true,
  showProjectFilters = false,
  className = '',
}: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const updateFilter = (key: keyof FilterOptions, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const addTag = (tag: string) => {
    const currentTags = filters.tags || [];
    if (!currentTags.includes(tag)) {
      updateFilter('tags', [...currentTags, tag]);
    }
  };

  const removeTag = (tag: string) => {
    const currentTags = filters.tags || [];
    updateFilter('tags', currentTags.filter(t => t !== tag));
  };

  const addCategory = (category: string) => {
    const currentCategories = filters.categories || [];
    if (!currentCategories.includes(category)) {
      updateFilter('categories', [...currentCategories, category]);
    }
  };

  const removeCategory = (category: string) => {
    const currentCategories = filters.categories || [];
    updateFilter('categories', currentCategories.filter(c => c !== category));
  };

  const clearAllFilters = () => {
    onFiltersChange({
      search: '',
      status: 'all',
      priority: 'all',
      assignment: 'all',
      tags: [],
      categories: [],
      dateRange: undefined,
    });
  };

  const hasActiveFilters = 
    filters.search ||
    (filters.status && filters.status !== 'all') ||
    (filters.priority && filters.priority !== 'all') ||
    (filters.assignment && filters.assignment !== 'all') ||
    (filters.tags && filters.tags.length > 0) ||
    (filters.categories && filters.categories.length > 0) ||
    filters.dateRange;

  const activeFilterCount = [
    filters.search,
    filters.status !== 'all' ? filters.status : null,
    filters.priority !== 'all' ? filters.priority : null,
    filters.assignment !== 'all' ? filters.assignment : null,
    ...(filters.tags || []),
    ...(filters.categories || []),
    filters.dateRange,
  ].filter(Boolean).length;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Filter trigger and active filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="bg-white border-gray-300 shadow-sm">
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {activeFilterCount > 0 && (
                <Badge className="ml-2 bg-blue-100 text-blue-800 text-xs">
                  {activeFilterCount}
                </Badge>
              )}
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-80 p-4 bg-white" align="start">
            <div className="space-y-4">
              {/* Search */}
              <div>
                <Label htmlFor="search" className="text-sm font-medium">
                  Search
                </Label>
                <Input
                  id="search"
                  placeholder="Search by title, description..."
                  value={filters.search || ''}
                  onChange={(e) => updateFilter('search', e.target.value)}
                  className="mt-1"
                />
              </div>

              {/* Status Filter */}
              <div>
                <Label className="text-sm font-medium">Status</Label>
                <Select
                  value={filters.status || 'all'}
                  onValueChange={(value) => updateFilter('status', value)}
                >
                  <SelectTrigger className="mt-1 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="all">All Status</SelectItem>
                    {showTaskFilters && (
                      <>
                        <SelectItem value={TaskStatus.PENDING}>Pending</SelectItem>
                        <SelectItem value={TaskStatus.IN_PROGRESS}>In Progress</SelectItem>
                        <SelectItem value={TaskStatus.COMPLETED}>Completed</SelectItem>
                        <SelectItem value={TaskStatus.CANCELLED}>Cancelled</SelectItem>
                      </>
                    )}
                    {showProjectFilters && (
                      <>
                        <SelectItem value={ProjectStatus.PLANNING}>Planning</SelectItem>
                        <SelectItem value={ProjectStatus.IN_PROGRESS}>In Progress</SelectItem>
                        <SelectItem value={ProjectStatus.COMPLETED}>Completed</SelectItem>
                        <SelectItem value={ProjectStatus.CANCELLED}>Cancelled</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Priority Filter (only for tasks) */}
              {showTaskFilters && (
                <div>
                  <Label className="text-sm font-medium">Priority</Label>
                  <Select
                    value={filters.priority || 'all'}
                    onValueChange={(value) => updateFilter('priority', value)}
                  >
                    <SelectTrigger className="mt-1 bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="all">All Priority</SelectItem>
                      <SelectItem value={TaskPriority.HIGH}>High</SelectItem>
                      <SelectItem value={TaskPriority.MEDIUM}>Medium</SelectItem>
                      <SelectItem value={TaskPriority.LOW}>Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Assignment Filter (only for tasks) */}
              {showTaskFilters && (
                <div>
                  <Label className="text-sm font-medium">Assignment</Label>
                  <Select
                    value={filters.assignment || 'all'}
                    onValueChange={(value) => updateFilter('assignment', value)}
                  >
                    <SelectTrigger className="mt-1 bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="all">All Tasks</SelectItem>
                      <SelectItem value="assigned">Assigned</SelectItem>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Tags Filter */}
              {availableTags.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Tags</Label>
                  <div className="mt-1 space-y-2">
                    <Select onValueChange={addTag}>
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Add tag..." />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {availableTags
                          .filter(tag => !filters.tags?.includes(tag))
                          .map(tag => (
                            <SelectItem key={tag} value={tag}>
                              {tag}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    {filters.tags && filters.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {filters.tags.map(tag => (
                          <Badge
                            key={tag}
                            className="bg-blue-100 text-blue-800 text-xs cursor-pointer hover:bg-blue-200"
                            onClick={() => removeTag(tag)}
                          >
                            {tag}
                            <X className="h-3 w-3 ml-1" />
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Categories Filter */}
              {availableCategories.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Categories</Label>
                  <div className="mt-1 space-y-2">
                    <Select onValueChange={addCategory}>
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Add category..." />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {availableCategories
                          .filter(category => !filters.categories?.includes(category))
                          .map(category => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    {filters.categories && filters.categories.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {filters.categories.map(category => (
                          <Badge
                            key={category}
                            className="bg-green-100 text-green-800 text-xs cursor-pointer hover:bg-green-200"
                            onClick={() => removeCategory(category)}
                          >
                            {category}
                            <X className="h-3 w-3 ml-1" />
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Date Range Filter */}
              <div>
                <Label className="text-sm font-medium">Date Range</Label>
                <div className="mt-1 grid grid-cols-2 gap-2">
                  <Input
                    type="date"
                    placeholder="From"
                    value={filters.dateRange?.from || ''}
                    onChange={(e) => updateFilter('dateRange', {
                      ...filters.dateRange,
                      from: e.target.value
                    })}
                  />
                  <Input
                    type="date"
                    placeholder="To"
                    value={filters.dateRange?.to || ''}
                    onChange={(e) => updateFilter('dateRange', {
                      ...filters.dateRange,
                      to: e.target.value
                    })}
                  />
                </div>
              </div>

              {/* Clear filters */}
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllFilters}
                  className="w-full"
                >
                  Clear All Filters
                </Button>
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Sort options */}
        <Select
          value={`${sortOptions.field}-${sortOptions.direction}`}
          onValueChange={(value) => {
            const [field, direction] = value.split('-');
            onSortChange({ field, direction: direction as 'asc' | 'desc' });
          }}
        >
          <SelectTrigger className="w-40 bg-white border-gray-300 shadow-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="title-asc">Title A-Z</SelectItem>
            <SelectItem value="title-desc">Title Z-A</SelectItem>
            <SelectItem value="created-desc">Newest First</SelectItem>
            <SelectItem value="created-asc">Oldest First</SelectItem>
            {showTaskFilters && (
              <>
                <SelectItem value="priority-desc">High Priority First</SelectItem>
                <SelectItem value="priority-asc">Low Priority First</SelectItem>
                <SelectItem value="deadline-asc">Deadline Soon</SelectItem>
                <SelectItem value="deadline-desc">Deadline Later</SelectItem>
              </>
            )}
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearAllFilters}>
            Clear All
          </Button>
        )}
      </div>

      {/* Active filter badges */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.search && (
            <Badge className="bg-gray-100 text-gray-800">
              Search: {filters.search}
              <X
                className="h-3 w-3 ml-1 cursor-pointer"
                onClick={() => updateFilter('search', '')}
              />
            </Badge>
          )}
          {filters.status && filters.status !== 'all' && (
            <Badge className="bg-gray-100 text-gray-800">
              Status: {filters.status}
              <X
                className="h-3 w-3 ml-1 cursor-pointer"
                onClick={() => updateFilter('status', 'all')}
              />
            </Badge>
          )}
          {filters.priority && filters.priority !== 'all' && (
            <Badge className="bg-gray-100 text-gray-800">
              Priority: {filters.priority}
              <X
                className="h-3 w-3 ml-1 cursor-pointer"
                onClick={() => updateFilter('priority', 'all')}
              />
            </Badge>
          )}
          {filters.assignment && filters.assignment !== 'all' && (
            <Badge className="bg-gray-100 text-gray-800">
              Assignment: {filters.assignment}
              <X
                className="h-3 w-3 ml-1 cursor-pointer"
                onClick={() => updateFilter('assignment', 'all')}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}