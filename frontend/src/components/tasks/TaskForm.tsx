import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Plus, Repeat, AlertCircle, Calendar } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '../ui/dialog';
import { Badge } from '../ui/badge';
import { TaskPriority, TaskStatus } from '../../types';
import type { CreateTaskRequest, UpdateTaskRequest } from '../../types';
import type { NormalizedTask } from '../../utils/taskUtils';
import RecurringTaskForm from './RecurringTaskForm';
import { useCreateRecurringTask, useUpdateRecurringTask } from '../../hooks/useRecurringTasks';
import { format } from 'date-fns';

const taskFormSchema = z.object({
    title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
    description: z.string().max(1000, 'Description must be less than 1000 characters'),
    priority: z.nativeEnum(TaskPriority),
    status: z.nativeEnum(TaskStatus).optional(),
    deadline: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskFormSchema>;

interface TaskFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CreateTaskRequest | UpdateTaskRequest, pendingRecurrence?: any) => void;
    task?: NormalizedTask;
    workspaceId?: string;
    projectId?: string;
    isLoading?: boolean;
}

// Create a custom hook for delete recurrence if it doesn't exist
const useDeleteRecurringTask = () => {
    // This is a placeholder - you'll need to implement this based on your API structure
    return {
        mutate: (params: { workspaceId: string; projectId: string; taskId: string }, options?: any) => {
            console.log('Delete recurrence not implemented', params);
            // Implement your delete recurrence logic here
            if (options?.onSuccess) {
                options.onSuccess();
            }
        },
        isPending: false,
    };
};

