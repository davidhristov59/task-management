import { useState, useMemo, useEffect } from 'react';
import {
    DndContext,
    DragOverlay,
    PointerSensor,
    useSensor,
    useSensors,
    closestCorners,
} from '@dnd-kit/core';
import {
    arrayMove,
} from '@dnd-kit/sortable';
import type { DragEndEvent, DragStartEvent, DragOverEvent } from '@dnd-kit/core';
import { Plus } from 'lucide-react';
import { Button } from '../ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../ui/select';
import { TaskStatus, TaskPriority } from '../../types';
import type { NormalizedTask } from '../../utils/taskUtils';

import TaskBoardColumn from './TaskBoardColumn';
import TaskBoardCard from './TaskBoardCard';

interface TaskBoardProps {
    tasks: NormalizedTask[];
    onTaskClick?: (task: NormalizedTask) => void;
    onTaskEdit?: (task: NormalizedTask) => void;
    onTaskDelete?: (taskId: string) => void;
    onTaskStatusChange?: (taskId: string, status: TaskStatus) => void;
    onTaskAssignmentChange?: (taskId: string, userId: string | null) => void;
    onCreateTask?: () => void;
    isLoading?: boolean;
    searchQuery?: string;
}

const BOARD_COLUMNS = [
    { id: TaskStatus.PENDING, title: 'Pending', color: 'bg-gray-100' },
    { id: TaskStatus.IN_PROGRESS, title: 'In Progress', color: 'bg-blue-100' },
    { id: TaskStatus.COMPLETED, title: 'Completed', color: 'bg-green-100' },
    { id: TaskStatus.CANCELLED, title: 'Cancelled', color: 'bg-red-100' },
];

