import { useState } from 'react';
import { Briefcase, Users, MoreVertical, Edit, Trash2, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import type { Workspace } from '@/types';

interface WorkspaceCardProps {
  workspace: Workspace;
  onEdit: (workspace: Workspace) => void;
  onDelete: (workspaceId: string) => void;
  onManageMembers: (workspace: Workspace) => void;
  onClick: (workspace: Workspace) => void;
}

export function WorkspaceCard({ 
  workspace, 
  onEdit, 
  onDelete, 
  onManageMembers, 
  onClick 
}: WorkspaceCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const handleCardClick = (e: React.MouseEvent) => {
    
    if ((e.target as HTMLElement).closest('[data-action]')) {
      return;
    }
    onClick(workspace);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowActions(false);
    onEdit(workspace);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowActions(false);
    setShowDeleteDialog(true);
  };

  const handleManageMembers = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowActions(false);
    onManageMembers(workspace);
  };

  const confirmDelete = () => {
    onDelete(workspace.workspaceId);
    setShowDeleteDialog(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <>
      <Card 
        className="cursor-pointer hover:shadow-md transition-shadow group relative"
        onClick={handleCardClick}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 bg-black rounded-md flex items-center justify-center">
              <Briefcase className="h-5 w-5 text-white" />
            </div>
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  setShowActions(!showActions);
                }}
                data-action
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
              {showActions && (
                <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-md shadow-lg z-10 min-w-[160px]">
                  <button
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2"
                    onClick={handleEdit}
                    data-action
                  >
                    <Edit className="h-4 w-4" />
                    <span>Edit</span>
                  </button>
                  <button
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2"
                    onClick={handleManageMembers}
                    data-action
                  >
                    <Users className="h-4 w-4" />
                    <span>Manage Members</span>
                  </button>
                  <button
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 text-red-600 flex items-center space-x-2"
                    onClick={handleDelete}
                    data-action
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="space-y-3">
            <div>
              <h3 className="text-lg font-semibold text-black mb-1 truncate">
                {workspace.title}
              </h3>
              <p className="text-gray-600 text-sm line-clamp-2 break-words">
                {workspace.description || "No description provided"}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <Users className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{(() => {
                  
                  const extractMemberIds = (workspace: any): string[] => {
                    if (Array.isArray(workspace.memberIds)) {
                      return workspace.memberIds;
                    }
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
                  return `${memberCount} member${memberCount !== 1 ? 's' : ''}`;
                })()}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">Created {formatDate(workspace.createdAt)}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between gap-2">
              <div className="text-xs text-gray-400 font-mono truncate min-w-0">
                ID: {workspace.workspaceId.slice(0, 8)}...
              </div>
              <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded flex-shrink-0">
                {workspace.archived ? 'Archived' : 'Active'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete Workspace
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}