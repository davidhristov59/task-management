import type { Workspace, Project, Task, GlobalSearchResult } from '../types';
import { normalizeTask } from './taskUtils';

// Helper function to highlight search terms in text
export function highlightSearchTerm(text: string, searchTerm: string): string {
  if (!searchTerm) return text;

  const regex = new RegExp(`(${searchTerm})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

// Helper function to extract relevant text for search
export function extractSearchableText(item: any): string {
  const texts: string[] = [];

  if (item.title) texts.push(item.title);
  if (item.description) texts.push(item.description);
  if (item.tags) {
    if (typeof item.tags === 'string') {
      try {
        const parsedTags = JSON.parse(item.tags);
        if (Array.isArray(parsedTags)) {
          texts.push(...parsedTags.map((tag: any) => tag.name || tag));
        }
      } catch {
        // Ignore parsing errors
      }
    } else if (Array.isArray(item.tags)) {
      texts.push(...item.tags.map((tag: any) => tag.name || tag));
    }
  }
  if (item.categories) {
    if (typeof item.categories === 'string') {
      try {
        const parsedCategories = JSON.parse(item.categories);
        if (Array.isArray(parsedCategories)) {
          texts.push(...parsedCategories.map((cat: any) => cat.name || cat));
        }
      } catch {
        // Ignore parsing errors
      }
    } else if (Array.isArray(item.categories)) {
      texts.push(...item.categories.map((cat: any) => cat.name || cat));
    }
  }

  return texts.join(' ').toLowerCase();
}

// Local search function for client-side filtering
export function searchItems<T extends { title: string; description?: string }>(
  items: T[],
  searchTerm: string
): T[] {
  if (!searchTerm) return items;

  const lowerSearchTerm = searchTerm.toLowerCase();

  return items.filter(item => {
    const searchableText = extractSearchableText(item);
    return searchableText.includes(lowerSearchTerm);
  });
}

// Convert workspace to search result
export function workspaceToSearchResult(workspace: Workspace): GlobalSearchResult {
  return {
    id: workspace.workspaceId,
    type: 'workspace',
    title: workspace.title,
    description: workspace.description,
    breadcrumb: 'Workspace',
  };
}

// Convert project to search result
export function projectToSearchResult(project: Project, workspaceName?: string): GlobalSearchResult {
  return {
    id: project.projectId.value,
    type: 'project',
    title: project.title,
    description: project.description,
    workspaceId: project.workspaceId,
    status: project.status,
    breadcrumb: workspaceName ? `${workspaceName} > Project` : 'Project',
  };
}

// Convert task to search result
export function taskToSearchResult(task: Task, workspaceName?: string, projectName?: string): GlobalSearchResult {
  const normalizedTask = normalizeTask(task);

  let breadcrumb = 'Task';
  if (workspaceName && projectName) {
    breadcrumb = `${workspaceName} > ${projectName} > Task`;
  } else if (projectName) {
    breadcrumb = `${projectName} > Task`;
  }

  return {
    id: normalizedTask.taskId,
    type: 'task',
    title: normalizedTask.title,
    description: normalizedTask.description,
    workspaceId: normalizedTask.workspaceId,
    projectId: normalizedTask.projectId,
    priority: normalizedTask.priority,
    status: normalizedTask.status,
    tags: normalizedTask.tags.map(tag => tag.name),
    breadcrumb,
  };
}

// Debounce function for search input
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Sort search results by relevance
export function sortSearchResults(results: GlobalSearchResult[], searchTerm: string): GlobalSearchResult[] {
  if (!searchTerm) return results;

  const lowerSearchTerm = searchTerm.toLowerCase();

  return results.sort((a, b) => {
    // Exact title matches first
    const aExactTitle = a.title.toLowerCase() === lowerSearchTerm;
    const bExactTitle = b.title.toLowerCase() === lowerSearchTerm;
    if (aExactTitle && !bExactTitle) return -1;
    if (!aExactTitle && bExactTitle) return 1;

    // Title starts with search term
    const aTitleStarts = a.title.toLowerCase().startsWith(lowerSearchTerm);
    const bTitleStarts = b.title.toLowerCase().startsWith(lowerSearchTerm);
    if (aTitleStarts && !bTitleStarts) return -1;
    if (!aTitleStarts && bTitleStarts) return 1;

    // Title contains search term
    const aTitleContains = a.title.toLowerCase().includes(lowerSearchTerm);
    const bTitleContains = b.title.toLowerCase().includes(lowerSearchTerm);
    if (aTitleContains && !bTitleContains) return -1;
    if (!aTitleContains && bTitleContains) return 1;

    // Type priority: workspace > project > task
    const typePriority = { workspace: 0, project: 1, task: 2 };
    const aTypePriority = typePriority[a.type];
    const bTypePriority = typePriority[b.type];
    if (aTypePriority !== bTypePriority) {
      return aTypePriority - bTypePriority;
    }

    // Alphabetical by title
    return a.title.localeCompare(b.title);
  });
}