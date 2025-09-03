import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, Tag as TagIcon, AlertCircle, GripVertical, Repeat } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { TaskPriority } from '../../types';
import type { NormalizedTask } from '../../utils/taskUtils';
import { format } from 'date-fns';
import TaskAssignmentSelector from './TaskAssignmentSelector';

interface TaskBoardCardProps {
    task: NormalizedTask;
    onAssignmentChange?: (taskId: string, userId: string | null) => void;
    onEdit?: (task: NormalizedTask) => void;
    onDelete?: (taskId: string) => void;
    onClick?: (task: NormalizedTask) => void;
    isDragging?: boolean;
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

const TaskBoardCard: React.FC<TaskBoardCardProps> = ({
                                                         task,
                                                         onAssignmentChange,
                                                         onEdit,
                                                         onDelete,
                                                         onClick,
                                                         isDragging,
                                                         workspaceMembers,
                                                     }) => {
    const { attributes, listeners, setNodeRef, transform, transition } =
        useSortable({ id: task.taskId });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const handleCardClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onClick?.(task);
    };

    return (
        <Card
            ref={setNodeRef}
            style={style}
            {...attributes}
            className={`relative rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 ${
                isDragging ? 'z-50' : ''
            }`}
            onClick={handleCardClick}
        >
            <div className="absolute top-0 right-0 p-1 cursor-grab" {...listeners}>
                <GripVertical className="w-4 h-4 text-gray-400" />
            </div>

            <CardHeader className="py-2 px-3">
                <h4 className="font-semibold text-sm text-gray-800 break-words pr-6">
                    {task.title}
                </h4>
            </CardHeader>
            <CardContent className="py-2 px-3">
                <div className="flex flex-col gap-1">
                    <Badge
                        variant="outline"
                        className={`w-fit font-medium ${getPriorityColor(task.priority)}`}
                    >
                        {task.priority.toLowerCase()}
                    </Badge>
                    {task.recurrenceRule && (
                        <Badge
                            variant="outline"
                            className="w-fit font-medium bg-purple-100 text-purple-800 border-purple-200"
                        >
                            <Repeat className="w-3 h-3 mr-1" />
                            Recurring
                        </Badge>
                    )}
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                    {task.tags.map((tag) => (
                        <Badge
                            key={tag.id}
                            variant="secondary"
                            className="w-fit text-xs font-normal"
                        >
                            <TagIcon className="h-3 w-3 mr-1 text-gray-500" />
                            {tag.name}
                        </Badge>
                    ))}
                    {task.categories.map((category) => (
                        <Badge
                            key={category.id}
                            variant="secondary"
                            className="w-fit text-xs font-normal"
                        >
                            {category.name}
                        </Badge>
                    ))}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                    {task.deadline && (
                        <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{format(new Date(task.deadline), 'MMM d, yyyy')}</span>
                        </div>
                    )}
                    {task.deadline && new Date(task.deadline) < new Date() && (
                        <div className="flex items-center gap-1 text-red-500">
                            <AlertCircle className="h-3 w-3" />
                            <span>Overdue</span>
                        </div>
                    )}
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-1 border-t border-gray-100 mt-2">
                    <TaskAssignmentSelector
                        currentUserId={task.assignedUserId}
                        onAssignmentChange={(userId) => onAssignmentChange?.(task.taskId, userId)}
                        compact={true}
                        workspaceMembers={workspaceMembers}
                    />
                    <div className="flex items-center gap-1 flex-shrink-0">
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
            </CardContent>
        </Card>
    );
};

export default TaskBoardCard;