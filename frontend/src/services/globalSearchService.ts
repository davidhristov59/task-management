import { workspaceService } from './workspaceService';
import { projectService } from './projectService';
import { taskService } from './taskService';
import type { GlobalSearchRequest, GlobalSearchResult } from '../types';
import { 
  workspaceToSearchResult, 
  projectToSearchResult, 
  taskToSearchResult, 
  searchItems,
  sortSearchResults 
} from '../utils/searchUtils';

export const globalSearchService = {
  
  search: async (params: GlobalSearchRequest): Promise<GlobalSearchResult[]> => {
    return await clientSideGlobalSearch(params);
  },

  
  searchInWorkspace: async (workspaceId: string, query: string): Promise<GlobalSearchResult[]> => {
    return await clientSideWorkspaceSearch(workspaceId, query);
  },

  
  searchInProject: async (workspaceId: string, projectId: string, query: string): Promise<GlobalSearchResult[]> => {
    return await clientSideProjectSearch(workspaceId, projectId, query);
  },
};


async function clientSideGlobalSearch(params: GlobalSearchRequest): Promise<GlobalSearchResult[]> {
  const { query, types = ['workspace', 'project', 'task'], limit = 20 } = params;
  
  if (!query || query.length < 2) return [];
  
  const results: GlobalSearchResult[] = [];
  
  try {
    
    if (types.includes('workspace')) {
      const workspaces = await workspaceService.getWorkspaces();
      const filteredWorkspaces = searchItems(workspaces, query);
      results.push(...filteredWorkspaces.map(workspaceToSearchResult));
    }
    
    
    if (types.includes('project')) {
      const workspaces = await workspaceService.getWorkspaces();
      for (const workspace of workspaces) {
        try {
          const projects = await projectService.getProjects(workspace.workspaceId);
          const filteredProjects = searchItems(projects, query);
          results.push(...filteredProjects.map(project => 
            projectToSearchResult(project, workspace.title)
          ));
        } catch (error) {
          console.warn(`Failed to search projects in workspace ${workspace.workspaceId}:`, error);
        }
      }
    }
    
    
    if (types.includes('task')) {
      const workspaces = await workspaceService.getWorkspaces();
      for (const workspace of workspaces) {
        try {
          const projects = await projectService.getProjects(workspace.workspaceId);
          for (const project of projects) {
            try {
              const normalizedTasks = await taskService.getTasks(workspace.workspaceId, project.projectId.value);
              
              const tasks = normalizedTasks.map(normalizedTask => ({
                taskId: { value: normalizedTask.taskId },
                title: normalizedTask.title,
                description: normalizedTask.description,
                workspaceId: normalizedTask.workspaceId,
                projectId: { value: normalizedTask.projectId },
                assignedUserId: normalizedTask.assignedUserId,
                status: normalizedTask.status,
                priority: normalizedTask.priority,
                deadline: normalizedTask.deadline,
                createdAt: normalizedTask.createdAt,
                lastModifiedAt: normalizedTask.lastModifiedAt,
                tags: JSON.stringify(normalizedTask.tags),
                categories: JSON.stringify(normalizedTask.categories),
                attachments: JSON.stringify(normalizedTask.attachments),
                comments: JSON.stringify(normalizedTask.comments),
                deleted: normalizedTask.deleted,
              }));
              const filteredTasks = searchItems(tasks, query);
              results.push(...filteredTasks.map(task => 
                taskToSearchResult(task, workspace.title, project.title)
              ));
            } catch (error) {
              console.warn(`Failed to search tasks in project ${project.projectId.value}:`, error);
            }
          }
        } catch (error) {
          console.warn(`Failed to search projects in workspace ${workspace.workspaceId}:`, error);
        }
      }
    }
  } catch (error) {
    console.error('Client-side global search failed:', error);
    return [];
  }
  
  const sortedResults = sortSearchResults(results, query);
  return sortedResults.slice(0, limit);
}

async function clientSideWorkspaceSearch(workspaceId: string, query: string): Promise<GlobalSearchResult[]> {
  if (!query || query.length < 2) return [];
  
  const results: GlobalSearchResult[] = [];
  
  try {
    const workspace = await workspaceService.getWorkspace(workspaceId);
    const projects = await projectService.getProjects(workspaceId);
    
    
    const filteredProjects = searchItems(projects, query);
    results.push(...filteredProjects.map(project => 
      projectToSearchResult(project, workspace.title)
    ));
    
    
    for (const project of projects) {
      try {
        const normalizedTasks = await taskService.getTasks(workspaceId, project.projectId.value);
        
        const tasks = normalizedTasks.map(normalizedTask => ({
          taskId: { value: normalizedTask.taskId },
          title: normalizedTask.title,
          description: normalizedTask.description,
          workspaceId: normalizedTask.workspaceId,
          projectId: { value: normalizedTask.projectId },
          assignedUserId: normalizedTask.assignedUserId,
          status: normalizedTask.status,
          priority: normalizedTask.priority,
          deadline: normalizedTask.deadline,
          createdAt: normalizedTask.createdAt,
          lastModifiedAt: normalizedTask.lastModifiedAt,
          tags: JSON.stringify(normalizedTask.tags),
          categories: JSON.stringify(normalizedTask.categories),
          attachments: JSON.stringify(normalizedTask.attachments),
          comments: JSON.stringify(normalizedTask.comments),
          deleted: normalizedTask.deleted,
        }));
        const filteredTasks = searchItems(tasks, query);
        results.push(...filteredTasks.map(task => 
          taskToSearchResult(task, workspace.title, project.title)
        ));
      } catch (error) {
        console.warn(`Failed to search tasks in project ${project.projectId.value}:`, error);
      }
    }
  } catch (error) {
    console.error('Client-side workspace search failed:', error);
    return [];
  }
  
  return sortSearchResults(results, query);
}

async function clientSideProjectSearch(workspaceId: string, projectId: string, query: string): Promise<GlobalSearchResult[]> {
  if (!query || query.length < 2) return [];
  
  try {
    const workspace = await workspaceService.getWorkspace(workspaceId);
    const project = await projectService.getProject(workspaceId, projectId);
    const normalizedTasks = await taskService.getTasks(workspaceId, projectId);
    
    
    const tasks = normalizedTasks.map(normalizedTask => ({
      taskId: { value: normalizedTask.taskId },
      title: normalizedTask.title,
      description: normalizedTask.description,
      workspaceId: normalizedTask.workspaceId,
      projectId: { value: normalizedTask.projectId },
      assignedUserId: normalizedTask.assignedUserId,
      status: normalizedTask.status,
      priority: normalizedTask.priority,
      deadline: normalizedTask.deadline,
      createdAt: normalizedTask.createdAt,
      lastModifiedAt: normalizedTask.lastModifiedAt,
      tags: JSON.stringify(normalizedTask.tags),
      categories: JSON.stringify(normalizedTask.categories),
      attachments: JSON.stringify(normalizedTask.attachments),
      comments: JSON.stringify(normalizedTask.comments),
      deleted: normalizedTask.deleted,
    }));
    
    const filteredTasks = searchItems(tasks, query);
    const results = filteredTasks.map(task => 
      taskToSearchResult(task, workspace.title, project.title)
    );
    
    return sortSearchResults(results, query);
  } catch (error) {
    console.error('Client-side project search failed:', error);
    return [];
  }
}