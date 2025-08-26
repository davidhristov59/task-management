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
}

// Mock users for now - in a real app, this would come from a users API
const mockUsers = [
  { userId: 'user1', name: 'John Doe', email: 'john@example.com' },
  { userId: 'user2', name: 'Jane Smith', email: 'jane@example.com' },
  { userId: 'user3', name: 'Bob Johnson', email: 'bob@example.com' },
];

function TaskAssignmentSelector({ 
  currentUserId, 
  onAssignmentChange, 
  disabled = false,
  compact = false
}: TaskAssignmentSelectorProps) {
  const currentUser = mockUsers.find(user => user.userId === currentUserId);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          className={compact ? "h-6 px-1 text-xs" : "h-8 px-2 text-xs"}
        >
          {currentUser ? (
            <>
              <User className="h-3 w-3 mr-1" />
              {compact ? currentUser.name.split(' ')[0] : currentUser.name}
            </>
          ) : (
            <>
              <UserX className="h-3 w-3 mr-1" />
              {compact ? 'None' : 'Unassigned'}
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="bg-white">
        <DropdownMenuItem
          onClick={() => onAssignmentChange(null)}
          className={!currentUserId ? 'bg-gray-100' : ''}
        >
          <UserX className="h-4 w-4 mr-2 text-gray-600" />
          Unassigned
        </DropdownMenuItem>
        {mockUsers.map((user) => (
          <DropdownMenuItem
            key={user.userId}
            onClick={() => onAssignmentChange(user.userId)}
            className={currentUserId === user.userId ? 'bg-gray-100' : ''}
          >
            <User className="h-4 w-4 mr-2 text-blue-600" />
            <div className="flex flex-col">
              <span className="text-sm font-medium">{user.name}</span>
              <span className="text-xs text-gray-500">{user.email}</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default TaskAssignmentSelector;