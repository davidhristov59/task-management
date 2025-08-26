import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Briefcase,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  Plus
} from 'lucide-react';
import { useUIStore } from '@/stores';
import { useWorkspaces } from '@/hooks';
import { useProjects } from '@/hooks/useProjects';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const location = useLocation();
  const { sidebarCollapsed, currentWorkspaceId, setCurrentWorkspace } = useUIStore();

  // Only fetch workspaces when sidebar is expanded to avoid API calls when collapsed
  const { data: workspaces = [], isLoading, error } = useWorkspaces();
  const [expandedWorkspaces, setExpandedWorkspaces] = useState<Set<string>>(new Set());

  const toggleWorkspaceExpansion = (workspaceId: string) => {
    const newExpanded = new Set(expandedWorkspaces);
    if (newExpanded.has(workspaceId)) {
      newExpanded.delete(workspaceId);
    } else {
      newExpanded.add(workspaceId);
    }
    setExpandedWorkspaces(newExpanded);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside
      className={cn(
        "h-[calc(100vh-4rem)] bg-white/95 backdrop-blur-sm border-r border-gray-200/60 transition-all duration-300 ease-in-out overflow-y-auto shadow-lg",
        sidebarCollapsed ? "w-16" : "w-64"
      )}
    >
      <nav className={cn("p-4 space-y-3", sidebarCollapsed && "px-2")}>
        {/* Home/Workspaces Link */}
        <Link
          to="/"
          onClick={() => setCurrentWorkspace(null)} // Clear current workspace when going home
          className={cn(
            "flex items-center rounded-xl transition-all duration-200 group",
            sidebarCollapsed ? "justify-center p-3" : "space-x-3 px-4 py-3",
            isActive('/')
              ? "bg-black text-white shadow-lg shadow-black/25"
              : "text-black hover:bg-gray-100/80 hover:shadow-md hover:scale-[1.02]"
          )}
          title={sidebarCollapsed ? "Workspaces" : undefined}
        >
          <Home className={cn(
            "h-5 w-5 flex-shrink-0 transition-transform duration-200",
            isActive('/') ? "text-white" : "text-black group-hover:text-black",
            !sidebarCollapsed && "group-hover:scale-110"
          )} />
          {!sidebarCollapsed && (
            <span className="font-medium">Home</span>
          )}
        </Link>

        {/* Workspace List - Only show when expanded */}
        {!sidebarCollapsed && (
          <div className="space-y-2">
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50/80 rounded-xl">
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Your Workspaces
              </span>
              <button
                className="p-1.5 hover:bg-white/80 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 group"
                aria-label="Create workspace"
              >
                <Plus className="h-4 w-4 text-gray-500 group-hover:text-gray-600 transition-colors" />
              </button>
            </div>

            {/* Loading state */}
            {isLoading && (
              <div className="px-4 py-3 text-sm text-gray-500 bg-gray-50/50 rounded-xl">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-500 rounded-full animate-spin"></div>
                  <span>Loading workspaces...</span>
                </div>
              </div>
            )}

            {/* Error state */}
            {error && (
              <div className="px-4 py-3 text-sm text-red-600 bg-red-50/80 rounded-xl border border-red-200/50">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span>Failed to load workspaces</span>
                </div>
              </div>
            )}

            {/* Empty workspaces state */}
            {!isLoading && !error && workspaces.length === 0 && (
              <div className="px-4 py-6 text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Briefcase className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-sm text-gray-500 mb-1">No workspaces yet</p>
                <p className="text-xs text-gray-400">Create your first workspace to get started</p>
              </div>
            )}

            {workspaces.map((workspace) => {
              const isExpanded = expandedWorkspaces.has(workspace.workspaceId);
              const isCurrentWorkspace = currentWorkspaceId === workspace.workspaceId;

              return (
                <div key={workspace.workspaceId} className="space-y-1">
                  <div className="flex items-center group">
                    <button
                      onClick={() => toggleWorkspaceExpansion(workspace.workspaceId)}
                      className="p-1.5 hover:bg-gray-100/80 rounded-lg mr-2 transition-all duration-200 hover:scale-110 active:scale-95"
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-500" />
                      )}
                    </button>

                    <Link
                      to={`/workspaces/${workspace.workspaceId}`}
                      onClick={() => setCurrentWorkspace(workspace.workspaceId)}
                      className={cn(
                        "flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all duration-200 flex-1 group",
                        isCurrentWorkspace && !isActive('/')
                          ? "bg-black text-white shadow-lg shadow-black/25"
                          : "text-black hover:bg-gray-100/80 hover:shadow-md hover:scale-[1.02]"
                      )}
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200",
                        isCurrentWorkspace && !isActive('/')
                          ? "bg-white/20"
                          : "bg-gray-100 group-hover:bg-gray-200"
                      )}>
                        <Briefcase className={cn(
                          "h-4 w-4 transition-colors",
                          isCurrentWorkspace && !isActive('/') ? "text-white" : "text-black"
                        )} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className={cn(
                          "font-medium truncate block",
                          isCurrentWorkspace && !isActive('/') ? "text-white" : "text-black"
                        )}>
                          {workspace.title}
                        </span>
                        <span className={cn(
                          "text-xs truncate block",
                          isCurrentWorkspace && !isActive('/') ? "text-white/80" : "text-gray-500"
                        )}>
                          {workspace.description || "No description"}
                        </span>
                      </div>
                    </Link>
                  </div>

                  {/* Projects under workspace */}
                  {isExpanded && <WorkspaceProjects workspaceId={workspace.workspaceId} />}
                </div>
              );
            })}
          </div>
        )}

        {/* Collapsed state - show workspace icons */}
        {sidebarCollapsed && workspaces.length > 0 && (
          <div className="space-y-3">
            {workspaces.slice(0, 5).map((workspace) => (
              <Link
                key={workspace.workspaceId}
                to={`/workspaces/${workspace.workspaceId}`}
                onClick={() => setCurrentWorkspace(workspace.workspaceId)}
                className={cn(
                  "flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95 group relative",
                  currentWorkspaceId === workspace.workspaceId && !isActive('/')
                    ? "bg-black text-white shadow-lg shadow-black/25"
                    : "bg-gray-100 text-black hover:bg-gray-200 hover:shadow-md"
                )}
                title={workspace.title}
              >
                <Briefcase className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
                {currentWorkspaceId === workspace.workspaceId && !isActive('/') && (
                  <div className="absolute -right-1 -top-1 w-3 h-3 bg-white rounded-full border-2 border-black"></div>
                )}
              </Link>
            ))}
          </div>
        )}
      </nav>
    </aside>
  );
}

