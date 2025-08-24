import { Plus, Briefcase, CheckCircle2 } from 'lucide-react';
import { useWorkspaces } from '@/hooks';

export function WorkspacesPage() {
  const { data: workspaces = [], isLoading, error } = useWorkspaces();

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black">Workspaces</h1>
          <p className="text-gray-600 mt-1">Organize your projects and collaborate with your team</p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors">
          <Plus className="h-4 w-4" />
          <span>Create Workspace</span>
        </button>
      </div>
      
      <div className="space-y-6">
        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <div className="w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin mx-auto"></div>
              <p className="text-gray-600">Loading workspaces...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h3 className="text-lg font-semibold text-red-800 mb-2">Unable to load workspaces</h3>
            <p className="text-red-600 mb-4">This is expected if the backend server is not running.</p>
            <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && workspaces.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Briefcase className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-black mb-2">No workspaces yet</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Create your first workspace to start organizing your projects and collaborating with your team.
            </p>
            <button className="flex items-center space-x-2 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors mx-auto">
              <Plus className="h-4 w-4" />
              <span>Create Your First Workspace</span>
            </button>
          </div>
        )}

        {/* Workspaces Grid */}
        {workspaces.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workspaces.map((workspace) => (
              <div
                key={workspace.workspaceId}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 bg-black rounded-md flex items-center justify-center">
                    <Briefcase className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    Active
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold text-black mb-2">
                  {workspace.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {workspace.description || "No description provided"}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-400 font-mono">
                    ID: {workspace.workspaceId.slice(0, 8)}...
                  </div>
                  <button className="text-black hover:underline font-medium text-sm">
                    Open →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Status Card */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 bg-black rounded-md flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-black mb-3">Layout & Navigation Complete</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="flex items-center space-x-2 text-sm text-gray-700">
                  <CheckCircle2 className="h-4 w-4 text-black" />
                  <span>Clean minimalistic design</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-700">
                  <CheckCircle2 className="h-4 w-4 text-black" />
                  <span>Fixed header with navigation</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-700">
                  <CheckCircle2 className="h-4 w-4 text-black" />
                  <span>Collapsible sidebar</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-700">
                  <CheckCircle2 className="h-4 w-4 text-black" />
                  <span>Breadcrumb navigation</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-700">
                  <CheckCircle2 className="h-4 w-4 text-black" />
                  <span>React Router setup</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-700">
                  <CheckCircle2 className="h-4 w-4 text-black" />
                  <span>Responsive design</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}