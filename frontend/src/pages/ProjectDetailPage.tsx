import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Settings } from 'lucide-react';
import { Button } from '../components/ui/button';
import { TaskList, TaskForm, TaskDeleteConfirmation } from '../components/tasks';
import { useCreateRecurringTask } from '../hooks/useRecurringTasks';
import {
  useTasks,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
  useCompleteTask,
  useAssignTask,
  useUnassignTask
} from '../hooks/useTasks';
import { useProject } from '../hooks/useProjects';
import { TaskStatus } from '../types';
import type { CreateTaskRequest, UpdateTaskRequest } from '../types';
import type { NormalizedTask } from '../utils/taskUtils';

function ProjectDetailPage() {
  const { workspaceId, projectId } = useParams();
  const navigate = useNavigate();
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<NormalizedTask | undefined>();
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<NormalizedTask | undefined>();

  // Fetch project and tasks data
  const { data: project, isLoading: isProjectLoading } = useProject(workspaceId!, projectId!);
  const { data: tasks = [], isLoading: isTasksLoading } = useTasks(workspaceId!, projectId!);

  // Task mutations
  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();
  const completeTaskMutation = useCompleteTask();
  const assignTaskMutation = useAssignTask();
  const unassignTaskMutation = useUnassignTask();
  const createRecurringMutation = useCreateRecurringTask();

  const handleCreateTask = () => {
    setEditingTask(undefined);
    setIsTaskFormOpen(true);
  };

  const handleEditTask = (task: NormalizedTask) => {
    setEditingTask(task);
    setIsTaskFormOpen(true);
  };



  const handleTaskFormSubmit = (data: CreateTaskRequest | UpdateTaskRequest, pendingRecurrence?: any) => {
    if (editingTask) {
      // Update existing task
      updateTaskMutation.mutate(
        {
          workspaceId: workspaceId!,
          projectId: projectId!,
          taskId: editingTask.taskId,
          data: data as UpdateTaskRequest
        },
        {
          onSuccess: () => {
            setIsTaskFormOpen(false);
            setEditingTask(undefined);
            // Tasks will be automatically revalidated by the mutation
          },
        }
      );
    } else {
      // Create new task
      createTaskMutation.mutate(
        {
          workspaceId: workspaceId!,
          projectId: projectId!,
          data: data as CreateTaskRequest
        },
        {
          onSuccess: (response) => {
            setIsTaskFormOpen(false);
            // If there's pending recurrence, apply it to the newly created task
            if (pendingRecurrence && response?.taskId) {
              createRecurringMutation.mutate({
                taskId: response.taskId,
                data: pendingRecurrence
              });
            }
            // Tasks will be automatically revalidated by the mutation
          },
        }
      );
    }
  };

  const handleDeleteTask = (taskId: string) => {
    const task = tasks.find(t => t.taskId === taskId);
    if (task) {
      setTaskToDelete(task);
      setIsDeleteConfirmOpen(true);
    }
  };

  const handleConfirmDelete = () => {
    if (taskToDelete) {
      deleteTaskMutation.mutate({
        workspaceId: workspaceId!,
        projectId: projectId!,
        taskId: taskToDelete.taskId
      }, {
        onSuccess: () => {
          setIsDeleteConfirmOpen(false);
          setTaskToDelete(undefined);
          // Tasks will be automatically revalidated by the mutation
        },
        onError: () => {
          // Keep the modal open on error so user can retry
        }
      });
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteConfirmOpen(false);
    setTaskToDelete(undefined);
  };

  const handleStatusChange = (taskId: string, status: TaskStatus) => {
    if (status === TaskStatus.COMPLETED) {
      completeTaskMutation.mutate({
        workspaceId: workspaceId!,
        projectId: projectId!,
        taskId
      });
    } else {
      // For other status changes, we need to update the task
      const task = tasks.find(t => t.taskId === taskId);
      if (task) {
        const updateData: UpdateTaskRequest = {
          title: task.title,
          description: task.description,
          priority: task.priority,
          deadline: task.deadline,
          tags: task.tags.map(tag => tag.name),
          categories: task.categories.map(category => category.name),
          status: status,
        };
        updateTaskMutation.mutate({
          workspaceId: workspaceId!,
          projectId: projectId!,
          taskId,
          data: updateData
        });
      }
    }
  };

  const handleAssignmentChange = (taskId: string, userId: string | null) => {
    if (userId) {
      assignTaskMutation.mutate({
        workspaceId: workspaceId!,
        projectId: projectId!,
        taskId,
        userId
      });
    } else {
      unassignTaskMutation.mutate({
        workspaceId: workspaceId!,
        projectId: projectId!,
        taskId
      });
    }
  };

  const handleTaskClick = (task: NormalizedTask) => {
    navigate(`/workspaces/${workspaceId}/projects/${projectId}/tasks/${task.taskId}`);
  };

  const handleBackToWorkspace = () => {
    navigate(`/workspaces/${workspaceId}`);
  };

  if (isProjectLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleBackToWorkspace}
            className="flex items-center gap-2 bg-white hover:bg-gray-50 border-gray-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Workspace
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{project?.title || 'Project'}</h1>
            {project?.description && (
              <p className="text-gray-600 mt-1">{project.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Project Settings
          </Button>
        </div>
      </div>

      {/* Project Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-blue-600">{tasks.length}</div>
          <div className="text-sm text-gray-600">Total Tasks</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-yellow-600">
            {tasks.filter(t => t.status === TaskStatus.PENDING).length}
          </div>
          <div className="text-sm text-gray-600">Pending</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-blue-600">
            {tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length}
          </div>
          <div className="text-sm text-gray-600">In Progress</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-green-600">
            {tasks.filter(t => t.status === TaskStatus.COMPLETED).length}
          </div>
          <div className="text-sm text-gray-600">Completed</div>
        </div>
      </div>

      {/* Tasks List */}
      <TaskList
        tasks={tasks}
        onTaskClick={handleTaskClick}
        onTaskEdit={handleEditTask}
        onTaskDelete={handleDeleteTask}
        onTaskStatusChange={handleStatusChange}
        onTaskAssignmentChange={handleAssignmentChange}
        onCreateTask={handleCreateTask}
        isLoading={isTasksLoading}
      />

      {/* Task Form Modal */}
      <TaskForm
        isOpen={isTaskFormOpen}
        onClose={() => {
          setIsTaskFormOpen(false);
          setEditingTask(undefined);
        }}
        onSubmit={handleTaskFormSubmit}
        task={editingTask}
        isLoading={createTaskMutation.isPending || updateTaskMutation.isPending}
      />

      {/* Task Delete Confirmation Modal */}
      <TaskDeleteConfirmation
        isOpen={isDeleteConfirmOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        task={taskToDelete}
        isLoading={deleteTaskMutation.isPending}
      />
    </div>
  );
}

export default ProjectDetailPage;