function TaskBoard({
    tasks,
    onTaskClick,
    onTaskEdit,
    onTaskDelete,
    onTaskStatusChange,
    onTaskAssignmentChange,
    onCreateTask,
    isLoading = false,
    searchQuery = '',
}: TaskBoardProps) {
    const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all');
    const [assignmentFilter, setAssignmentFilter] = useState<'assigned' | 'unassigned' | 'all'>('all');
    const [activeTask, setActiveTask] = useState<NormalizedTask | null>(null);

    // Local state for optimistic updates - track changes instead of full task list
    const [optimisticChanges, setOptimisticChanges] = useState<Record<string, { status?: TaskStatus; sortOrder?: number }>>({});

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    // Apply optimistic changes to tasks
    const currentTasks = useMemo(() => {
        return tasks.map(task => {
            const changes = optimisticChanges[task.taskId];
            if (changes) {
                return {
                    ...task,
                    ...(changes.status && { status: changes.status }),
                    ...(changes.sortOrder !== undefined && { sortOrder: changes.sortOrder } as any)
                };
            }
            return task;
        });
    }, [tasks, optimisticChanges]);

    const filteredTasks = useMemo(() => {
        return currentTasks.filter((task) => {
            // Search filter
            const matchesSearch = searchQuery === '' ||
                task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                task.tags.some((tag: { name: string; }) => tag.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
                task.categories.some((cat: { name: string; }) => cat.name.toLowerCase().includes(searchQuery.toLowerCase()));

            // Priority filter
            const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;

            // Assignment filter
            const matchesAssignment = assignmentFilter === 'all' ||
                (assignmentFilter === 'assigned' && task.assignedUserId) ||
                (assignmentFilter === 'unassigned' && !task.assignedUserId);

            return matchesSearch && matchesPriority && matchesAssignment;
        });
    }, [currentTasks, searchQuery, priorityFilter, assignmentFilter]);

    const tasksByStatus = useMemo(() => {
        const grouped = BOARD_COLUMNS.reduce((acc, column) => {
            acc[column.id] = filteredTasks
                .filter(task => task.status === column.id)
                .sort((a, b) => {
                    // Use createdAt as fallback for sorting if no sortOrder
                    const aOrder = (a as any).sortOrder ?? new Date(a.createdAt).getTime();
                    const bOrder = (b as any).sortOrder ?? new Date(b.createdAt).getTime();
                    return aOrder - bOrder;
                });
            return acc;
        }, {} as Record<TaskStatus, NormalizedTask[]>);

        return grouped;
    }, [filteredTasks]);

    // Reset optimistic changes when tasks prop changes (after successful API call)
    // Only clear changes if the server data matches our optimistic changes
    useEffect(() => {
        if (Object.keys(optimisticChanges).length === 0) return;

        // Add a small delay to prevent clearing changes too quickly
        const timeoutId = setTimeout(() => {
            // Check if any of our optimistic changes are now reflected in the server data
            const shouldClear = Object.entries(optimisticChanges).some(([taskId, changes]) => {
                const serverTask = tasks.find(t => t.taskId === taskId);
                if (!serverTask) return false;

                // If status was changed optimistically, check if server has the new status
                if (changes.status && serverTask.status === changes.status) {
                    return true;
                }

                return false;
            });

            if (shouldClear) {
                setOptimisticChanges({});
            }
        }, 100); // Small delay to ensure API response is processed

        return () => clearTimeout(timeoutId);
    }, [tasks, optimisticChanges]);

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const task = currentTasks.find(t => t.taskId === active.id);
        setActiveTask(task || null);
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;

        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        // Find the active task
        const activeTask = currentTasks.find(t => t.taskId === activeId);
        if (!activeTask) return;

        // Determine the target status
        let targetStatus: TaskStatus;
        let targetTask: NormalizedTask | undefined;

        if (Object.values(TaskStatus).includes(overId as TaskStatus)) {
            // Dropped over a column
            targetStatus = overId as TaskStatus;
        } else {
            // Dropped over a task
            targetTask = currentTasks.find(t => t.taskId === overId);
            if (!targetTask) return;
            targetStatus = targetTask.status;
        }

        // If status is changing, update optimistically
        if (activeTask.status !== targetStatus) {
            setOptimisticChanges(prev => ({
                ...prev,
                [activeId]: { ...prev[activeId], status: targetStatus }
            }));
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveTask(null);

        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        // Find the active task from ORIGINAL tasks (not optimistic)
        const originalActiveTask = tasks.find(t => t.taskId === activeId);
        if (!originalActiveTask) return;

        let targetStatus: TaskStatus;
        let targetTask: NormalizedTask | undefined;

        // Determine what we're dropping over
        if (Object.values(TaskStatus).includes(overId as TaskStatus)) {
            // Dropped over a column
            targetStatus = overId as TaskStatus;
        } else {
            // Dropped over a task
            targetTask = currentTasks.find(t => t.taskId === overId);
            if (!targetTask) return;
            targetStatus = targetTask.status;
        }

        // Handle status change - compare with ORIGINAL status
        if (originalActiveTask.status !== targetStatus) {
            // Status is changing - call the status change handler
            onTaskStatusChange?.(activeId, targetStatus);
        } else if (targetTask && activeId !== overId) {
            // Same status, different task - handle reordering within column
            console.log('Reordering within column:', activeId, 'to position of', overId);

            // Use current tasks for reordering (includes optimistic changes)
            const tasksInColumn = currentTasks.filter(t => t.status === targetStatus);
            const activeIndex = tasksInColumn.findIndex(t => t.taskId === activeId);
            const overIndex = tasksInColumn.findIndex(t => t.taskId === overId);

            console.log('Reorder indices:', { activeIndex, overIndex, columnLength: tasksInColumn.length });

            if (activeIndex !== -1 && overIndex !== -1 && activeIndex !== overIndex) {
                const reorderedTasks = arrayMove(tasksInColumn, activeIndex, overIndex);

                // Create fresh optimistic changes for this column only
                const newChanges = { ...optimisticChanges };

                // Clear any existing sortOrder changes for tasks in this column
                tasksInColumn.forEach(task => {
                    if (newChanges[task.taskId]) {
                        delete newChanges[task.taskId].sortOrder;
                        if (Object.keys(newChanges[task.taskId]).length === 0) {
                            delete newChanges[task.taskId];
                        }
                    }
                });

                // Apply new sort orders
                reorderedTasks.forEach((task, index) => {
                    newChanges[task.taskId] = {
                        ...newChanges[task.taskId],
                        sortOrder: index
                    };
                });

                setOptimisticChanges(newChanges);
                console.log('Applied reorder optimistic changes:', newChanges);

                // TODO: Call reorder handler when available
                // onTaskReorder?.(activeId, targetStatus, overIndex);
            }
        }
    };

    const clearFilters = () => {
        setPriorityFilter('all');
        setAssignmentFilter('all');
    };

    const hasActiveFilters = priorityFilter !== 'all' || assignmentFilter !== 'all';

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
                    <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {BOARD_COLUMNS.map((column) => (
                        <div key={column.id} className="space-y-4">
                            <div className="h-8 bg-gray-200 rounded animate-pulse" />
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="h-32 bg-gray-200 rounded animate-pulse" />
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Kanban Board */}
            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {BOARD_COLUMNS.map((column) => (
                        <TaskBoardColumn
                            key={column.id}
                            id={column.id}
                            title={column.title}
                            color={column.color}
                            tasks={tasksByStatus[column.id]}
                            onTaskClick={onTaskClick}
                            onTaskEdit={onTaskEdit}
                            onTaskDelete={onTaskDelete}
                            onTaskAssignmentChange={onTaskAssignmentChange}
                        />
                    ))}
                </div>

                <DragOverlay>
                    {activeTask ? (
                        <TaskBoardCard
                            task={activeTask}
                            isDragging={true}
                        />
                    ) : null}
                </DragOverlay>
            </DndContext>

            {/* Empty state */}
            {filteredTasks.length === 0 && (
                <div className="text-center py-12">
                    <div className="text-gray-500 mb-4">
                        {tasks.length === 0 ? 'No tasks yet' : 'No tasks match your filters'}
                    </div>
                    {onCreateTask && tasks.length === 0 && (
                        <Button onClick={onCreateTask}>
                            <Plus className="h-4 w-4 mr-2" />
                            Create your first task
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}

export default TaskBoard;