// Component to show projects for a specific workspace
function WorkspaceProjects({ workspaceId }: { workspaceId: string }) {
  const { data: projects = [], isLoading } = useProjects(workspaceId);
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="ml-8 space-y-1 pl-4 border-l-2 border-gray-100">
        <div className="flex items-center space-x-3 px-3 py-2 text-sm text-gray-500 bg-gray-50/50 rounded-lg">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-500 rounded-full animate-spin"></div>
          <span>Loading projects...</span>
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="ml-8 space-y-1 pl-4 border-l-2 border-gray-100">
        <div className="flex items-center space-x-3 px-3 py-2 text-sm text-gray-500 bg-gray-50/50 rounded-lg">
          <FolderOpen className="h-4 w-4 text-gray-400" />
          <span>No projects yet</span>
        </div>
      </div>
    );
  }

  return (
    <div className="ml-8 space-y-1 pl-4 border-l-2 border-gray-100">
      {projects.slice(0, 5).map((project) => {
        const projectPath = `/workspaces/${workspaceId}/projects/${project.projectId.value}`;
        const isActive = location.pathname === projectPath;
        
        return (
          <Link
            key={project.projectId.value}
            to={projectPath}
            className={cn(
              "mt-2 flex items-center space-x-3 px-3 py-2 text-sm rounded-lg transition-all duration-200 group",
              isActive
                ? "bg-gray-100 text-gray-900 shadow-sm"
                : "text-gray-600 hover:bg-gray-100/80 hover:text-gray-900"
            )}
          >
            <FolderOpen className={cn(
              "h-4 w-4 transition-colors",
              isActive ? "text-gray-600" : "text-gray-400 group-hover:text-gray-600"
            )} />
            <span className="truncate font-medium">{project.title}</span>
          </Link>
        );
      })}
      {projects.length > 5 && (
        <div className="px-3 py-2 text-xs text-gray-400">
          +{projects.length - 5} more projects
        </div>
      )}
    </div>
  );
}