// Enum types
export enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

export enum ProjectStatus {
  PLANNING = 'PLANNING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum UserRole {
  EMPLOYEE = 'EMPLOYEE',
  STUDENT = 'STUDENT'
}

export enum RecurrenceType {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY'
}

// Core entity interfaces
export interface User {
  userId: string;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
  createdAt: string;
  lastModifiedAt?: string;
  deleted: boolean;
}

export interface Comment {
  commentId: string;
  authorId: string;
  content: string;
  taskId: string;
  timestamp: string;
}

export interface Attachment {
  fileId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  taskId: string;
}

export interface RecurrenceRule {
  type: RecurrenceType;
  interval: number;
  endDate?: string; // LocalDateTime as ISO string
}

export interface Workspace {
  workspaceId: string;
  title: string;
  description?: string;
  ownerId: string;
  memberIds: string[];
  createdAt: string;
  lastModifiedAt?: string;
  archived: boolean;
  deleted: boolean;
}

export interface Project {
  projectId: {
    value: string;
  };
  title: string;
  description?: string;
  workspaceId: string;
  ownerId: string;
  status: ProjectStatus;
  createdAt: string;
  lastModifiedAt?: string;
  archived: boolean;
  deleted: boolean;
}

export interface Task {
  taskId: {
    value: string;
  };
  title: string;
  description: string;
  workspaceId: string;
  projectId: {
    value: string;
  };
  assignedUserId?: string;
  status: TaskStatus;
  priority: TaskPriority;
  deadline?: string; // LocalDateTime as ISO string
  createdAt: string;
  lastModifiedAt?: string;
  tags: string; // JSON string of Tag[]
  categories: string; // JSON string of Category[]
  attachments: string; // JSON string of Attachment[]
  comments: string; // JSON string of Comment[]
  deleted: boolean;
}

// API Request payload types
export interface CreateWorkspaceRequest {
  title?: string;
  description?: string;
  ownerId?: string;
  memberIds?: string[];
}

export interface UpdateWorkspaceRequest {
  title?: string;
  description?: string;
  ownerId?: string;
  memberIds?: string[];
}

export interface AddWorkspaceMemberRequest {
  userId: string;
}

export interface CreateProjectRequest {
  title: string;
  description?: string;
  ownerId: string;
  status?: ProjectStatus;
}

export interface UpdateProjectRequest {
  title?: string;
  description?: string;
  ownerId?: string;
  status?: ProjectStatus;
}

export interface CreateTaskRequest {
  title: string;
  description: string;
  priority: TaskPriority;
  deadlineDate?: string;
  tags: string[];
  categories: string[];
}

export interface UpdateTaskRequest {
  title: string;
  description: string;
  priority: TaskPriority;
  deadline?: string;
  tags: string[];
  categories: string[];
  status: TaskStatus;
}

export interface AssignTaskRequest {
  userId: string;
}

export interface CreateCommentRequest {
  authorId: string;
  content: string;
}

export interface UpdateCommentRequest {
  content: string;
}

export interface CreateAttachmentRequest {
  fileName: string;
  fileType: string;
  fileSize: number;
}

export interface CreateRecurringTaskRequest {
  type: RecurrenceType;
  interval: number;
  endDate?: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// Common response types for lists
export type WorkspacesResponse = ApiResponse<Workspace[]>;
export type WorkspaceResponse = ApiResponse<Workspace>;
export type ProjectsResponse = ApiResponse<Project[]>;
export type ProjectResponse = ApiResponse<Project>;
export type TasksResponse = ApiResponse<Task[]>;
export type TaskResponse = ApiResponse<Task>;
export type CommentsResponse = ApiResponse<Comment[]>;
export type CommentResponse = ApiResponse<Comment>;
export type AttachmentsResponse = ApiResponse<Attachment[]>;
export type AttachmentResponse = ApiResponse<Attachment>;
export type RecurrenceRuleResponse = ApiResponse<RecurrenceRule>;
export type UsersResponse = ApiResponse<User[]>;
export type UserResponse = ApiResponse<User>;