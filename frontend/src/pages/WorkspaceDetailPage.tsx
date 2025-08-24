import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWorkspace } from '@/hooks/useWorkspaces';
import { useProjects } from '@/hooks/useProjects';
import ProjectList from '@/components/projects/ProjectList';
import ProjectForm from '@/components/projects/ProjectForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const WorkspaceDetailPage: React.FC = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const { data: workspace, isLoading: workspaceLoading } = useWorkspace(workspaceId!);
  const { data: projects, isLoading: projectsLoading } = useProjects(workspaceId!);

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
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{workspace.title}</h1>
          {workspace.description && (
            <p className="text-gray-600 mt-1">{workspace.description}</p>
          )}
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg p-0">
            <DialogHeader className="px-6 pt-6 pb-0">
              <DialogTitle className="text-xl font-bold">Create New Project</DialogTitle>
            </DialogHeader>
            <ProjectForm
              workspaceId={workspaceId!}
              onSuccess={() => setIsCreateDialogOpen(false)}
              onCancel={() => setIsCreateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <ProjectList
        projects={projects || []}
        isLoading={projectsLoading}
        workspaceId={workspaceId!}
      />
    </div>
  );
};

export default WorkspaceDetailPage;