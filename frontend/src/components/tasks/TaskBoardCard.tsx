import { useSortable } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, User, Tag as TagIcon, AlertCircle, Repeat, GripVertical } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { TaskPriority, TaskStatus } from '../../types';
import type { NormalizedTask } from '../../utils/taskUtils';
import { format } from 'date-fns';
import TaskAssignmentSelector from './TaskAssignmentSelector';
import { useRecurringTask } from '../../hooks/useRecurringTasks';

interface TaskBoardCardProps {
  task: NormalizedTask;
  onAssignmentChange?: (taskId: string, userId: string | null) => void;
  onEdit?: (task: NormalizedTask) => void;
  onDelete?: (taskId: string) => void;
  onClick?: (task: NormalizedTask) => void;
  isDragging?: boolean;
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

function TaskBoardCard({
  task,
  onAssignmentChange,
  onEdit,
  onDelete,
  onClick,
  isDragging = false,
}: TaskBoardCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef: setSortableNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: task.taskId,
  });

  const { setNodeRef: setDroppableNodeRef, isOver } = useDroppable({
    id: task.taskId,
  });

  const setNodeRef = (node: HTMLElement | null) => {
    setSortableNodeRef(node);
    setDroppableNodeRef(node);
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isOverdue = task.deadline && new Date(task.deadline) < new Date() && task.status !== TaskStatus.COMPLETED;
  const { data: recurringRule } = useRecurringTask(task.taskId);

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger click when interacting with action buttons
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    onClick?.(task);
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`
        cursor-pointer transition-all duration-200 bg-white
        ${isDragging || isSortableDragging ? 'shadow-lg rotate-3 opacity-90' : 'hover:shadow-md'}
        ${isOver ? 'ring-2 ring-blue-300 ring-opacity-50' : ''}
        ${isOverdue ? 'border-red-200 bg-red-50' : 'border-gray-200'}
      `}
      onClick={handleCardClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm leading-tight text-left">
              {task.title}
            </h4>
          </div>
          <div className="flex items-center gap-1">
            <Badge className={`${getPriorityColor(task.priority)} text-xs`}>
              {task.priority}
            </Badge>
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded"
            >
              <GripVertical className="h-3 w-3 text-gray-400" />
            </div>
          </div>
        </div>
        
        {/* Task Description - Condensed */}
        {task.description && (
          <div className="mt-2">
            <p className="text-xs text-gray-600 leading-relaxed text-left">
              {task.description.length > 100 ? `${task.description.substring(0, 100)}...` : task.description}
            </p>
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-0 pb-3">
        <div className="space-y-2">
          {/* Deadline */}
          {task.deadline && (
            <div className="flex items-center gap-1 text-xs">
              <Calendar className="h-3 w-3" />
              <span className={isOverdue ? 'text-red-600 font-medium' : 'text-gray-600'}>
                {format(new Date(task.deadline), 'MMM dd')}
                {isOverdue && (
                  <AlertCircle className="h-3 w-3 inline ml-1 text-red-500" />
                )}
              </span>
            </div>
          )}

          {/* Assignment */}
          <div className="flex items-center gap-1 text-xs">
            <User className="h-3 w-3" />
            <span className="text-gray-600 truncate">
              {task.assignedUserId ? `${task.assignedUserId}` : 'Unassigned'}
            </span>
          </div>

          {/* Tags - Show only first 2 */}
          {task.tags && task.tags.length > 0 && (
            <div className="flex items-center gap-1 text-xs">
              <TagIcon className="h-3 w-3" />
              <div className="flex flex-wrap gap-1">
                {task.tags.slice(0, 2).map((tag) => (
                  <Badge key={tag.id} variant="outline" className="text-xs px-1 py-0">
                    {tag.name}
                  </Badge>
                ))}
                {task.tags.length > 2 && (
                  <Badge variant="outline" className="text-xs px-1 py-0">
                    +{task.tags.length - 2}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Recurring indicator */}
          {recurringRule && (
            <div className="flex items-center gap-1">
              <Badge variant="outline" className="flex items-center gap-1 text-xs">
                <Repeat className="h-3 w-3" />
                Recurring
              </Badge>
            </div>
          )}

          {/* Action buttons - Compact */}
          <div className="flex items-center justify-between pt-1 border-t border-gray-100">
            <TaskAssignmentSelector
              currentUserId={task.assignedUserId}
              onAssignmentChange={(userId) => onAssignmentChange?.(task.taskId, userId)}
              compact={true}
            />

            <div className="flex items-center gap-1">
              {onEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(task);
                  }}
                  className="h-6 px-2 text-xs"
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
                  className="h-6 px-2 text-xs text-red-600 hover:text-red-700"
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

export default TaskBoardCard;