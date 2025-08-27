import { Calendar, User, Tag as TagIcon, AlertCircle, Repeat } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { TaskPriority, TaskStatus } from '../../types';
import type { NormalizedTask } from '../../utils/taskUtils';
import { format } from 'date-fns';
import TaskStatusSelector from './TaskStatusSelector';
import TaskAssignmentSelector from './TaskAssignmentSelector';

interface TaskCardProps {
  task: NormalizedTask;
  onStatusChange?: (taskId: string, status: TaskStatus) => void;
  onAssignmentChange?: (taskId: string, userId: string | null) => void;
  onEdit?: (task: NormalizedTask) => void;
  onDelete?: (taskId: string) => void;
  onClick?: (task: NormalizedTask) => void;
}

const getPriorityColor = (priority: TaskPriority) => {
  switch (priority) {
    case TaskPriority.HIGH:
      return 'bg-red-100 text-red-800 border-red-200';
    case TaskPriority.MEDIUM:
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case TaskPriority.LOW:
      return 'bg-green-100 text-green-800 border-green-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getStatusColor = (status: TaskStatus) => {
  switch (status) {
    case TaskStatus.COMPLETED:
      return 'bg-green-100 text-green-800 border-green-200';
    case TaskStatus.IN_PROGRESS:
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case TaskStatus.CANCELLED:
      return 'bg-red-100 text-red-800 border-red-200';
    case TaskStatus.PENDING:
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

function TaskCard({
  task,
  onStatusChange,
  onAssignmentChange,
  onEdit,
  onDelete,
  onClick
}: TaskCardProps) {
  const isOverdue = task.deadline && new Date(task.deadline) < new Date() && task.status !== TaskStatus.COMPLETED;

  return (
    <Card
      className={`hover:shadow-md transition-shadow cursor-pointer ${isOverdue ? 'border-red-200 bg-red-50' : ''
        }`}
      onClick={() => onClick?.(task)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate text-left">{task.title}</h3>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getPriorityColor(task.priority)}>
              {task.priority}
            </Badge>
            <Badge className={getStatusColor(task.status)}>
              {task.status.replace('_', ' ')}
            </Badge>
            {/* {recurringRule && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Repeat className="h-3 w-3" />
                Recurring
              </Badge>
            )} */}
          </div>
        </div>
        
        {/* Task Description - More prominent */}
        {task.description && (
          <div className="mt-3 p-3 bg-gray-50 rounded-md border-l-4 border-black">
            <p className="text-sm text-gray-700 leading-relaxed text-left">
              {task.description}
            </p>
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Deadline */}
          {task.deadline && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4" />
              <span className={isOverdue ? 'text-red-600 font-medium' : 'text-gray-600'}>
                {format(new Date(task.deadline), 'MMM dd, yyyy')}
                {isOverdue && (
                  <AlertCircle className="h-4 w-4 inline ml-1 text-red-500" />
                )}
              </span>
            </div>
          )}

          {/* Assignment */}
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4" />
            <span className="text-gray-600">
              {task.assignedUserId ? `Assigned to: ${task.assignedUserId}` : 'Unassigned'}
            </span>
          </div>

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <TagIcon className="h-4 w-4" />
              <div className="flex flex-wrap gap-1">
                {task.tags.map((tag) => (
                  <Badge variant="outline" className="text-xs">
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Categories */}
          {task.categories && task.categories.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {task.categories.map((category) => (
                <Badge variant="secondary" className="text-xs">
                  {category.name}
                </Badge>
              ))}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-2">
              <TaskStatusSelector
                currentStatus={task.status}
                onStatusChange={(status) => onStatusChange?.(task.taskId, status)}
              />
              <TaskAssignmentSelector
                currentUserId={task.assignedUserId}
                onAssignmentChange={(userId) => onAssignmentChange?.(task.taskId, userId)}
              />
            </div>

            <div className="flex items-center gap-1">
              {onEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(task);
                  }}
                >
                  Edit
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(task.taskId);
                  }}
                  className="text-red-600 hover:text-red-700"
                >
                  Delete
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default TaskCard;