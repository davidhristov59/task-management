import { Check, Clock, Play, X } from 'lucide-react';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { TaskStatus } from '../../types';

interface TaskStatusSelectorProps {
  currentStatus: TaskStatus;
  onStatusChange: (status: TaskStatus) => void;
  disabled?: boolean;
}

const statusConfig = {
  [TaskStatus.PENDING]: {
    icon: Clock,
    label: 'Pending',
    color: 'text-gray-600',
  },
  [TaskStatus.IN_PROGRESS]: {
    icon: Play,
    label: 'In Progress',
    color: 'text-blue-600',
  },
  [TaskStatus.COMPLETED]: {
    icon: Check,
    label: 'Completed',
    color: 'text-green-600',
  },
  [TaskStatus.CANCELLED]: {
    icon: X,
    label: 'Cancelled',
    color: 'text-red-600',
  },
};

function TaskStatusSelector({ 
  currentStatus, 
  onStatusChange, 
  disabled = false 
}: TaskStatusSelectorProps) {
  const CurrentIcon = statusConfig[currentStatus].icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled}
          className="h-8 px-2 text-xs hover:bg-gray-100"
        >
          <CurrentIcon className="h-3 w-3 mr-1" />
          {statusConfig[currentStatus].label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="bg-white">
        {Object.entries(statusConfig).map(([status, config]) => {
          const Icon = config.icon;
          return (
            <DropdownMenuItem
              key={status}
              onClick={() => onStatusChange(status as TaskStatus)}
              className={currentStatus === status ? 'bg-gray-100' : ''}
            >
              <Icon className={`h-4 w-4 mr-2 ${config.color}`} />
              {config.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default TaskStatusSelector;