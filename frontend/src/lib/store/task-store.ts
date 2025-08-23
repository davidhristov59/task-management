import { create } from 'zustand';
import { api } from '../api/client';

// Task types based on the backend model
export interface TaskView {
  taskId: string;
  title: string;
  description: string;
  workspaceId: string;
  projectId: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  assignedUserId: string | null;
  deadline: string | null;
  createdAt: string;
  lastModifiedAt: string;
  comments: string; // JSON string of comments
  attachments: string; // JSON string of attachments
  tags: string; // JSON string of tags
  categories: string; // JSON string of categories
}

// Parsed comment as JS object
export interface TaskComment {
  commentId: string;
  authorId: string;
  content: string;
  timestamp: string;
}

// Parsed attachment as JS object
export interface TaskAttachment {
  fileId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
}

// Parsed tag as JS object
export interface TaskTag {
  id: string;
  name: string;
}

// Parsed category as JS object
export interface TaskCategory {
  id: string;
  name: string;
}

interface TaskState {
  tasks: TaskView[];
  isLoading: boolean;
  error: string | null;
  fetchTasks: (workspaceId: string, projectId: string, filters?: { status?: string; priority?: string; assignedUserId?: string; }) => Promise<void>;
  fetchTask: (workspaceId: string, projectId: string, taskId: string) => Promise<TaskView | null>;
  createTask: (workspaceId: string, projectId: string, data: {
    title: string;
    description?: string;
    priority?: 'LOW' | 'MEDIUM' | 'HIGH';
    deadline?: string;
    tags?: string[];
    categories?: string[];
    recurrence?: {
      type: 'DAILY' | 'WEEKLY' | 'MONTHLY';
      interval: number;
      endDate?: string;
    };
  }) => Promise<void>;
  updateTask: (workspaceId: string, projectId: string, taskId: string, data: {
    title?: string;
    description?: string;
    status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
    priority?: 'LOW' | 'MEDIUM' | 'HIGH';
    deadline?: string;
  }) => Promise<void>;
  assignTask: (workspaceId: string, projectId: string, taskId: string, userId: string) => Promise<void>;
  unassignTask: (workspaceId: string, projectId: string, taskId: string) => Promise<void>;
  completeTask: (workspaceId: string, projectId: string, taskId: string) => Promise<void>;
  deleteTask: (workspaceId: string, projectId: string, taskId: string) => Promise<void>;
  addComment: (workspaceId: string, projectId: string, taskId: string, authorId: string, content: string) => Promise<void>;
  updateComment: (workspaceId: string, projectId: string, taskId: string, commentId: string, content: string, authorId?: string) => Promise<void>;
  deleteComment: (workspaceId: string, projectId: string, taskId: string, commentId: string) => Promise<void>;
  addAttachment: (workspaceId: string, projectId: string, taskId: string, fileName: string, fileType: string, fileSize: number) => Promise<void>;
  deleteAttachment: (workspaceId: string, projectId: string, taskId: string, fileId: string) => Promise<void>;
  setupRecurringTask: (workspaceId: string, projectId: string, taskId: string, type: 'DAILY' | 'WEEKLY' | 'MONTHLY', interval: number, endDate?: string) => Promise<void>;
  // Helper methods
  parseTaskComments: (task: TaskView) => TaskComment[];
  parseTaskAttachments: (task: TaskView) => TaskAttachment[];
  parseTaskTags: (task: TaskView) => TaskTag[];
  parseTaskCategories: (task: TaskView) => TaskCategory[];
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  isLoading: false,
  error: null,
  
