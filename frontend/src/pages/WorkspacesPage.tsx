import { useNavigate } from 'react-router-dom';
import { WorkspaceList } from '@/components';
import type { Workspace } from '@/types';

export function WorkspacesPage() {
  const navigate = useNavigate();

  const handleWorkspaceClick = (workspace: Workspace) => {
    navigate(`/workspaces/${workspace.workspaceId}`);
  };

  return <WorkspaceList onWorkspaceClick={handleWorkspaceClick} />;
}