import { User, UserX } from 'lucide-react';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

interface TaskAssignmentSelectorProps {
  currentUserId?: string;
  onAssignmentChange: (userId: string | null) => void;
  disabled?: boolean;
  compact?: boolean;
  workspaceMembers?: string[];
}


const getUserDisplayName = (userId: string): string => {
  if (userId === 'current-user-id') return 'Current User';
  
  
  const cleanId = userId.replace(/[-_]/g, ' ');
  return cleanId.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const getUserEmail = (userId: string): string => {
  
  const cleanId = userId.toLowerCase().replace(/[^a-z0-9]/g, '');
  return `${cleanId}@example.com`;
};

function TaskAssignmentSelector({ 
  currentUserId, 
  onAssignmentChange, 
  disabled = false,
  compact = false,
  workspaceMembers = []
}: TaskAssignmentSelectorProps) {
  const currentUserName = currentUserId ? getUserDisplayName(currentUserId) : null;

  const handleAssignmentClick = (e: React.MouseEvent, userId: string | null) => {
    e.preventDefault();
    e.stopPropagation();
    onAssignmentChange(userId);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled}
          className={compact ? "h-6 px-1 text-xs hover:bg-gray-100" : "h-8 px-2 text-xs hover:bg-gray-100"}
        >
          {currentUserName ? (
            <>
              <User className="h-3 w-3 mr-1" />
              {compact ? JSON.parse(currentUserName).userid.split(' ')[0] : JSON.parse(currentUserName).userid}
            </>
          ) : (
            <>
              <UserX className="h-3 w-3 mr-1" />
              {compact ? 'Unassigned' : 'Unassigned'}
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="bg-white">
        <DropdownMenuItem
          onClick={(e) => handleAssignmentClick(e, null)}
          className={!currentUserId ? 'bg-gray-100' : ''}
        >
          <UserX className="h-4 w-4 mr-2 text-gray-600" />
          Unassigned
        </DropdownMenuItem>
        {workspaceMembers.map((memberId) => (
          <DropdownMenuItem
            key={memberId}
            onClick={(e) => handleAssignmentClick(e, memberId)}
            className={currentUserId === memberId ? 'bg-gray-100' : ''}
          >
            <User className="h-4 w-4 mr-2 text-blue-600" />
            <div className="flex flex-col">
              <span className="text-sm font-medium">{getUserDisplayName(memberId)}</span>
              <span className="text-xs text-gray-500">{getUserEmail(memberId)}</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default TaskAssignmentSelector;