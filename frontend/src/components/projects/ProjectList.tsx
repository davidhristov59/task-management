import React, { useState, useMemo } from 'react';
import { Plus, Grid, List } from 'lucide-react';
import { Button } from '../ui/button';
import { AdvancedFilters, type FilterOptions, type SortOptions } from '../ui/advanced-filters';
import type { Project } from '@/types';
import ProjectCard from './ProjectCard';

interface ProjectListProps {
  projects: Project[];
  isLoading: boolean;
  workspaceId: string;
  onCreateProject?: () => void;
}

const ProjectList: React.FC<ProjectListProps> = ({ 
  projects, 
  isLoading, 
  workspaceId, 
  onCreateProject 
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    status: 'all',
  });
  const [sortOptions, setSortOptions] = useState<SortOptions>({
    field: 'created',
    direction: 'desc',
  });

  const filteredAndSortedProjects = useMemo(() => {
    let filtered = projects.filter((project) => {
      
      const matchesSearch = !filters.search || 
        project.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        (project.description?.toLowerCase().includes(filters.search.toLowerCase()) ?? false);

      
      const matchesStatus = filters.status === 'all' || project.status === filters.status;

      return matchesSearch && matchesStatus;
    });

    
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortOptions.field) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'created':
        default:
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }

      return sortOptions.direction === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [projects, filters, sortOptions]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
              <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3 mb-4"></div>
              <div className="flex justify-between items-center">
                <div className="h-6 bg-gray-200 rounded w-16"></div>
                <div className="h-8 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with filters and actions on same line */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex-1">
          <AdvancedFilters
            filters={filters}
            onFiltersChange={setFilters}
            sortOptions={sortOptions}
            onSortChange={setSortOptions}
            showProjectFilters={true}
            showTaskFilters={false}
          />
        </div>

        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="flex items-center bg-white border border-gray-300 rounded-md shadow-sm">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className={`rounded-r-none ${
                viewMode === 'grid' 
                  ? 'bg-black text-white hover:bg-gray-700' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Grid className="h-4 w-4 mr-1" />
              Grid
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className={`rounded-l-none border-l ${
                viewMode === 'list' 
                  ? 'bg-black text-white hover:bg-gray-700' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <List className="h-4 w-4 mr-1" />
              List
            </Button>
          </div>

          {onCreateProject && (
            <Button 
              onClick={onCreateProject}
              className="bg-black hover:bg-gray-700 text-white shadow-sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          )}
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-gray-600">
        Showing {filteredAndSortedProjects.length} of {projects.length} projects
      </div>

      {/* Empty state */}
      {projects.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
          <p className="text-gray-600 mb-4">Get started by creating your first project in this workspace.</p>
          {onCreateProject && (
            <Button onClick={onCreateProject}>
              <Plus className="h-4 w-4 mr-2" />
              Create your first project
            </Button>
          )}
        </div>
      )}

      {/* No search results */}
      {projects.length > 0 && filteredAndSortedProjects.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">
            No projects match your filters
          </div>
          <Button variant="outline" onClick={() => setFilters({ search: '', status: 'all' })}>
            Clear Filters
          </Button>
        </div>
      )}

      {/* Projects grid/list */}
      {filteredAndSortedProjects.length > 0 && (
        <div className={
          viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            : "space-y-4"
        }>
          {filteredAndSortedProjects.map((project) => (
            <ProjectCard 
              key={project.projectId.value} 
              project={project} 
              workspaceId={workspaceId}
              viewMode={viewMode}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectList;