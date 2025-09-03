import { Calendar, Tag as TagIcon, AlertCircle, Repeat } from 'lucide-react';
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
    workspaceMembers?: string[];
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

const getRecurrenceDescription = (recurrenceRule: any) => {
    if (!recurrenceRule) return null;

    const { type, interval } = recurrenceRule;
    const intervalText = interval === 1 ? '' : `${interval} `;

    switch (type) {
        case 'DAILY':
            return `Every ${intervalText}day${interval > 1 ? 's' : ''}`;
        case 'WEEKLY':
            return `Every ${intervalText}week${interval > 1 ? 's' : ''}`;
        case 'MONTHLY':
            return `Every ${intervalText}month${interval > 1 ? 's' : ''}`;
        default:
            return 'Recurring';
    }
};

function TaskCard({
                      task,
                      onStatusChange,
                      onAssignmentChange,
                      onEdit,
                      onDelete,
                      onClick,
                      workspaceMembers = []
                  }: TaskCardProps) {
    const isOverdue = task.deadline && new Date(task.deadline) < new Date() && task.status !== TaskStatus.COMPLETED;
    const isRecurring = Boolean(task.recurrenceRule);

    return (
        <Card
            className={`hover:shadow-md transition-shadow cursor-pointer card-bounded force-bounds ${
                isOverdue ? 'border-red-200 bg-red-50' : ''
            } ${isRecurring ? 'border-l-4 border-l-purple-500' : ''}`}
            onClick={() => onClick?.(task)}
        >
            <CardHeader className="pb-3">
                <div className="task-card-header">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg truncate text-left">{task.title}</h3>
                            {isRecurring && (
                                <Repeat className="h-4 w-4 text-purple-600 flex-shrink-0" />
                            )}
                        </div>
                    </div>
                    <div className="task-card-badges">
                        <Badge className={`${getPriorityColor(task.priority)} text-xs px-2 py-1 badge-safe`}>
                            {task.priority}
                        </Badge>
                        <Badge className={`${getStatusColor(task.status)} text-xs px-2 py-1 badge-safe`}>
                            {task.status.replace('_', ' ')}
                        </Badge>
                        {isRecurring && (
                            <Badge variant="outline" className="flex items-center gap-1 text-xs badge-safe bg-purple-100 text-purple-800 border-purple-200">
                                <Repeat className="h-3 w-3" />
                                Recurring
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Recurring Info */}
                {isRecurring && (
                    <div className="mt-2 p-2 bg-purple-50 rounded-md border-l-2 border-purple-300">
                        <p className="text-xs text-purple-700 font-medium">
                            {getRecurrenceDescription(task.recurrenceRule)}
                        </p>
                        {task.recurrenceRule?.endDate && (
                            <p className="text-xs text-purple-600 mt-1">
                                Until {format(new Date(task.recurrenceRule.endDate), 'MMM dd, yyyy')}
                            </p>
                        )}
                    </div>
                )}

                {/* Task Description - More prominent */}
                {task.description && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-md border-l-4 border-black">
                        <p className="text-sm text-gray-700 leading-relaxed text-left break-words">
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

                    {/* Tags */}
                    {task.tags && task.tags.length > 0 && (
                        <div className="flex items-start gap-2 text-sm">
                            <TagIcon className="h-4 w-4 flex-shrink-0 mt-0.5" />
                            <div className="flex flex-wrap gap-1 min-w-0">
                                {task.tags.map((tag) => (
                                    <Badge key={tag.id} variant="outline" className="text-xs truncate">
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
                                <Badge key={category.id} variant="secondary" className="text-xs truncate">
                                    {category.name}
                                </Badge>
                            ))}
                        </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 border-t">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 min-w-0 flex-1">
                            <TaskStatusSelector
                                currentStatus={task.status}
                                onStatusChange={(status) => onStatusChange?.(task.taskId, status)}
                            />
                            <TaskAssignmentSelector
                                currentUserId={task.assignedUserId}
                                onAssignmentChange={(userId) => onAssignmentChange?.(task.taskId, userId)}
                                workspaceMembers={workspaceMembers}
                            />
                        </div>

                        <div className="flex items-center gap-1 flex-shrink-0">
                            {onEdit && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onEdit(task);
                                    }}
                                    className="text-xs sm:text-sm"
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
                                    className="text-red-600 hover:text-red-700 text-xs sm:text-sm"
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