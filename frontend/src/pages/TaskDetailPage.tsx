import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, User, Tag, Folder, Clock, AlertCircle, Repeat } from 'lucide-react';
import { useTask, useUpdateTask, useAssignTask, useUnassignTask } from '../hooks/useTasks';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import TaskStatusSelector from '../components/tasks/TaskStatusSelector';
import TaskAssignmentSelector from '../components/tasks/TaskAssignmentSelector';
import { CommentSection, AttachmentManager, RecurringTaskForm } from '../components/tasks';
import { TaskPriority, TaskStatus } from '../types';
import { useCreateRecurringTask, useUpdateRecurringTask } from '../hooks/useRecurringTasks';

function TaskDetailPage() {
  const { workspaceId, projectId, taskId } = useParams();
  const navigate = useNavigate();
  const [showRecurringForm, setShowRecurringForm] = useState(false);

  const { data: task, isLoading, error } = useTask(
    workspaceId || '',
    projectId || '',
    taskId || ''
  );

  const createRecurringMutation = useCreateRecurringTask();
  const updateRecurringMutation = useUpdateRecurringTask();

  const updateTaskMutation = useUpdateTask();
  const assignTaskMutation = useAssignTask();
  const unassignTaskMutation = useUnassignTask();

  const handleBack = () => {
    navigate(`/workspaces/${workspaceId}/projects/${projectId}`);
  };

  const handleStatusChange = async (status: TaskStatus) => {
    if (!task || !workspaceId || !projectId || !taskId) return;

    try {
      await updateTaskMutation.mutateAsync({
        workspaceId,
        projectId,
        taskId,
        data: {
          title: task.title,
          description: task.description,
          priority: task.priority,
          deadline: task.deadline,
          tags: task.tags.map(tag => tag.name),
          categories: task.categories.map(cat => cat.name),
          status
        }
      });
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  };

  const handleAssignmentChange = async (userId: string | null) => {
    if (!workspaceId || !projectId || !taskId) return;

    try {
      if (userId) {
        await assignTaskMutation.mutateAsync({
          workspaceId,
          projectId,
          taskId,
          userId
        });
      } else {
        await unassignTaskMutation.mutateAsync({
          workspaceId,
          projectId,
          taskId
        });
      }
    } catch (error) {
      console.error('Failed to update task assignment:', error);
    }
  };

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleRecurringSubmit = (recurringData: any) => {
    if (!workspaceId || !projectId || !taskId) return;

    createRecurringMutation.mutate(
      { 
        workspaceId, 
        projectId, 
        taskId, 
        data: recurringData 
      },
      {
        onSuccess: () => {
          setShowRecurringForm(false);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Project
          </Button>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Project
          </Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <span>Failed to load task details. Please try again.</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Project
        </Button>
      </div>

      {/* Task Details Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="text-2xl text-left">{task.title}</CardTitle>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={getPriorityColor(task.priority)}>
                  {task.priority}
                </Badge>
                <Badge className={getStatusColor(task.status)}>
                  {task.status.replace('_', ' ')}
                </Badge>

                {task.deadline && (
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>Due: {formatDate(task.deadline)}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <TaskStatusSelector
                currentStatus={task.status}
                onStatusChange={handleStatusChange}
                disabled={updateTaskMutation.isPending}
              />
              <TaskAssignmentSelector
                currentUserId={task.assignedUserId}
                onAssignmentChange={handleAssignmentChange}
                disabled={assignTaskMutation.isPending || unassignTaskMutation.isPending}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowRecurringForm(true)}
                className="flex items-center gap-1"
              >
                <Repeat className="h-4 w-4" />
                Make Recurring
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Description */}
          <div>
            <h3 className="font-semibold mb-2 text-left">Description</h3>
            <p className="text-gray-700 whitespace-pre-wrap text-left">{task.description}</p>
          </div>



          {/* Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span>Created: {formatDate(task.createdAt)}</span>
            </div>
            {task.lastModifiedAt && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>Modified: {formatDate(task.lastModifiedAt)}</span>
              </div>
            )}
            {task.assignedUserId && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span>Assigned to: {task.assignedUserId}</span>
              </div>
            )}
          </div>

          {/* Tags and Categories */}
          {(task.tags.length > 0 || task.categories.length > 0) && (
            <div className="space-y-3 pt-4 border-t">
              {task.tags.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Tag className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-600">Tags</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {task.tags.map((tag) => (
                      <Badge key={tag.id} variant="outline">
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {task.categories.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Folder className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-600">Categories</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {task.categories.map((category) => (
                      <Badge key={category.id} variant="outline">
                        {category.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Attachments Section */}
      <AttachmentManager
        workspaceId={workspaceId || ''}
        projectId={projectId || ''}
        taskId={task.taskId}
      />

      {/* Comments Section */}
      <CommentSection
        workspaceId={workspaceId || ''}
        projectId={projectId || ''}
        taskId={task.taskId}
      />

      {/* Recurring Task Form */}
      <RecurringTaskForm
        isOpen={showRecurringForm}
        onClose={() => setShowRecurringForm(false)}
        onSubmit={handleRecurringSubmit}
        isLoading={createRecurringMutation.isPending || updateRecurringMutation.isPending}
      />
    </div>
  );
}

export default TaskDetailPage;