const getRecurrenceDescription = (recurrenceRule: any) => {
    if (!recurrenceRule) return '';

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

function TaskForm({ isOpen, onClose, onSubmit, task, workspaceId, projectId, isLoading = false }: TaskFormProps) {
    const [tags, setTags] = useState<string[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [newTag, setNewTag] = useState('');
    const [newCategory, setNewCategory] = useState('');
    const [showRecurringForm, setShowRecurringForm] = useState(false);

    const createRecurringMutation = useCreateRecurringTask();
    const updateRecurringMutation = useUpdateRecurringTask();
    const deleteRecurringMutation = useDeleteRecurringTask();

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors },
    } = useForm<TaskFormData>({
        resolver: zodResolver(taskFormSchema),
    });

    useEffect(() => {
        if (isOpen) {
            if (task) {
                setValue('title', task.title);
                setValue('description', task.description);
                setValue('priority', task.priority);
                setValue('deadline', task.deadline ? task.deadline.split('T')[0] : '');
                setValue('status', task.status);
                setTags(task.tags?.map(t => t.name) || []);
                setCategories(task.categories?.map(c => c.name) || []);
            } else {
                reset({
                    title: '',
                    description: '',
                    priority: TaskPriority.MEDIUM,
                    status: TaskStatus.PENDING,
                    deadline: '',
                });
                setTags([]);
                setCategories([]);
            }
        }
    }, [task, setValue, reset, isOpen]);

    const priority = watch('priority');
    const status = watch('status');

    const handleClose = () => {
        if (isLoading) return;

        reset();
        setTags([]);
        setCategories([]);
        setNewTag('');
        setNewCategory('');
        onClose();
    };

    const handleFormSubmit = (data: TaskFormData) => {
        if (isLoading) return;

        const deadlineValue = data.deadline ? new Date(data.deadline + 'T00:00:00.000Z').toISOString() : undefined;

        if (task) {
            const updateData: UpdateTaskRequest = {
                title: data.title,
                description: data.description,
                priority: data.priority,
                deadline: deadlineValue,
                tags: tags,
                categories: categories,
                status: data.status || task.status,
            };
            onSubmit(updateData);
        } else {
            const createData: CreateTaskRequest = {
                title: data.title,
                description: data.description,
                priority: data.priority,
                deadlineDate: deadlineValue,
                tags: tags,
                categories: categories,
            };

            onSubmit(createData);
        }
    };

    const addTag = () => {
        if (newTag.trim() && !tags.includes(newTag.trim())) {
            setTags([...tags, newTag.trim()]);
            setNewTag('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    const addCategory = () => {
        if (newCategory.trim() && !categories.includes(newCategory.trim())) {
            setCategories([...categories, newCategory.trim()]);
            setNewCategory('');
        }
    };

    const removeCategory = (categoryToRemove: string) => {
        setCategories(categories.filter(category => category !== categoryToRemove));
    };

    const handleRecurringSubmit = (recurringData: any) => {
        if (!task?.taskId || !workspaceId || !projectId) return;

        if (task.recurrenceRule) {
            // Update existing recurrence
            updateRecurringMutation.mutate(
                {
                    workspaceId,
                    projectId,
                    taskId: task.taskId,
                    data: recurringData
                },
                {
                    onSuccess: () => {
                        setShowRecurringForm(false);
                    },
                }
            );
        } else {
            // Create new recurrence
            createRecurringMutation.mutate(
                {
                    workspaceId,
                    projectId,
                    taskId: task.taskId,
                    data: recurringData
                },
                {
                    onSuccess: () => {
                        setShowRecurringForm(false);
                    },
                }
            );
        }
    };

    const handleRemoveRecurrence = () => {
        if (!task?.taskId || !workspaceId || !projectId || !task?.recurrenceRule) return;

        deleteRecurringMutation.mutate(
            {
                workspaceId,
                projectId,
                taskId: task.taskId
            },
            {
                onSuccess: () => {
                    console.log('Recurrence removed successfully');
                },
            }
        );
    };

    const isRecurring = Boolean(task?.recurrenceRule);

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {task ? 'Edit Task' : 'Create New Task'}
                        {isRecurring && (
                            <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">
                                <Repeat className="h-3 w-3 mr-1" />
                                Recurring
                            </Badge>
                        )}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
                    {/* Current Recurrence Info - Only show for existing recurring tasks */}
                    {isRecurring && task?.recurrenceRule && (
                        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Repeat className="h-4 w-4 text-purple-600" />
                                        <h4 className="font-medium text-purple-800">Recurring Task Settings</h4>
                                    </div>
                                    <p className="text-sm text-purple-700 mb-1">
                                        <strong>Pattern:</strong> {getRecurrenceDescription(task.recurrenceRule)}
                                    </p>
                                    {task.recurrenceRule.endDate && (
                                        <p className="text-sm text-purple-700 flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            <strong>Ends:</strong> {format(new Date(task.recurrenceRule.endDate), 'MMM dd, yyyy')}
                                        </p>
                                    )}
                                    {!task.recurrenceRule.endDate && (
                                        <p className="text-sm text-purple-700">
                                            <strong>Ends:</strong> Never
                                        </p>
                                    )}
                                </div>
                                <div className="flex gap-1">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setShowRecurringForm(true)}
                                        className="text-purple-700 border-purple-300 hover:bg-purple-100"
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handleRemoveRecurrence}
                                        disabled={deleteRecurringMutation.isPending}
                                        className="text-red-600 border-red-300 hover:bg-red-50"
                                    >
                                        {deleteRecurringMutation.isPending ? 'Removing...' : 'Remove'}
                                    </Button>
                                </div>
                            </div>

                            <div className="mt-3 p-2 bg-purple-100 rounded border-l-2 border-purple-400">
                                <div className="flex items-start gap-2">
                                    <AlertCircle className="h-4 w-4 text-purple-600 flex-shrink-0 mt-0.5" />
                                    <p className="text-xs text-purple-700">
                                        Changes to this task will only affect this specific instance. The recurring pattern will continue creating new tasks as scheduled.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Title */}
                    <div className="space-y-2">
                        <Label htmlFor="title">Title *</Label>
                        <Input
                            id="title"
                            {...register('title')}
                            placeholder="Enter task title"
                            className={errors.title ? 'border-red-500' : ''}
                        />
                        {errors.title && (
                            <p className="text-sm text-red-600">{errors.title.message}</p>
                        )}
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            {...register('description')}
                            placeholder="Enter task description"
                            rows={4}
                            className={errors.description ? 'border-red-500' : ''}
                        />
                        {errors.description && (
                            <p className="text-sm text-red-600">{errors.description.message}</p>
                        )}
                    </div>

                    {/* Priority, Status and Deadline */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="priority">Priority *</Label>
                            <Select
                                value={priority}
                                onValueChange={(value) => setValue('priority', value as TaskPriority)}
                            >
                                <SelectTrigger className="bg-white">
                                    <SelectValue placeholder="Select priority" />
                                </SelectTrigger>
                                <SelectContent className="bg-white">
                                    <SelectItem value={TaskPriority.LOW}>Low</SelectItem>
                                    <SelectItem value={TaskPriority.MEDIUM}>Medium</SelectItem>
                                    <SelectItem value={TaskPriority.HIGH}>High</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {task && (
                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <Select
                                    value={status}
                                    onValueChange={(value) => setValue('status', value as TaskStatus)}
                                >
                                    <SelectTrigger className="bg-white">
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white">
                                        <SelectItem value={TaskStatus.PENDING}>Pending</SelectItem>
                                        <SelectItem value={TaskStatus.IN_PROGRESS}>In Progress</SelectItem>
                                        <SelectItem value={TaskStatus.COMPLETED}>Completed</SelectItem>
                                        <SelectItem value={TaskStatus.CANCELLED}>Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="deadline">Deadline</Label>
                            <Input
                                id="deadline"
                                type="date"
                                {...register('deadline')}
                                className={errors.deadline ? 'border-red-500' : ''}
                            />
                            {errors.deadline && (
                                <p className="text-sm text-red-600">{errors.deadline.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Tags */}
                    <div className="space-y-2">
                        <Label>Tags</Label>
                        <div className="flex gap-2">
                            <Input
                                value={newTag}
                                onChange={(e) => setNewTag(e.target.value)}
                                placeholder="Add a tag"
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        addTag();
                                    }
                                }}
                            />
                            <Button type="button" onClick={addTag} size="sm">
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                        {tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {tags.map((tag) => (
                                    <Badge key={tag} variant="outline" className="flex items-center gap-1">
                                        {tag}
                                        <button
                                            type="button"
                                            onClick={() => removeTag(tag)}
                                            className="ml-1 hover:text-red-600"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Categories */}
                    <div className="space-y-2">
                        <Label>Categories</Label>
                        <div className="flex gap-2">
                            <Input
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value)}
                                placeholder="Add a category"
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        addCategory();
                                    }
                                }}
                            />
                            <Button type="button" onClick={addCategory} size="sm">
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                        {categories.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {categories.map((category) => (
                                    <Badge key={category} variant="secondary" className="flex items-center gap-1">
                                        {category}
                                        <button
                                            type="button"
                                            onClick={() => removeCategory(category)}
                                            className="ml-1 hover:text-red-600"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Recurring Task Settings - Only show for existing tasks without recurrence */}
                    {task && workspaceId && projectId && !isRecurring && (
                        <div className="space-y-2">
                            <Label>Recurring Task</Label>
                            <div className="flex items-center justify-between p-3 border rounded-md">
                                <div className="flex items-center gap-2">
                                    <Repeat className="h-4 w-4" />
                                    <span className="text-sm">
                        Set up recurring schedule for this task
                      </span>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowRecurringForm(true)}
                                >
                                    Set Recurrence
                                </Button>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            className='bg-black text-white'
                            type="submit"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
                        </Button>
                    </DialogFooter>
                </form>

                {/* Recurring Task Form - Only for existing tasks */}
                {task && workspaceId && projectId && (
                    <RecurringTaskForm
                        isOpen={showRecurringForm}
                        onClose={() => setShowRecurringForm(false)}
                        onSubmit={handleRecurringSubmit}
                        isLoading={
                            createRecurringMutation.isPending ||
                            updateRecurringMutation.isPending ||
                            deleteRecurringMutation.isPending
                        }
                    />
                )}
            </DialogContent>
        </Dialog>
    );
}

export default TaskForm;