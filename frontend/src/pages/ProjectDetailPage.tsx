import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Archive, ArchiveRestore } from 'lucide-react';
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
import { useProject, useUpdateProject, useDeleteProject, useArchiveProject } from '../hooks/useProjects';
import { TaskStatus } from '../types';
import type { CreateTaskRequest, UpdateTaskRequest } from '../types';
import type { NormalizedTask } from '../utils/taskUtils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';
import ProjectForm from '../components/projects/ProjectForm';

function ProjectDetailPage() {
  const { workspaceId, projectId } = useParams();
  const navigate = useNavigate();
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<NormalizedTask | undefined>();
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<NormalizedTask | undefined>();
  const [showEditProjectDialog, setShowEditProjectDialog] = useState(false);
  const [showDeleteProjectDialog, setShowDeleteProjectDialog] = useState(false);

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

  // Project mutations
  const updateProjectMutation = useUpdateProject();
  const deleteProjectMutation = useDeleteProject();
  const archiveProjectMutation = useArchiveProject();

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
            // Close modal and reset state after successful update
            setIsTaskFormOpen(false);
            setEditingTask(undefined);
          },
          onError: (error) => {
            console.error('Failed to update task:', error);
            // Keep modal open on error so user can retry
          }
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
            // Close modal after successful creation
            setIsTaskFormOpen(false);
            
            // If there's pending recurrence, apply it to the newly created task
            if (pendingRecurrence && response?.taskId) {
              createRecurringMutation.mutate({
                taskId: response.taskId,
                data: pendingRecurrence
              }, {
                onError: (recurringError) => {
                  console.error('Failed to create recurring rule:', recurringError);
                  // Don't prevent modal from closing if recurring creation fails
                }
              });
            }
          },
          onError: (error) => {
            console.error('Failed to create task:', error);
            // Keep modal open on error so user can retry
          }
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
        },
        onError: (error) => {
          console.error('Failed to delete task:', error);
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
      }, {
        onError: (error) => {
          console.error('Failed to complete task:', error);
        }
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
        }, {
          onError: (error) => {
            console.error('Failed to update task status:', error);
          }
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
      }, {
        onError: (error) => {
          console.error('Failed to assign task:', error);
        }
      });
    } else {
      unassignTaskMutation.mutate({
        workspaceId: workspaceId!,
        projectId: projectId!,
        taskId
      }, {
        onError: (error) => {
          console.error('Failed to unassign task:', error);
        }
      });
    }
  };

  const handleTaskClick = (task: NormalizedTask) => {
    navigate(`/workspaces/${workspaceId}/projects/${projectId}/tasks/${task.taskId}`);
  };

  const handleBackToWorkspace = () => {
    navigate(`/workspaces/${workspaceId}`);
  };

  const handleEditProject = () => {
    setShowEditProjectDialog(true);
  };

  const handleArchiveProject = () => {
    if (project) {
      archiveProjectMutation.mutate({
        workspaceId: workspaceId!,
        projectId: projectId!,
        archived: !project.archived
      }, {
        onError: (error) => {
          console.error('Failed to archive project:', error);
        }
      });
    }
  };

  const handleDeleteProject = () => {
    deleteProjectMutation.mutate({
      workspaceId: workspaceId!,
      projectId: projectId!
    }, {
      onSuccess: () => {
        // Navigate back to workspace after deletion
        navigate(`/workspaces/${workspaceId}`);
      },
      onError: (error) => {
        console.error('Failed to delete project:', error);
        // Keep the dialog open on error so user can retry
      }
    });
  };

  const handleProjectFormSuccess = () => {
    setShowEditProjectDialog(false);
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
          <Button
            variant="outline"
            onClick={handleEditProject}
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit
          </Button>

          <Button
            variant="outline"
            onClick={handleArchiveProject}
            className="flex items-center gap-2"
          >
            {project?.archived ? (
              <>
                <ArchiveRestore className="h-4 w-4" />
                Unarchive
              </>
            ) : (
              <>
                <Archive className="h-4 w-4" />
                Archive
              </>
            )}
          </Button>

          <Button
            variant="outline"
            onClick={() => setShowDeleteProjectDialog(true)}
            className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
            Delete
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

      {/* Edit Project Dialog */}
      <Dialog open={showEditProjectDialog} onOpenChange={setShowEditProjectDialog}>
        <DialogContent className="sm:max-w-[500px] bg-white border border-gray-200">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
          </DialogHeader>
          <ProjectForm
            workspaceId={workspaceId!}
            project={project}
            onSuccess={handleProjectFormSuccess}
            onCancel={() => setShowEditProjectDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Project Confirmation */}
      <AlertDialog open={showDeleteProjectDialog} onOpenChange={setShowDeleteProjectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{project?.title}"? This action cannot be undone and will permanently delete all tasks within this project.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProject}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete Project
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default ProjectDetailPage;