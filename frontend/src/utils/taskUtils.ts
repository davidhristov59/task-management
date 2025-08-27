import type { Task, Attachment, Comment } from '../types';


export interface Category {
  id: string;
  name: string;
}

export interface Tag {
  id: string;
  name: string;
}


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


function parseJsonString<T>(jsonString: string, fallback: T): T {
  try {
    return JSON.parse(jsonString) || fallback;
  } catch {
    return fallback;
  }
}


export function normalizeTask(backendTask: Task): NormalizedTask {
  const comments = parseJsonString<Comment[]>(backendTask.comments, []);
  
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
    
    comments: comments.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ),
    deleted: backendTask.deleted,
  };
}


export function normalizeTasks(backendTasks: Task[]): NormalizedTask[] {
  return backendTasks.map(normalizeTask);
}