  fetchTasks: async (workspaceId: string, projectId: string, filters) => {
    try {
      set({ isLoading: true, error: null });
      const tasks = await api.getTasks(workspaceId, projectId, filters);
      if (Array.isArray(tasks)) {
        set({ tasks });
      } else {
        console.warn("API returned invalid tasks data", tasks);
        set({ tasks: [] });
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
      set({ error: error instanceof Error ? error.message : "Failed to fetch tasks" });
    } finally {
      set({ isLoading: false });
    }
  },
  
  fetchTask: async (workspaceId: string, projectId: string, taskId: string) => {
    try {
      set({ isLoading: true, error: null });
      const task = await api.getTask(workspaceId, projectId, taskId);
      return task;
    } catch (error) {
      console.error(`Error fetching task ${taskId}:`, error);
      set({ error: error instanceof Error ? error.message : `Failed to fetch task ${taskId}` });
      return null;
    } finally {
      set({ isLoading: false });
    }
  },
  
  createTask: async (workspaceId: string, projectId: string, data) => {
    try {
      set({ isLoading: true, error: null });
      await api.createTask(workspaceId, projectId, {
        title: data.title,
        description: data.description,
        priority: data.priority,
        deadlineDate: data.deadline,
        tags: data.tags,
        categories: data.categories,
        recurrence: data.recurrence
      });
      
      // Refresh tasks for this project
      await get().fetchTasks(workspaceId, projectId);
    } catch (error) {
      console.error("Error creating task:", error);
      set({ error: error instanceof Error ? error.message : "Failed to create task" });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
  
  updateTask: async (workspaceId: string, projectId: string, taskId: string, data) => {
    try {
      set({ isLoading: true, error: null });
      await api.updateTask(workspaceId, projectId, taskId, {
        title: data.title,
        description: data.description,
        status: data.status,
        priority: data.priority,
        deadline: data.deadline
      });
      
      // Update the task in the local state if it exists
      set(state => ({
        tasks: state.tasks.map(task => 
          task.taskId === taskId 
            ? { ...task, ...data, lastModifiedAt: new Date().toISOString() }
            : task
        )
      }));
    } catch (error) {
      console.error(`Error updating task ${taskId}:`, error);
      set({ error: error instanceof Error ? error.message : `Failed to update task ${taskId}` });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
  
  assignTask: async (workspaceId: string, projectId: string, taskId: string, userId: string) => {
    try {
      set({ isLoading: true, error: null });
      await api.assignTask(workspaceId, projectId, taskId, userId);
      
      // Update task in local state
      set(state => ({
        tasks: state.tasks.map(task => 
          task.taskId === taskId 
            ? { ...task, assignedUserId: userId, lastModifiedAt: new Date().toISOString() }
            : task
        )
      }));
    } catch (error) {
      console.error(`Error assigning task ${taskId}:`, error);
      set({ error: error instanceof Error ? error.message : `Failed to assign task ${taskId}` });
    } finally {
      set({ isLoading: false });
    }
  },
  
  unassignTask: async (workspaceId: string, projectId: string, taskId: string) => {
    try {
      set({ isLoading: true, error: null });
      await api.unassignTask(workspaceId, projectId, taskId);
      
      // Update task in local state
      set(state => ({
        tasks: state.tasks.map(task => 
          task.taskId === taskId 
            ? { ...task, assignedUserId: null, lastModifiedAt: new Date().toISOString() }
            : task
        )
      }));
    } catch (error) {
      console.error(`Error unassigning task ${taskId}:`, error);
      set({ error: error instanceof Error ? error.message : `Failed to unassign task ${taskId}` });
    } finally {
      set({ isLoading: false });
    }
  },
  
  completeTask: async (workspaceId: string, projectId: string, taskId: string) => {
    try {
      set({ isLoading: true, error: null });
      await api.completeTask(workspaceId, projectId, taskId);
      
      // Update task in local state
      set(state => ({
        tasks: state.tasks.map(task => 
          task.taskId === taskId 
            ? { ...task, status: 'COMPLETED', lastModifiedAt: new Date().toISOString() }
            : task
        )
      }));
    } catch (error) {
      console.error(`Error completing task ${taskId}:`, error);
      set({ error: error instanceof Error ? error.message : `Failed to complete task ${taskId}` });
    } finally {
      set({ isLoading: false });
    }
  },
  
  deleteTask: async (workspaceId: string, projectId: string, taskId: string) => {
    try {
      set({ isLoading: true, error: null });
      await api.deleteTask(workspaceId, projectId, taskId);
      
      // Remove task from local state
      set(state => ({
        tasks: state.tasks.filter(task => task.taskId !== taskId)
      }));
    } catch (error) {
      console.error(`Error deleting task ${taskId}:`, error);
      set({ error: error instanceof Error ? error.message : `Failed to delete task ${taskId}` });
    } finally {
      set({ isLoading: false });
    }
  },
  
  addComment: async (workspaceId: string, projectId: string, taskId: string, authorId: string, content: string) => {
    try {
      set({ isLoading: true, error: null });
      await api.addComment(workspaceId, projectId, taskId, { authorId, content });
      
      // Refresh the task to get the updated comments
      const task = await get().fetchTask(workspaceId, projectId, taskId);
      if (task) {
        set(state => ({
          tasks: state.tasks.map(t => t.taskId === taskId ? task : t)
        }));
      }
    } catch (error) {
      console.error(`Error adding comment to task ${taskId}:`, error);
      set({ error: error instanceof Error ? error.message : `Failed to add comment to task ${taskId}` });
    } finally {
      set({ isLoading: false });
    }
  },
  
  updateComment: async (workspaceId: string, projectId: string, taskId: string, commentId: string, content: string, authorId?: string) => {
    try {
      set({ isLoading: true, error: null });
      await api.updateComment(workspaceId, projectId, taskId, commentId, { 
        content, 
        authorId: authorId || "" // The backend API might require the authorId
      });
      
      // Refresh the task to get the updated comments
      const task = await get().fetchTask(workspaceId, projectId, taskId);
      if (task) {
        set(state => ({
          tasks: state.tasks.map(t => t.taskId === taskId ? task : t)
        }));
      }
    } catch (error) {
      console.error(`Error updating comment ${commentId} in task ${taskId}:`, error);
      set({ error: error instanceof Error ? error.message : `Failed to update comment in task ${taskId}` });
    } finally {
      set({ isLoading: false });
    }
  },
  
  deleteComment: async (workspaceId: string, projectId: string, taskId: string, commentId: string) => {
    try {
      set({ isLoading: true, error: null });
      await api.deleteComment(workspaceId, projectId, taskId, commentId);
      
      // Refresh the task to get the updated comments
      const task = await get().fetchTask(workspaceId, projectId, taskId);
      if (task) {
        set(state => ({
          tasks: state.tasks.map(t => t.taskId === taskId ? task : t)
        }));
      }
    } catch (error) {
      console.error(`Error deleting comment ${commentId} from task ${taskId}:`, error);
      set({ error: error instanceof Error ? error.message : `Failed to delete comment from task ${taskId}` });
    } finally {
      set({ isLoading: false });
    }
  },
  
  addAttachment: async (workspaceId: string, projectId: string, taskId: string, fileName: string, fileType: string, fileSize: number) => {
    try {
      set({ isLoading: true, error: null });
      await api.attachFile(workspaceId, projectId, taskId, { fileName, fileType, fileSize });
      
      // Refresh the task to get the updated attachments
      const task = await get().fetchTask(workspaceId, projectId, taskId);
      if (task) {
        set(state => ({
          tasks: state.tasks.map(t => t.taskId === taskId ? task : t)
        }));
      }
    } catch (error) {
      console.error(`Error adding attachment to task ${taskId}:`, error);
      set({ error: error instanceof Error ? error.message : `Failed to add attachment to task ${taskId}` });
    } finally {
      set({ isLoading: false });
    }
  },
  
  deleteAttachment: async (workspaceId: string, projectId: string, taskId: string, fileId: string) => {
    try {
      set({ isLoading: true, error: null });
      await api.removeFile(workspaceId, projectId, taskId, fileId);
      
      // Refresh the task to get the updated attachments
      const task = await get().fetchTask(workspaceId, projectId, taskId);
      if (task) {
        set(state => ({
          tasks: state.tasks.map(t => t.taskId === taskId ? task : t)
        }));
      }
    } catch (error) {
      console.error(`Error deleting attachment ${fileId} from task ${taskId}:`, error);
      set({ error: error instanceof Error ? error.message : `Failed to delete attachment from task ${taskId}` });
    } finally {
      set({ isLoading: false });
    }
  },
  
  setupRecurringTask: async (workspaceId: string, projectId: string, taskId: string, type, interval, endDate) => {
    try {
      set({ isLoading: true, error: null });
      await api.setupRecurringTask(workspaceId, projectId, taskId, {
        type,
        interval,
        endDate
      });
      
      // Refresh the task
      const task = await get().fetchTask(workspaceId, projectId, taskId);
      if (task) {
        set(state => ({
          tasks: state.tasks.map(t => t.taskId === taskId ? task : t)
        }));
      }
    } catch (error) {
      console.error(`Error setting up recurring task ${taskId}:`, error);
      set({ error: error instanceof Error ? error.message : `Failed to set up recurring task ${taskId}` });
    } finally {
      set({ isLoading: false });
    }
  },
  
  // Helper methods to parse JSON strings
  parseTaskComments: (task: TaskView): TaskComment[] => {
    try {
      if (!task.comments || task.comments === "[]") return [];
      return JSON.parse(task.comments);
    } catch (error) {
      console.error(`Error parsing comments for task ${task.taskId}:`, error);
      return [];
    }
  },
  
  parseTaskAttachments: (task: TaskView): TaskAttachment[] => {
    try {
      if (!task.attachments || task.attachments === "[]") return [];
      return JSON.parse(task.attachments);
    } catch (error) {
      console.error(`Error parsing attachments for task ${task.taskId}:`, error);
      return [];
    }
  },
  
  parseTaskTags: (task: TaskView): TaskTag[] => {
    try {
      if (!task.tags || task.tags === "[]") return [];
      return JSON.parse(task.tags);
    } catch (error) {
      console.error(`Error parsing tags for task ${task.taskId}:`, error);
      return [];
    }
  },
  
  parseTaskCategories: (task: TaskView): TaskCategory[] => {
    try {
      if (!task.categories || task.categories === "[]") return [];
      return JSON.parse(task.categories);
    } catch (error) {
      console.error(`Error parsing categories for task ${task.taskId}:`, error);
      return [];
    }
  }
}));