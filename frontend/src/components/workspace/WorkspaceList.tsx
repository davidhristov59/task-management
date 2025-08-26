import { useState } from 'react';
import { Plus, Briefcase, Search, Grid, List, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GridSkeleton, WorkspaceCardSkeleton } from '@/components/ui/loading-skeletons';
import { OfflineIndicator } from '@/components/ui/offline-indicator';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { WorkspaceCard } from './WorkspaceCard';
import { WorkspaceForm } from './WorkspaceForm';
import { WorkspaceMemberManager } from './WorkspaceMemberManager.tsx';
import { useWorkspaces, useDeleteWorkspace } from '@/hooks';
import type { Workspace } from '@/types';

interface WorkspaceListProps {
  onWorkspaceClick: (workspace: Workspace) => void;
}

export function WorkspaceList({ onWorkspaceClick }: WorkspaceListProps) {
  const { data: workspaces = [], isLoading, error, refetch, isFetching } = useWorkspaces();
  const deleteWorkspaceMutation = useDeleteWorkspace();
  const { isFullyConnected } = useOnlineStatus();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingWorkspace, setEditingWorkspace] = useState<Workspace | null>(null);
  const [managingMembersWorkspace, setManagingMembersWorkspace] = useState<Workspace | null>(null);

  // Filter workspaces based on search term
  const filteredWorkspaces = workspaces.filter(workspace =>
    workspace.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (workspace.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
  );

  const handleCreateWorkspace = () => {
    setShowCreateForm(true);
    setEditingWorkspace(null);
  };

  const handleEditWorkspace = (workspace: Workspace) => {
    setEditingWorkspace(workspace);
    setShowCreateForm(true);
  };

  const handleDeleteWorkspace = async (workspaceId: string) => {
    try {
      await deleteWorkspaceMutation.mutateAsync(workspaceId);
    } catch (error) {
      console.error('Failed to delete workspace:', error);
    }
  };

  const handleManageMembers = (workspace: Workspace) => {
    setManagingMembersWorkspace(workspace);
  };

  const handleFormClose = () => {
    setShowCreateForm(false);
    setEditingWorkspace(null);
  };

  const handleMemberManagerClose = () => {
    setManagingMembersWorkspace(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-black">Workspaces</h1>
            <p className="text-gray-600 mt-1">Organize your projects and collaborate with your team</p>
          </div>
          <div className="w-32 h-10 bg-gray-200 rounded animate-pulse" />
        </div>
        
        {/* Search bar skeleton */}
        <div className="flex items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <div className="h-10 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="w-32 h-10 bg-gray-200 rounded animate-pulse" />
        </div>
        
        {/* Grid skeleton */}
        <GridSkeleton count={6} ItemSkeleton={WorkspaceCardSkeleton} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-black">Workspaces</h1>
            <p className="text-gray-600 mt-1">Organize your projects and collaborate with your team</p>
          </div>
        </div>
        
        {/* Show offline indicator if applicable */}
        {!isFullyConnected && <OfflineIndicator showDetails />}
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Unable to load workspaces</h3>
          <p className="text-red-600 mb-4">
            {error instanceof Error ? error.message : 'An unexpected error occurred'}
          </p>
          <div className="flex justify-center gap-3">
            <Button 
              onClick={() => refetch()}
              disabled={isFetching}
              className="bg-red-600 hover:bg-red-700"
            >
              {isFetching ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </>
              )}
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.location.reload()}
            >
              Reload Page
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Offline indicator */}
      {!isFullyConnected && <OfflineIndicator showDetails />}
      
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black">Workspaces</h1>
          <p className="text-gray-600 mt-1">Organize your projects and collaborate with your team</p>
        </div>
        <div className="flex items-center gap-2">
          {isFetching && (
            <RefreshCw className="h-4 w-4 animate-spin text-gray-400" />
          )}
          <Button 
            onClick={handleCreateWorkspace} 
            disabled={!isFullyConnected}
            className="bg-black hover:bg-gray-800 text-white disabled:opacity-50"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Workspace
          </Button>
        </div>
      </div>

      {/* Search and View Controls */}
      {workspaces.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search workspaces..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode('grid')}
              className={viewMode === 'grid' 
                ? 'bg-white shadow-sm text-black hover:bg-white' 
                : 'text-gray-600 hover:text-black hover:bg-gray-200'
              }
            >
              <Grid className="h-4 w-4 mr-1" />
              Grid
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode('list')}
              className={viewMode === 'list' 
                ? 'bg-white shadow-sm text-black hover:bg-white' 
                : 'text-gray-600 hover:text-black hover:bg-gray-200'
              }
            >
              <List className="h-4 w-4 mr-1" />
              List
            </Button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {workspaces.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Briefcase className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-black mb-2">No workspaces yet</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Create your first workspace to start organizing your projects and collaborating with your team.
          </p>
          <Button onClick={handleCreateWorkspace} className="bg-black hover:bg-gray-800 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Workspace
          </Button>
        </div>
      )}

      {/* No Search Results */}
      {workspaces.length > 0 && filteredWorkspaces.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Search className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-black mb-2">No workspaces found</h3>
          <p className="text-gray-600 mb-6">
            No workspaces match your search for "{searchTerm}". Try a different search term.
          </p>
          <Button 
            variant="outline" 
            onClick={() => setSearchTerm('')}
          >
            Clear Search
          </Button>
        </div>
      )}

      {/* Workspaces Grid/List */}
      {filteredWorkspaces.length > 0 && (
        <div className={
          viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            : "space-y-4"
        }>
          {filteredWorkspaces.map((workspace) => (
            <WorkspaceCard
              key={workspace.workspaceId}
              workspace={workspace}
              onEdit={handleEditWorkspace}
              onDelete={handleDeleteWorkspace}
              onManageMembers={handleManageMembers}
              onClick={onWorkspaceClick}
            />
          ))}
        </div>
      )}

      {/* Create/Edit Workspace Form */}
      {showCreateForm && (
        <WorkspaceForm
          workspace={editingWorkspace}
          onClose={handleFormClose}
          onSuccess={() => {
            refetch(); // Explicitly refetch the workspaces
          }}
        />
      )}

      {/* Member Management */}
      {managingMembersWorkspace && (
        <WorkspaceMemberManager
          workspace={managingMembersWorkspace}
          onClose={handleMemberManagerClose}
          onMemberChange={() => {
            refetch(); // Explicitly refetch when members change
          }}
        />
      )}
    </div>
  );
}