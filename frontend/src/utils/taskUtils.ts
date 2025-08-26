import type { Task, Attachment, Comment } from '../types';

// Additional interfaces for normalized data
export interface Category {
  id: string;
  name: string;
}

export interface Tag {
  id: string;
  name: string;
}

// Normalized task interface for UI components
export interface NormalizedTask {
  taskId: string;
  title: string;
  description: string;
  workspaceId: string;
  projectId: string;
  assignedUserId?: string;
  status: Task['status'];
  priority: Task['priority'];
  deadline?: string;
  createdAt: string;
  lastModifiedAt?: string;
  tags: Tag[];
  categories: Category[];
  attachments: Attachment[];
  comments: Comment[];
  deleted: boolean;
}

// Parse JSON string safely
function parseJsonString<T>(jsonString: string, fallback: T): T {
  try {
    return JSON.parse(jsonString) || fallback;
  } catch {
    return fallback;
  }
}

// Convert backend Task to normalized Task for UI
export function normalizeTask(backendTask: Task): NormalizedTask {
  return {
    taskId: backendTask.taskId.value,
    title: backendTask.title,
    description: backendTask.description,
    workspaceId: backendTask.workspaceId,
    projectId: backendTask.projectId.value,
    assignedUserId: backendTask.assignedUserId,
    status: backendTask.status,
    priority: backendTask.priority,
    deadline: backendTask.deadline,
    createdAt: backendTask.createdAt,
    lastModifiedAt: backendTask.lastModifiedAt,
    tags: parseJsonString<Tag[]>(backendTask.tags, []),
    categories: parseJsonString<Category[]>(backendTask.categories, []),
    attachments: parseJsonString<Attachment[]>(backendTask.attachments, []),
    comments: parseJsonString<Comment[]>(backendTask.comments, []),
    deleted: backendTask.deleted,
  };
}

// Convert array of backend tasks to normalized tasks
export function normalizeTasks(backendTasks: Task[]): NormalizedTask[] {
  return backendTasks.map(normalizeTask);
}