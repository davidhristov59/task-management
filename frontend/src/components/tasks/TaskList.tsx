import { useState, useMemo } from 'react';
import { Plus, Grid, Kanban } from 'lucide-react';
import { Button } from '../ui/button';
import { AdvancedFilters, type FilterOptions, type SortOptions } from '../ui/advanced-filters';
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
  
  const { taskViewMode, setTaskViewMode } = useUIStore();

  
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

  const filteredAndSortedTasks = useMemo(() => {
    let filtered = tasks.filter((task) => {
      
      const matchesSearch = !filters.search || 
        task.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        task.description.toLowerCase().includes(filters.search.toLowerCase()) ||
        task.tags.some(tag => tag.name.toLowerCase().includes(filters?.search!.toLowerCase())) ||
        task.categories.some(cat => cat.name.toLowerCase().includes(filters?.search!.toLowerCase()));

      
      const matchesStatus = filters.status === 'all' || task.status === filters.status;

      
      const matchesPriority = filters.priority === 'all' || task.priority === filters.priority;

      
      const matchesAssignment = filters.assignment === 'all' ||
        (filters.assignment === 'assigned' && task.assignedUserId) ||
        (filters.assignment === 'unassigned' && !task.assignedUserId);

      
      const matchesTags = !filters.tags || filters.tags.length === 0 ||
        filters.tags.every(filterTag => task.tags.some(taskTag => taskTag.name === filterTag));

      
      const matchesCategories = !filters.categories || filters.categories.length === 0 ||
        filters.categories.every(filterCategory => task.categories.some(taskCategory => taskCategory.name === filterCategory));

      
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

      return matchesSearch && matchesStatus && matchesPriority && matchesAssignment && 
             matchesTags && matchesCategories && matchesDateRange;
    });

    
    filtered.sort((a, b) => {
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

    return filtered;
  }, [tasks, filters, sortOptions]);

  const hasActiveFilters = 
    filters.search ||
    (filters.status && filters.status !== 'all') ||
    (filters.priority && filters.priority !== 'all') ||
    (filters.assignment && filters.assignment !== 'all') ||
    (filters.tags && filters.tags.length > 0) ||
    (filters.categories && filters.categories.length > 0) ||
    filters.dateRange;

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
      {/* Header with filters and actions on same line */}
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

      {/* Render based on view mode */}
      {taskViewMode === 'board' ? (
        <>
          {/* Results count for board view */}
          <div className="text-sm text-gray-600">
            Showing {filteredAndSortedTasks.length} of {tasks.length} tasks
          </div>
          <TaskBoard
            tasks={filteredAndSortedTasks}
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
        </>
      ) : (
        <>
          {/* Results count */}
          <div className="text-sm text-gray-600">
            Showing {filteredAndSortedTasks.length} of {tasks.length} tasks
          </div>

          {/* Tasks grid */}
          {filteredAndSortedTasks.length === 0 ? (
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
                <Button variant="outline" onClick={() => setFilters({
                  search: '',
                  status: 'all',
                  priority: 'all',
                  assignment: 'all',
                  tags: [],
                  categories: [],
                })}>
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAndSortedTasks.map((task) => (
                <TaskCard
                  key={task.taskId}
                  task={task}
                  onClick={onTaskClick}
                  onEdit={onTaskEdit}
                  onDelete={onTaskDelete}
                  onStatusChange={onTaskStatusChange}
                  onAssignmentChange={onTaskAssignmentChange}
                  workspaceMembers={workspaceMembers}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default TaskList;