import { Link, useLocation, useParams } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { useWorkspaces, useProjects, useTasks } from '@/hooks';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
  isActive?: boolean;
}

export function Breadcrumb() {
  const location = useLocation();
  const params = useParams();
  const { workspaceId, projectId, taskId } = params;

  const { data: workspaces = [] } = useWorkspaces();
  const { data: projects = [] } = useProjects(workspaceId || '');
  const { data: tasks = [] } = useTasks(workspaceId || '', projectId || '');

  const workspace = workspaces.find(w => w.workspaceId === workspaceId);
  const project = projects.find(p => p.projectId.value === projectId);
  const task = tasks.find(t => t.taskId === taskId);

  const buildBreadcrumbs = (): BreadcrumbItem[] => {
    const breadcrumbs: BreadcrumbItem[] = [];

    // Always start with Home
    breadcrumbs.push({
      label: 'Home',
      href: '/',
      isActive: location.pathname === '/'
    });

    // Add workspace if we're in a workspace context
    if (workspaceId) {
      breadcrumbs.push({
        label: workspace?.title || `Workspace ${workspaceId}`,
        href: `/workspaces/${workspaceId}`,
        isActive: location.pathname === `/workspaces/${workspaceId}`
      });
    }

    // Add project if we're in a project context
    if (projectId && workspaceId) {
      breadcrumbs.push({
        label: project?.title || `Project ${projectId}`,
        href: `/workspaces/${workspaceId}/projects/${projectId}`,
        isActive: location.pathname === `/workspaces/${workspaceId}/projects/${projectId}`
      });
    }

    // Add task if we're in a task context
    if (taskId && workspaceId && projectId) {
      breadcrumbs.push({
        label: task?.title || `Task ${taskId}`,
        href: `/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}`,
        isActive: location.pathname === `/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}`
      });
    }

    return breadcrumbs;
  };

  const breadcrumbs = buildBreadcrumbs();

  // Don't show breadcrumbs if we're just on the home page
  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <nav className="flex items-center space-x-2 text-sm">
      {breadcrumbs.map((breadcrumb, index) => (
        <div key={index} className="flex items-center space-x-2">
          {index > 0 && <ChevronRight className="h-4 w-4 text-gray-400" />}
          
          {breadcrumb.href && !breadcrumb.isActive ? (
            <Link
              to={breadcrumb.href}
              className="text-gray-600 hover:text-black transition-colors"
            >
              {index === 0 ? (
                <Home className="h-4 w-4" />
              ) : (
                breadcrumb.label
              )}
            </Link>
          ) : (
            <span 
              className={cn(
                "font-medium",
                breadcrumb.isActive ? "text-black" : "text-gray-600"
              )}
            >
              {index === 0 ? (
                <Home className="h-4 w-4" />
              ) : (
                breadcrumb.label
              )}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}