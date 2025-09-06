import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, Tag as TagIcon, AlertCircle, GripVertical, Repeat, FolderOpen } from 'lucide-react';
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
    onTagClick?: (tagName: string) => void;
    onCategoryClick?: (categoryName: string) => void;
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

const TaskBoardCard: React.FC<TaskBoardCardProps> = ({
                                                         task,
                                                         onAssignmentChange,
                                                         onEdit,
                                                         onDelete,
                                                         onClick,
                                                         isDragging,
                                                         workspaceMembers,
                                                         onTagClick,
                                                         onCategoryClick,
                                                     }) => {
    const { attributes, listeners, setNodeRef, transform, transition } =
        useSortable({ id: task.taskId });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const isRecurring = Boolean(task.recurrenceRule);
    const isOverdue = task.deadline && new Date(task.deadline) < new Date();

    const handleCardClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onClick?.(task);
    };

    const handleTagClick = (e: React.MouseEvent, tagName: string) => {
        e.stopPropagation();
        onTagClick?.(tagName);
    };

    const handleCategoryClick = (e: React.MouseEvent, categoryName: string) => {
        e.stopPropagation();
        onCategoryClick?.(categoryName);
    };

    return (
        <Card
            ref={setNodeRef}
            style={style}
            {...attributes}
            className={`relative rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 ${
                isDragging ? 'z-50' : ''
            } ${isRecurring ? 'border-l-4 border-l-purple-500' : ''}`}
            onClick={handleCardClick}
        >
            <div className="absolute top-0 right-0 p-1 cursor-grab" {...listeners}>
                <GripVertical className="w-4 h-4 text-gray-400" />
            </div>

            <CardHeader className="py-2 px-3">
                <div className="flex items-start gap-2">
                    <h4 className="font-semibold text-sm text-gray-800 break-words pr-6 flex-1">
                        {task.title}
                    </h4>
                    {isRecurring && (
                        <Repeat className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                    )}
                </div>
            </CardHeader>

            <CardContent className="py-2 px-3">
                <div className="flex flex-col gap-2">
                    {/* Priority and Recurring badges */}
                    <div className="flex flex-col gap-1">
                        <Badge
                            variant="outline"
                            className={`w-fit font-medium ${getPriorityColor(task.priority)}`}
                        >
                            {task.priority.toLowerCase()}
                        </Badge>
                        {isRecurring && (
                            <Badge
                                variant="outline"
                                className="w-fit font-medium bg-purple-100 text-purple-800 border-purple-200"
                            >
                                <Repeat className="w-3 h-3 mr-1" />
                                {getRecurrenceDescription(task.recurrenceRule)}
                            </Badge>
                        )}
                    </div>

                    {/* Tags Section */}
                    {task.tags && task.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                            <div className="flex items-center gap-1 w-full">
                                <TagIcon className="h-3 w-3 text-gray-500 flex-shrink-0" />
                                <span className="text-xs text-gray-600 font-medium">Tags:</span>
                            </div>
                            <div className="flex flex-wrap gap-1 ml-4">
                                {task.tags.slice(0, 3).map((tag) => (
                                    <Badge
                                        key={tag.id}
                                        variant="secondary"
                                        className="w-fit text-xs font-normal cursor-pointer hover:bg-blue-100 transition-colors"
                                        onClick={(e) => handleTagClick(e, tag.name)}
                                    >
                                        {tag.name}
                                    </Badge>
                                ))}
                                {task.tags.length > 3 && (
                                    <Badge
                                        variant="secondary"
                                        className="w-fit text-xs font-normal cursor-pointer hover:bg-blue-100 transition-colors"
                                        title={`${task.tags.length - 3} more tags: ${task.tags.slice(3).map(t => t.name).join(', ')}`}
                                    >
                                        +{task.tags.length - 3}
                                    </Badge>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Categories Section */}
                    {task.categories && task.categories.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                            <div className="flex items-center gap-1 w-full">
                                <FolderOpen className="h-3 w-3 text-gray-500 flex-shrink-0" />
                                <span className="text-xs text-gray-600 font-medium">Categories:</span>
                            </div>
                            <div className="flex flex-wrap gap-1 ml-4">
                                {task.categories.slice(0, 2).map((category) => (
                                    <Badge
                                        key={category.id}
                                        variant="outline"
                                        className="w-fit text-xs font-normal bg-indigo-50 text-indigo-700 border-indigo-200 cursor-pointer hover:bg-indigo-100 transition-colors"
                                        onClick={(e) => handleCategoryClick(e, category.name)}
                                    >
                                        {category.name}
                                    </Badge>
                                ))}
                                {task.categories.length > 2 && (
                                    <Badge
                                        variant="outline"
                                        className="w-fit text-xs font-normal bg-indigo-50 text-indigo-700 border-indigo-200 cursor-pointer hover:bg-indigo-100 transition-colors"
                                        title={`${task.categories.length - 2} more categories: ${task.categories.slice(2).map(c => c.name).join(', ')}`}
                                    >
                                        +{task.categories.length - 2}
                                    </Badge>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Deadline */}
                    {task.deadline && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Calendar className="h-3 w-3" />
                            <span className={isOverdue ? 'text-red-500 font-medium' : ''}>
                                {format(new Date(task.deadline), 'MMM d')}
                            </span>
                            {isOverdue && (
                                <AlertCircle className="h-3 w-3 text-red-500" />
                            )}
                        </div>
                    )}

                    {/* Recurring end date info */}
                    {isRecurring && task.recurrenceRule?.endDate && (
                        <div className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded">
                            Until {format(new Date(task.recurrenceRule.endDate), 'MMM d, yyyy')}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col gap-2 pt-1 border-t border-gray-100 mt-2">
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
                                    className="h-6 px-2 text-xs flex-1"
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
                                    className="h-6 px-2 text-xs text-red-600 hover:text-red-700 flex-1"
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
};

export default TaskBoardCard;