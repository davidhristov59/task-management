import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { TaskStatus } from '../../types';
import type { NormalizedTask } from '../../utils/taskUtils';
import TaskBoardCard from './TaskBoardCard';

interface TaskBoardColumnProps {
  id: TaskStatus;
  title: string;
  color: string;
  tasks: NormalizedTask[];
  onTaskClick?: (task: NormalizedTask) => void;
  onTaskEdit?: (task: NormalizedTask) => void;
  onTaskDelete?: (taskId: string) => void;
  onTaskAssignmentChange?: (taskId: string, userId: string | null) => void;
  workspaceMembers?: string[];
}

function TaskBoardColumn({
  id,
  title,
  color,
  tasks,
  onTaskClick,
  onTaskEdit,
  onTaskDelete,
  onTaskAssignmentChange,
  workspaceMembers = [],
}: TaskBoardColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  return (
    <div className="flex flex-col h-full">
      {/* Column Header */}
      <div className={`${color} rounded-t-lg p-4 border-b border-gray-200`}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-800">{title}</h3>
          <span className="bg-white text-gray-600 text-sm px-2 py-1 rounded-full">
            {tasks.length}
          </span>
        </div>
      </div>

      {/* Column Content */}
      <div
        ref={setNodeRef}
        className={`flex-1 p-4 bg-gray-50 rounded-b-lg min-h-[400px] transition-all duration-200 ${
          isOver ? 'bg-blue-50 border-2 border-dashed border-blue-300 shadow-inner' : 'border-2 border-transparent'
        }`}
      >
        <SortableContext items={tasks.map(task => task.taskId)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {tasks.map((task) => (
              <TaskBoardCard
                key={task.taskId}
                task={task}
                onClick={onTaskClick}
                onEdit={onTaskEdit}
                onDelete={onTaskDelete}
                onAssignmentChange={onTaskAssignmentChange}
                workspaceMembers={workspaceMembers}
              />
            ))}
            {tasks.length === 0 && (
              <div className="text-center text-gray-400 py-8">
                <p className="text-sm">No {title.toLowerCase()} tasks</p>
              </div>
            )}
          </div>
        </SortableContext>
      </div>
    </div>
  );
}

export default TaskBoardColumn;