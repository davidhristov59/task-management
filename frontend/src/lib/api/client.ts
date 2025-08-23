import { fetchWithAuth } from "./fetch-client";

// Types based on the Kotlin backend models
export interface WorkspaceRequest {
  title: string;
  description?: string;
  ownerId: string;
  memberIds?: string[];
}

export interface ProjectRequest {
  title: string;
  description?: string;
  ownerId: string;
}

export interface TaskRequest {
  title: string;
  description?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  deadlineDate?: string; // ISO string format
  tags?: string[];
  categories?: string[];
  recurrence?: {
    type: 'DAILY' | 'WEEKLY' | 'MONTHLY';
    interval: number;
    endDate?: string; // ISO string format
  };
}

export interface TaskUpdateRequest {
  title?: string;
  description?: string;
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  deadline?: string; // ISO string format
}

export interface CommentRequest {
  authorId: string;
  content: string;
}

export interface AttachmentRequest {
  fileName: string;
  fileType: string;
  fileSize: number;
}

export const api = {
  // Workspace APIs
  async getWorkspaces(filters?: { archived?: boolean, ownerId?: string, memberId?: string }) {
    try {
      const queryParams = new URLSearchParams();
      if (filters?.archived !== undefined) queryParams.append('archived', filters.archived.toString());
      if (filters?.ownerId) queryParams.append('ownerId', filters.ownerId);
      if (filters?.memberId) queryParams.append('memberId', filters.memberId);
      
      const queryString = queryParams.toString();
      const url = `/workspaces${queryString ? `?${queryString}` : ''}`;
      
      return await fetchWithAuth(url);
    } catch (error) {
      console.error("Failed to fetch workspaces:", error);
      throw new Error((error as any).message || "Failed to fetch workspaces");
    }
  },

  async getWorkspace(id: string) {
    try {
      return await fetchWithAuth(`/workspaces/${id}`);
    } catch (error) {
      console.error(`Failed to fetch workspace ${id}:`, error);
      throw new Error((error as any).message || "Failed to fetch workspace");
    }
  },

  async createWorkspace(data: WorkspaceRequest) {
    try {
      return await fetchWithAuth('/workspaces', {
        method: "POST",
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error("Failed to create workspace:", error);
      throw new Error((error as any).message || "Failed to create workspace");
    }
  },

  async updateWorkspace(id: string, data: Partial<WorkspaceRequest>) {
    try {
      return await fetchWithAuth(`/workspaces/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error(`Failed to update workspace ${id}:`, error);
      throw new Error((error as any).message || "Failed to update workspace");
    }
  },

  async deleteWorkspace(id: string) {
    try {
      return await fetchWithAuth(`/workspaces/${id}`, {
        method: "DELETE",
      });
    } catch (error) {
      console.error(`Failed to delete workspace ${id}:`, error);
      throw new Error((error as any).message || "Failed to delete workspace");
    }
  },

  async addMemberToWorkspace(workspaceId: string, memberId: string) {
    try {
      return await fetchWithAuth(`/workspaces/${workspaceId}/members`, {
        method: "POST",
        body: memberId,
      });
    } catch (error) {
      console.error(`Failed to add member to workspace ${workspaceId}:`, error);
      throw new Error((error as any).message || "Failed to add member to workspace");
    }
  },

  async removeMemberFromWorkspace(workspaceId: string, memberId: string) {
    try {
      return await fetchWithAuth(`/workspaces/${workspaceId}/members/${memberId}`, {
        method: "DELETE",
      });
    } catch (error) {
      console.error(`Failed to remove member from workspace ${workspaceId}:`, error);
      throw new Error((error as any).message || "Failed to remove member from workspace");
    }
  },

  // Project APIs
  async getProjects(workspaceId: string) {
    try {
      return await fetchWithAuth(`/workspaces/${workspaceId}/projects`);
    } catch (error) {
      console.error(`Failed to fetch projects for workspace ${workspaceId}:`, error);
      throw new Error((error as any).message || "Failed to fetch projects");
    }
  },

  async getProject(workspaceId: string, projectId: string) {
    try {
      return await fetchWithAuth(`/workspaces/${workspaceId}/projects/${projectId}`);
    } catch (error) {
      console.error(`Failed to fetch project ${projectId}:`, error);
      throw new Error((error as any).message || "Failed to fetch project");
    }
  },

  async createProject(workspaceId: string, data: ProjectRequest) {
    try {
      return await fetchWithAuth(`/workspaces/${workspaceId}/projects`, {
        method: "POST",
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error(`Failed to create project in workspace ${workspaceId}:`, error);
      throw new Error((error as any).message || "Failed to create project");
    }
  },

  async updateProject(workspaceId: string, projectId: string, data: Partial<ProjectRequest & { status?: string, archived?: boolean }>) {
    try {
      return await fetchWithAuth(`/workspaces/${workspaceId}/projects/${projectId}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error(`Failed to update project ${projectId}:`, error);
      throw new Error((error as any).message || "Failed to update project");
    }
  },

  async deleteProject(workspaceId: string, projectId: string) {
    try {
      return await fetchWithAuth(`/workspaces/${workspaceId}/projects/${projectId}`, {
        method: "DELETE",
      });
    } catch (error) {
      console.error(`Failed to delete project ${projectId}:`, error);
      throw new Error((error as any).message || "Failed to delete project");
    }
  },

  async archiveProject(workspaceId: string, projectId: string) {
    try {
      return await fetchWithAuth(`/workspaces/${workspaceId}/projects/${projectId}/archive`, {
        method: "POST",
      });
    } catch (error) {
      console.error(`Failed to archive project ${projectId}:`, error);
      throw new Error((error as any).message || "Failed to archive project");
    }
  },

  // Task APIs
  async getTasks(workspaceId: string, projectId: string, filters?: { status?: string, priority?: string, assignedUserId?: string }) {
    try {
      const queryParams = new URLSearchParams();
      if (filters?.status) queryParams.append('status', filters.status);
      if (filters?.priority) queryParams.append('priority', filters.priority);
      if (filters?.assignedUserId) queryParams.append('assignedUserId', filters.assignedUserId);
      
      const queryString = queryParams.toString();
      const url = `/workspaces/${workspaceId}/projects/${projectId}/tasks${queryString ? `?${queryString}` : ''}`;
      
      return await fetchWithAuth(url);
    } catch (error) {
      console.error(`Failed to fetch tasks for project ${projectId}:`, error);
      throw new Error((error as any).message || "Failed to fetch tasks");
    }
  },

  async getTask(workspaceId: string, projectId: string, taskId: string) {
    try {
      return await fetchWithAuth(`/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}`);
    } catch (error) {
      console.error(`Failed to fetch task ${taskId}:`, error);
      throw new Error((error as any).message || "Failed to fetch task");
    }
  },

  async createTask(workspaceId: string, projectId: string, data: TaskRequest) {
    try {
      return await fetchWithAuth(`/workspaces/${workspaceId}/projects/${projectId}/tasks`, {
        method: "POST",
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error(`Failed to create task in project ${projectId}:`, error);
      throw new Error((error as any).message || "Failed to create task");
    }
  },

  async updateTask(workspaceId: string, projectId: string, taskId: string, data: TaskUpdateRequest) {
    try {
      return await fetchWithAuth(`/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error(`Failed to update task ${taskId}:`, error);
      throw new Error((error as any).message || "Failed to update task");
    }
  },

  async deleteTask(workspaceId: string, projectId: string, taskId: string) {
    try {
      return await fetchWithAuth(`/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}`, {
        method: "DELETE",
      });
    } catch (error) {
      console.error(`Failed to delete task ${taskId}:`, error);
      throw new Error((error as any).message || "Failed to delete task");
    }
  },

  async assignTask(workspaceId: string, projectId: string, taskId: string, userId: string) {
    try {
      return await fetchWithAuth(`/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/assign`, {
        method: "POST",
        body: userId,
      });
    } catch (error) {
      console.error(`Failed to assign task ${taskId}:`, error);
      throw new Error((error as any).message || "Failed to assign task");
    }
  },

  async unassignTask(workspaceId: string, projectId: string, taskId: string) {
    try {
      return await fetchWithAuth(`/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/assign`, {
        method: "DELETE",
      });
    } catch (error) {
      console.error(`Failed to unassign task ${taskId}:`, error);
      throw new Error((error as any).message || "Failed to unassign task");
    }
  },

  async completeTask(workspaceId: string, projectId: string, taskId: string) {
    try {
      return await fetchWithAuth(`/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/complete`, {
        method: "POST",
      });
    } catch (error) {
      console.error(`Failed to complete task ${taskId}:`, error);
      throw new Error((error as any).message || "Failed to complete task");
    }
  },

  async setupRecurringTask(workspaceId: string, projectId: string, taskId: string, recurrence: { type: string, interval: number, endDate?: string }) {
    try {
      return await fetchWithAuth(`/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/recurring`, {
        method: "POST",
        body: JSON.stringify(recurrence),
      });
    } catch (error) {
      console.error(`Failed to set up recurring task ${taskId}:`, error);
      throw new Error((error as any).message || "Failed to set up recurring task");
    }
  },

  async addComment(workspaceId: string, projectId: string, taskId: string, data: CommentRequest) {
    try {
      return await fetchWithAuth(`/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/comments`, {
        method: "POST",
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error(`Failed to add comment to task ${taskId}:`, error);
      throw new Error((error as any).message || "Failed to add comment");
    }
  },

  async updateComment(workspaceId: string, projectId: string, taskId: string, commentId: string, data: CommentRequest) {
    try {
      return await fetchWithAuth(`/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/comments/${commentId}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error(`Failed to update comment ${commentId}:`, error);
      throw new Error((error as any).message || "Failed to update comment");
    }
  },

  async deleteComment(workspaceId: string, projectId: string, taskId: string, commentId: string) {
    try {
      return await fetchWithAuth(`/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/comments/${commentId}`, {
        method: "DELETE",
      });
    } catch (error) {
      console.error(`Failed to delete comment ${commentId}:`, error);
      throw new Error((error as any).message || "Failed to delete comment");
    }
  },

  async attachFile(workspaceId: string, projectId: string, taskId: string, data: AttachmentRequest) {
    try {
      return await fetchWithAuth(`/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/attachments`, {
        method: "POST",
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error(`Failed to attach file to task ${taskId}:`, error);
      throw new Error((error as any).message || "Failed to attach file");
    }
  },

  async removeFile(workspaceId: string, projectId: string, taskId: string, fileId: string) {
    try {
      return await fetchWithAuth(`/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/attachments/${fileId}`, {
        method: "DELETE",
      });
    } catch (error) {
      console.error(`Failed to remove file ${fileId}:`, error);
      throw new Error((error as any).message || "Failed to remove file");
    }
  },
};