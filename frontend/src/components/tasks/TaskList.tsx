import { useState, useMemo } from 'react';
import { Plus, Grid, Kanban, Tag, FolderOpen, X } from 'lucide-react';
import { Button } from '../ui/button';
import { AdvancedFilters, type FilterOptions, type SortOptions } from '../ui/advanced-filters';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { TaskStatus } from '../../types';
import type { NormalizedTask } from '../../utils/taskUtils';
import TaskCard from './TaskCard';
import TaskBoard from './TaskBoard';
import { useUIStore } from '../../stores/uiStore';

interface TaskListProps {
    tasks: NormalizedTask[];
    onTaskClick?: (task: NormalizedTask) => void;
    onTaskEdit?: (task: NormalizedTask) => void;
    onTaskDelete?: (taskId: string) => void;
    onTaskStatusChange?: (taskId: string, status: TaskStatus) => void;
    onTaskAssignmentChange?: (taskId: string, userId: string | null) => void;
    onCreateTask?: () => void;
    isLoading?: boolean;
    workspaceMembers?: string[];
}

type GroupBy = 'none' | 'tag' | 'category' | 'priority' | 'status';

interface TaskGroup {
    name: string;
    tasks: NormalizedTask[];
    color?: string;
}

function TaskList({
                      tasks,
                      onTaskClick,
                      onTaskEdit,
                      onTaskDelete,
                      onTaskStatusChange,
                      onTaskAssignmentChange,
                      onCreateTask,
                      isLoading = false,
                      workspaceMembers = [],
                  }: TaskListProps) {
    const [filters, setFilters] = useState<FilterOptions>({
        search: '',
        status: 'all',
        priority: 'all',
        assignment: 'all',
        tags: [],
        categories: [],
    });
    const [sortOptions, setSortOptions] = useState<SortOptions>({
        field: 'created',
        direction: 'desc',
    });
    const [groupBy, setGroupBy] = useState<GroupBy>('none');
    const [activeQuickFilter, setActiveQuickFilter] = useState<{ type: 'tag' | 'category'; value: string } | null>(null);

    const { taskViewMode, setTaskViewMode } = useUIStore();

    // Available tags and categories for filters
    const availableTags = useMemo(() => {
        const tagSet = new Set<string>();
        tasks.forEach(task => {
            task.tags.forEach(tag => tagSet.add(tag.name));
        });
        return Array.from(tagSet).sort();
    }, [tasks]);

    const availableCategories = useMemo(() => {
        const categorySet = new Set<string>();
        tasks.forEach(task => {
            task.categories.forEach(category => categorySet.add(category.name));
        });
        return Array.from(categorySet).sort();
    }, [tasks]);

    // Filter tasks based on all criteria including quick filters
    const filteredTasks = useMemo(() => {
        return tasks.filter((task) => {
            // Search filter
            const matchesSearch = !filters.search ||
                task.title.toLowerCase().includes(filters.search.toLowerCase()) ||
                task.description.toLowerCase().includes(filters.search.toLowerCase()) ||
                task.tags.some(tag => tag.name.toLowerCase().includes(filters?.search!.toLowerCase())) ||
                task.categories.some(cat => cat.name.toLowerCase().includes(filters?.search!.toLowerCase()));

            // Status filter
            const matchesStatus = filters.status === 'all' || task.status === filters.status;

            // Priority filter
            const matchesPriority = filters.priority === 'all' || task.priority === filters.priority;

            // Assignment filter
            const matchesAssignment = filters.assignment === 'all' ||
                (filters.assignment === 'assigned' && task.assignedUserId) ||
                (filters.assignment === 'unassigned' && !task.assignedUserId);

            // Tags filter
            const matchesTags = !filters.tags || filters.tags.length === 0 ||
                filters.tags.every(filterTag => task.tags.some(taskTag => taskTag.name === filterTag));

            // Categories filter
            const matchesCategories = !filters.categories || filters.categories.length === 0 ||
                filters.categories.every(filterCategory => task.categories.some(taskCategory => taskCategory.name === filterCategory));

            // Date range filter
            const matchesDateRange = !filters.dateRange ||
                (!filters.dateRange.from && !filters.dateRange.to) ||
                (() => {
                    const taskDate = new Date(task.deadline || task.createdAt);
                    const fromDate = filters.dateRange.from ? new Date(filters.dateRange.from) : null;
                    const toDate = filters.dateRange.to ? new Date(filters.dateRange.to) : null;

                    if (fromDate && toDate) {
                        return taskDate >= fromDate && taskDate <= toDate;
                    } else if (fromDate) {
                        return taskDate >= fromDate;
                    } else if (toDate) {
                        return taskDate <= toDate;
                    }
                    return true;
                })();

            // Quick filter for tags/categories
            const matchesQuickFilter = !activeQuickFilter ||
                (activeQuickFilter.type === 'tag' && task.tags.some(tag => tag.name === activeQuickFilter.value)) ||
                (activeQuickFilter.type === 'category' && task.categories.some(cat => cat.name === activeQuickFilter.value));

            return matchesSearch && matchesStatus && matchesPriority && matchesAssignment &&
                matchesTags && matchesCategories && matchesDateRange && matchesQuickFilter;
        });
    }, [tasks, filters, activeQuickFilter]);

    // Sort tasks
    const sortedTasks = useMemo(() => {
        const sorted = [...filteredTasks];
        sorted.sort((a, b) => {
            let comparison = 0;

            switch (sortOptions.field) {
                case 'title':
                    comparison = a.title.localeCompare(b.title);
                    break;
                case 'priority':
                    const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
                    comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
                    break;
                case 'status':
                    comparison = a.status.localeCompare(b.status);
                    break;
                case 'deadline':
                    if (!a.deadline && !b.deadline) comparison = 0;
                    else if (!a.deadline) comparison = 1;
                    else if (!b.deadline) comparison = -1;
                    else comparison = new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
                    break;
                case 'created':
                default:
                    comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                    break;
            }

            return sortOptions.direction === 'asc' ? comparison : -comparison;
        });

        return sorted;
    }, [filteredTasks, sortOptions]);

    // Group tasks based on groupBy setting
    const groupedTasks = useMemo((): TaskGroup[] => {
        if (groupBy === 'none') {
            return [{ name: 'All Tasks', tasks: sortedTasks }];
        }

        const groups: { [key: string]: TaskGroup } = {};

        sortedTasks.forEach(task => {
            let groupKeys: string[] = [];

            switch (groupBy) {
                case 'tag':
                    if (task.tags.length === 0) {
                        groupKeys = ['No Tags'];
                    } else {
                        groupKeys = task.tags.map(tag => tag.name);
                    }
                    break;
                case 'category':
                    if (task.categories.length === 0) {
                        groupKeys = ['No Categories'];
                    } else {
                        groupKeys = task.categories.map(cat => cat.name);
                    }
                    break;
                case 'priority':
                    groupKeys = [task.priority];
                    break;
                case 'status':
                    groupKeys = [task.status.replace('_', ' ')];
                    break;
            }

            groupKeys.forEach(key => {
                if (!groups[key]) {
                    groups[key] = {
                        name: key,
                        tasks: [],
                        color: getGroupColor(groupBy, key)
                    };
                }
                groups[key].tasks.push(task);
            });
        });

        return Object.values(groups).sort((a, b) => a.name.localeCompare(b.name));
    }, [sortedTasks, groupBy]);

    const getGroupColor = (groupType: GroupBy, groupName: string): string => {
        switch (groupType) {
            case 'tag':
                return 'bg-blue-50 border-blue-200';
            case 'category':
                return 'bg-indigo-50 border-indigo-200';
            case 'priority':
                switch (groupName) {
                    case 'HIGH': return 'bg-red-50 border-red-200';
                    case 'MEDIUM': return 'bg-yellow-50 border-yellow-200';
                    case 'LOW': return 'bg-green-50 border-green-200';
                    default: return 'bg-gray-50 border-gray-200';
                }
            case 'status':
                switch (groupName) {
                    case 'COMPLETED': return 'bg-green-50 border-green-200';
                    case 'IN_PROGRESS': return 'bg-blue-50 border-blue-200';
                    case 'CANCELLED': return 'bg-red-50 border-red-200';
                    default: return 'bg-gray-50 border-gray-200';
                }
            default:
                return 'bg-gray-50 border-gray-200';
        }
    };

    const handleTagClick = (tagName: string) => {
        setActiveQuickFilter({ type: 'tag', value: tagName });
    };

    const handleCategoryClick = (categoryName: string) => {
        setActiveQuickFilter({ type: 'category', value: categoryName });
    };

    const clearQuickFilter = () => {
        setActiveQuickFilter(null);
    };

    const hasActiveFilters =
        filters.search ||
        (filters.status && filters.status !== 'all') ||
        (filters.priority && filters.priority !== 'all') ||
        (filters.assignment && filters.assignment !== 'all') ||
        (filters.tags && filters.tags.length > 0) ||
        (filters.categories && filters.categories.length > 0) ||
        filters.dateRange ||
        activeQuickFilter;

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
                    <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-48 bg-gray-200 rounded animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header with filters and actions */}
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                <div className="flex-1">
                    <AdvancedFilters
                        filters={filters}
                        onFiltersChange={setFilters}
                        sortOptions={sortOptions}
                        onSortChange={setSortOptions}
                        availableTags={availableTags}
                        availableCategories={availableCategories}
                        showTaskFilters={true}
                        showProjectFilters={false}
                    />
                </div>

                <div className="flex items-center gap-2">
                    {/* Grouping selector - only show in grid view */}
                    {taskViewMode === 'grid' && (
                        <Select value={groupBy} onValueChange={(value: GroupBy) => setGroupBy(value)}>
                            <SelectTrigger className="w-40 bg-white">
                                <SelectValue placeholder="Group by..." />
                            </SelectTrigger>
                            <SelectContent className="bg-white">
                                <SelectItem value="none">No Grouping</SelectItem>
                                <SelectItem value="tag">By Tag</SelectItem>
                                <SelectItem value="category">By Category</SelectItem>
                                <SelectItem value="priority">By Priority</SelectItem>
                                <SelectItem value="status">By Status</SelectItem>
                            </SelectContent>
                        </Select>
                    )}

                    {/* View mode toggle */}
                    <div className="flex items-center bg-white border border-gray-300 rounded-md shadow-sm">
                        <Button
                            variant={taskViewMode === 'board' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setTaskViewMode('board')}
                            className={`rounded-r-none ${
                                taskViewMode === 'board'
                                    ? 'bg-black text-white hover:bg-gray-700'
                                    : 'bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            <Kanban className="h-4 w-4 mr-1" />
                            Board
                        </Button>
                        <Button
                            variant={taskViewMode === 'grid' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setTaskViewMode('grid')}
                            className={`rounded-l-none border-l ${
                                taskViewMode === 'grid'
                                    ? 'bg-black text-white hover:bg-gray-700'
                                    : 'bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            <Grid className="h-4 w-4 mr-1" />
                            Grid
                        </Button>
                    </div>

                    {onCreateTask && (
                        <Button
                            onClick={onCreateTask}
                            className="bg-black hover:bg-gray-700 text-white shadow-sm"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            New Task
                        </Button>
                    )}
                </div>
            </div>

            {/* Active quick filter display */}
            {activeQuickFilter && (
                <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2">
                        {activeQuickFilter.type === 'tag' ? (
                            <Tag className="h-4 w-4 text-blue-600" />
                        ) : (
                            <FolderOpen className="h-4 w-4 text-blue-600" />
                        )}
                        <span className="text-sm font-medium text-blue-800">
              Filtering by {activeQuickFilter.type}: {activeQuickFilter.value}
            </span>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearQuickFilter}
                        className="h-6 w-6 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            )}

            {/* Results count */}
            <div className="text-sm text-gray-600">
                Showing {sortedTasks.length} of {tasks.length} tasks
                {groupBy !== 'none' && ` in ${groupedTasks.length} groups`}
            </div>

            {/* Render based on view mode */}
            {taskViewMode === 'board' ? (
                <TaskBoard
                    tasks={sortedTasks}
                    onTaskClick={onTaskClick}
                    onTaskEdit={onTaskEdit}
                    onTaskDelete={onTaskDelete}
                    onTaskStatusChange={onTaskStatusChange}
                    onTaskAssignmentChange={onTaskAssignmentChange}
                    onCreateTask={onCreateTask}
                    isLoading={isLoading}
                    searchQuery={filters.search || ''}
                    workspaceMembers={workspaceMembers}
                />
            ) : (
                <>
                    {/* Tasks grid with grouping */}
                    {sortedTasks.length === 0 ? (
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
                            {hasActiveFilters && tasks.length > 0 && (
                                <Button variant="outline" onClick={() => {
                                    setFilters({
                                        search: '',
                                        status: 'all',
                                        priority: 'all',
                                        assignment: 'all',
                                        tags: [],
                                        categories: [],
                                    });
                                    clearQuickFilter();
                                }}>
                                    Clear All Filters
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {groupedTasks.map((group) => (
                                <div key={group.name} className="space-y-4">
                                    {groupBy !== 'none' && (
                                        <div className={`p-4 rounded-lg border-2 border-dashed ${group.color}`}>
                                            <div className="flex items-center gap-2">
                                                {groupBy === 'tag' && <Tag className="h-5 w-5 text-blue-600" />}
                                                {groupBy === 'category' && <FolderOpen className="h-5 w-5 text-indigo-600" />}
                                                <h3 className="font-semibold text-lg text-gray-800">
                                                    {group.name}
                                                </h3>
                                                <Badge variant="outline" className="ml-auto">
                                                    {group.tasks.length} tasks
                                                </Badge>
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {group.tasks.map((task) => (
                                            <TaskCard
                                                key={task.taskId}
                                                task={task}
                                                onClick={onTaskClick}
                                                onEdit={onTaskEdit}
                                                onDelete={onTaskDelete}
                                                onStatusChange={onTaskStatusChange}
                                                onAssignmentChange={onTaskAssignmentChange}
                                                workspaceMembers={workspaceMembers}
                                                onTagClick={handleTagClick}
                                                onCategoryClick={handleCategoryClick}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default TaskList;