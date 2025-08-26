import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Users, Edit, Trash2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWorkspace, useDeleteWorkspace } from '@/hooks/useWorkspaces';
import { useProjects } from '@/hooks/useProjects';
import ProjectList from '@/components/projects/ProjectList';
import ProjectForm from '@/components/projects/ProjectForm';
import { WorkspaceForm } from '@/components/workspace/WorkspaceForm';
import { WorkspaceMemberManager } from '@/components/workspace/WorkspaceMemberManager';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const WorkspaceDetailPage: React.FC = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const navigate = useNavigate();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showMemberManager, setShowMemberManager] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { data: workspace, isLoading: workspaceLoading } = useWorkspace(workspaceId!);
  const { data: projects, isLoading: projectsLoading } = useProjects(workspaceId!);
  const deleteWorkspaceMutation = useDeleteWorkspace();

  if (workspaceLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">Workspace not found</h2>
        <p className="text-gray-600 mt-2">The workspace you're looking for doesn't exist.</p>
        <Button
          variant="outline"
          onClick={() => navigate('/')}
          className="mt-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Workspaces
        </Button>
      </div>
    );
  }

  const handleEditWorkspace = () => {
    setShowEditForm(true);
  };

  const handleManageMembers = () => {
    setShowMemberManager(true);
  };

  const handleDeleteWorkspace = async () => {
    try {
      await deleteWorkspaceMutation.mutateAsync(workspaceId!);
      navigate('/'); // Navigate back to workspaces list after deletion
    } catch (error) {
      console.error('Failed to delete workspace:', error);
    }
  };

  // Helper function to extract member IDs from various formats
  const extractMemberIds = (workspace: any): string[] => {
    // If memberIds exists and is an array, use it
    if (Array.isArray(workspace.memberIds)) {
      return workspace.memberIds;
    }

    // If memberIdsList exists, parse it
    if (Array.isArray(workspace.memberIdsList)) {
      return workspace.memberIdsList.map((memberStr: string) => {
        try {
          const memberObj = JSON.parse(memberStr);
          return memberObj.userId || memberStr;
        } catch (error) {
          return memberStr;
        }
      });
    }

    return [];
  };

  const memberCount = extractMemberIds(workspace).length;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 text-left">{workspace.title}</h1>
          {workspace.description && (
            <p className="text-gray-600 mt-1 text-left">{workspace.description}</p>
          )}
          <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Users className="h-4 w-4" />
              <span>{memberCount} member{memberCount !== 1 ? 's' : ''}</span>
            </div>
            <div className="text-xs text-gray-400 font-mono">
              ID: {workspace.workspaceId.slice(0, 8)}...
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={handleManageMembers}
            className="flex items-center space-x-2"
          >
            <Users className="h-4 w-4" />
            <span>Manage Members</span>
          </Button>

          <Button
            variant="outline"
            onClick={handleEditWorkspace}
            className="flex items-center space-x-2"
          >
            <Edit className="h-4 w-4" />
            <span>Edit</span>
          </Button>

          <Button
            variant="outline"
            onClick={() => setShowDeleteDialog(true)}
            className="flex items-center space-x-2 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete</span>
          </Button>
        </div>
      </div>

      <ProjectList
        projects={projects || []}
        isLoading={projectsLoading}
        workspaceId={workspaceId!}
        onCreateProject={() => setIsCreateDialogOpen(true)}
      />

      {/* Edit Workspace Form */}
      {showEditForm && (
        <WorkspaceForm
          workspace={workspace}
          onClose={() => setShowEditForm(false)}
          onSuccess={() => setShowEditForm(false)}
        />
      )}

      {/* Member Management */}
      {showMemberManager && (
        <WorkspaceMemberManager
          workspace={workspace}
          onClose={() => setShowMemberManager(false)}
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Workspace</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{workspace.title}"? This action cannot be undone and will permanently delete all projects and tasks within this workspace.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteWorkspace}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete Workspace
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default WorkspaceDetailPage;