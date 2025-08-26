import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreHorizontal, Archive, Edit, Trash2, ArchiveRestore } from 'lucide-react';
import { type Project, ProjectStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useArchiveProject, useDeleteProject } from '@/hooks/useProjects';
import ProjectForm from './ProjectForm';

interface ProjectCardProps {
  project: Project;
  workspaceId: string;
  viewMode?: 'grid' | 'list';
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, workspaceId, viewMode = 'grid' }) => {
  const navigate = useNavigate();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  
  const archiveProjectMutation = useArchiveProject();
  const deleteProjectMutation = useDeleteProject();

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.PLANNING:
        return 'bg-green-100 text-green-800';
      case ProjectStatus.IN_PROGRESS:
        return 'bg-yellow-100 text-yellow-800';
      case ProjectStatus.COMPLETED:
        return 'bg-blue-100 text-blue-800';
      case ProjectStatus.CANCELLED:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleArchiveToggle = () => {
    archiveProjectMutation.mutate({
      workspaceId,
      projectId: project.projectId.value,
      archived: !project.archived
    });
  };

  const handleDelete = () => {
    deleteProjectMutation.mutate({
      workspaceId,
      projectId: project.projectId.value
    });
    setShowDeleteDialog(false);
  };

  const handleCardClick = () => {
    navigate(`/workspaces/${workspaceId}/projects/${project.projectId.value}`);
  };

  if (viewMode === 'list') {
    return (
      <>
        <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center justify-between">
            <div className="flex-1 flex items-center gap-4" onClick={handleCardClick}>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{project.title}</h3>
                {project.description && (
                  <p className="text-gray-600 text-sm line-clamp-1">{project.description}</p>
                )}
              </div>
              <Badge className={getStatusColor(project.status)}>
                {project.status.replace('_', ' ')}
              </Badge>
              <div className="text-sm text-gray-500 min-w-0">
                {project.createdAt && new Date(project.createdAt).toLocaleDateString()}
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 ml-2">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleArchiveToggle}>
                  {project.archived ? (
                    <>
                      <ArchiveRestore className="h-4 w-4 mr-2" />
                      Unarchive
                    </>
                  ) : (
                    <>
                      <Archive className="h-4 w-4 mr-2" />
                      Archive
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1" onClick={handleCardClick}>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{project.title}</h3>
            {project.description && (
              <p className="text-gray-600 text-sm line-clamp-2">{project.description}</p>
            )}
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleArchiveToggle}>
                {project.archived ? (
                  <>
                    <ArchiveRestore className="h-4 w-4 mr-2" />
                    Unarchive
                  </>
                ) : (
                  <>
                    <Archive className="h-4 w-4 mr-2" />
                    Archive
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setShowDeleteDialog(true)}
                className="text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center justify-between" onClick={handleCardClick}>
          <Badge className={getStatusColor(project.status)}>
            {project.status.replace('_', ' ')}
          </Badge>
          
          <div className="text-sm text-gray-500">
            {project.createdAt && new Date(project.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{project.title}"? This action cannot be undone and will also delete all tasks within this project.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-lg p-0">
          <DialogHeader className="px-6 pt-6 pb-0">
            <DialogTitle className="text-xl font-bold">Edit Project</DialogTitle>
          </DialogHeader>
          <ProjectForm
            workspaceId={workspaceId}
            project={project}
            onSuccess={() => setShowEditDialog(false)}
            onCancel={() => setShowEditDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProjectCard;