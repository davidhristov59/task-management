import { useState, useMemo } from 'react';
import { Search, SortAsc, Plus, Grid, List } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { TaskStatus, TaskPriority } from '../../types';
import type { NormalizedTask } from '../../utils/taskUtils';
import TaskCard from './TaskCard';

interface TaskListProps {
  tasks: NormalizedTask[];
  onTaskClick?: (task: NormalizedTask) => void;
  onTaskEdit?: (task: NormalizedTask) => void;
  onTaskDelete?: (taskId: string) => void;
  onTaskStatusChange?: (taskId: string, status: TaskStatus) => void;
  onTaskAssignmentChange?: (taskId: string, userId: string | null) => void;
  onCreateTask?: () => void;
  isLoading?: boolean;
}

type SortOption = 'title' | 'priority' | 'status' | 'deadline' | 'created';
type SortDirection = 'asc' | 'desc';
type ViewMode = 'grid' | 'list';

function TaskList({
  tasks,
  onTaskClick,
  onTaskEdit,
  onTaskDelete,
  onTaskStatusChange,
  onTaskAssignmentChange,
  onCreateTask,
  isLoading = false,
}: TaskListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all');
  const [assignmentFilter, setAssignmentFilter] = useState<'assigned' | 'unassigned' | 'all'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('created');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const filteredAndSortedTasks = useMemo(() => {
    let filtered = tasks.filter((task) => {
      // Search filter
      const matchesSearch = searchQuery === '' || 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.tags.some(tag => tag.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        task.categories.some(cat => cat.name.toLowerCase().includes(searchQuery.toLowerCase()));

      // Status filter
      const matchesStatus = statusFilter === 'all' || task.status === statusFilter;

      // Priority filter
      const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;

      // Assignment filter
      const matchesAssignment = assignmentFilter === 'all' ||
        (assignmentFilter === 'assigned' && task.assignedUserId) ||
        (assignmentFilter === 'unassigned' && !task.assignedUserId);

      return matchesSearch && matchesStatus && matchesPriority && matchesAssignment;
    });

    // Sort tasks
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
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

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [tasks, searchQuery, statusFilter, priorityFilter, assignmentFilter, sortBy, sortDirection]);

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setAssignmentFilter('all');
    setSortBy('created');
    setSortDirection('desc');
  };

  const hasActiveFilters = searchQuery !== '' || statusFilter !== 'all' || 
    priorityFilter !== 'all' || assignmentFilter !== 'all';

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
      {/* Header with search and actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="flex items-center bg-white border border-gray-300 rounded-md shadow-sm">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className={`rounded-r-none ${
                viewMode === 'grid' 
                  ? 'bg-black text-white hover:bg-gray-700' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Grid className="h-4 w-4 mr-1" />
              Grid
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className={`rounded-l-none border-l ${
                viewMode === 'list' 
                  ? 'bg-black text-white hover:bg-gray-700' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <List className="h-4 w-4 mr-1" />
              List
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

      {/* Filters and sorting */}
      <div className="flex flex-wrap gap-4 items-center">
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as TaskStatus | 'all')}>
          <SelectTrigger className="w-40 bg-white border-gray-300 shadow-sm">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value={TaskStatus.PENDING}>Pending</SelectItem>
            <SelectItem value={TaskStatus.IN_PROGRESS}>In Progress</SelectItem>
            <SelectItem value={TaskStatus.COMPLETED}>Completed</SelectItem>
            <SelectItem value={TaskStatus.CANCELLED}>Cancelled</SelectItem>
          </SelectContent>
        </Select>

        <Select value={priorityFilter} onValueChange={(value) => setPriorityFilter(value as TaskPriority | 'all')}>
          <SelectTrigger className="w-40 bg-white border-gray-300 shadow-sm">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value={TaskPriority.HIGH}>High</SelectItem>
            <SelectItem value={TaskPriority.MEDIUM}>Medium</SelectItem>
            <SelectItem value={TaskPriority.LOW}>Low</SelectItem>
          </SelectContent>
        </Select>

        <Select value={assignmentFilter} onValueChange={(value) => setAssignmentFilter(value as 'assigned' | 'unassigned' | 'all')}>
          <SelectTrigger className="w-40 bg-white border-gray-300 shadow-sm">
            <SelectValue placeholder="Assignment" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="all">All Tasks</SelectItem>
            <SelectItem value="assigned">Assigned</SelectItem>
            <SelectItem value="unassigned">Unassigned</SelectItem>
          </SelectContent>
        </Select>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="bg-white border-gray-300 shadow-sm">
              <SortAsc className="h-4 w-4 mr-2" />
              Sort by {sortBy}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-white">
            <DropdownMenuItem onClick={() => setSortBy('title')}>
              Title
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy('priority')}>
              Priority
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy('status')}>
              Status
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy('deadline')}>
              Deadline
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy('created')}>
              Created Date
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
          className="bg-white border-gray-300 shadow-sm"
        >
          {sortDirection === 'asc' ? '↑' : '↓'}
        </Button>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear Filters
          </Button>
        )}
      </div>

      {/* Results count */}
      <div className="text-sm text-gray-600">
        Showing {filteredAndSortedTasks.length} of {tasks.length} tasks
      </div>

      {/* Tasks grid/list */}
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
        </div>
      ) : (
        <div className={
          viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
            : 'space-y-4'
        }>
          {filteredAndSortedTasks.map((task) => (
            <TaskCard
              key={task.taskId}
              task={task}
              onClick={onTaskClick}
              onEdit={onTaskEdit}
              onDelete={onTaskDelete}
              onStatusChange={onTaskStatusChange}
              onAssignmentChange={onTaskAssignmentChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default TaskList;