import { useParams } from 'react-router-dom';

export function ProjectDetailPage() {
  const { workspaceId, projectId } = useParams();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Project Details</h1>
      </div>
      
      <div className="text-gray-600">
        <p>Workspace ID: {workspaceId}</p>
        <p>Project ID: {projectId}</p>
        <p>Task management will be implemented in the next tasks.</p>
        <p>This is a placeholder page for the basic layout and navigation setup.</p>
      </div>
    </div>
  );
}