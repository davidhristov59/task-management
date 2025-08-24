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
          className={cn(
            "flex items-center rounded-xl transition-all duration-200 group",
            sidebarCollapsed ? "justify-center p-3" : "space-x-3 px-4 py-3",
            isActive('/')
              ? "bg-black text-white shadow-lg shadow-black/25"
              : "text-gray-700 hover:bg-gray-100/80 hover:shadow-md hover:scale-[1.02]"
          )}
          title={sidebarCollapsed ? "Workspaces" : undefined}
        >
          <Home className={cn(
            "h-5 w-5 flex-shrink-0 transition-transform duration-200",
            isActive('/') ? "text-white" : "text-gray-600 group-hover:text-gray-900",
            !sidebarCollapsed && "group-hover:scale-110"
          )} />
          {!sidebarCollapsed && (
            <span className="font-medium">Workspaces</span>
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
                <Plus className="h-4 w-4 text-gray-500 group-hover:text-blue-600 transition-colors" />
              </button>
            </div>

            {/* Loading state */}
            {isLoading && (
              <div className="px-4 py-3 text-sm text-gray-500 bg-gray-50/50 rounded-xl">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
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

            {/* Workspaces list */}
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
                        isCurrentWorkspace
                          ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25"
                          : "text-gray-700 hover:bg-gray-100/80 hover:shadow-md hover:scale-[1.02]"
                      )}
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200",
                        isCurrentWorkspace
                          ? "bg-white/20"
                          : "bg-gradient-to-br from-blue-100 to-purple-100 group-hover:from-blue-200 group-hover:to-purple-200"
                      )}>
                        <Briefcase className={cn(
                          "h-4 w-4 transition-colors",
                          isCurrentWorkspace ? "text-white" : "text-blue-600"
                        )} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className={cn(
                          "font-medium truncate block",
                          isCurrentWorkspace ? "text-white" : "text-gray-900"
                        )}>
                          {workspace.title}
                        </span>
                        <span className={cn(
                          "text-xs truncate block",
                          isCurrentWorkspace ? "text-white/80" : "text-gray-500"
                        )}>
                          {workspace.description || "No description"}
                        </span>
                      </div>
                    </Link>
                  </div>

                  {/* Projects under workspace - placeholder for now */}
                  {isExpanded && (
                    <div className="ml-8 space-y-1 pl-4 border-l-2 border-gray-100">
                      <div className="flex items-center space-x-3 px-3 py-2 text-sm text-gray-500 bg-gray-50/50 rounded-lg">
                        <FolderOpen className="h-4 w-4 text-gray-400" />
                        <span>Projects will appear here</span>
                      </div>
                    </div>
                  )}
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
                  currentWorkspaceId === workspace.workspaceId
                    ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25"
                    : "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600 hover:from-blue-100 hover:to-purple-100 hover:text-blue-600 hover:shadow-md"
                )}
                title={workspace.title}
              >
                <Briefcase className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
                {currentWorkspaceId === workspace.workspaceId && (
                  <div className="absolute -right-1 -top-1 w-3 h-3 bg-white rounded-full border-2 border-emerald-500"></div>
                )}
              </Link>
            ))}
          </div>
        )}
      </nav>
    </aside>
  );
}