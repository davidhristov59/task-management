# Design Document

## Overview

The Task Management Frontend is a modern React application built with Vite, TypeScript, Tailwind CSS, and shadcn/ui components. It provides a clean, minimalistic interface for managing workspaces, projects, and tasks through a hierarchical structure. The application follows a component-based architecture with clear separation of concerns, state management using React Query for server state, and Zustand for client state.

## Architecture

### Technology Stack
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS for utility-first styling
- **UI Components**: shadcn/ui for consistent, accessible components
- **State Management**: 
  - React Query (TanStack Query) for server state management
  - Zustand for client-side state management
- **Routing**: React Router v6 for navigation
- **HTTP Client**: Axios for API communication
- **Form Handling**: React Hook Form with Zod validation
- **Icons**: Lucide React for consistent iconography

### Application Structure
```
src/
├── components/           # Reusable UI components
│   ├── ui/              # shadcn/ui components
│   ├── layout/          # Layout components (Header, Sidebar, etc.)
│   ├── workspace/       # Workspace-specific components
│   ├── project/         # Project-specific components
│   └── task/            # Task-specific components
├── pages/               # Page components
│   ├── WorkspacesPage.tsx    # Main workspaces list view
│   ├── WorkspaceDetailPage.tsx # Workspace detail with projects
│   ├── ProjectDetailPage.tsx   # Project detail with tasks
│   └── TaskDetailPage.tsx      # Individual task detail view
├── hooks/               # Custom React hooks
├── services/            # API service functions
├── stores/              # Zustand stores
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
└── lib/                 # Configuration and setup files
```

### Navigation Flow
The application follows a hierarchical navigation structure:
1. **Workspaces List** → Click workspace → **Workspace Detail** (shows projects)
2. **Workspace Detail** → Click project → **Project Detail** (shows tasks)  
3. **Project Detail** → Click task → **Task Detail** (shows comments, attachments, recurring settings)
4. **Breadcrumb Navigation** available at all levels showing current location
5. **Back Navigation** options available to return to previous levels

## Components and Interfaces

### Core Components

#### Layout Components
- **AppLayout**: Main application layout with sidebar navigation
- **Header**: Top navigation bar with user info and global actions
- **Sidebar**: Collapsible navigation sidebar with workspace/project tree
- **Breadcrumb**: Navigation breadcrumb showing current location

#### Workspace Components
- **WorkspaceList**: Grid/list view of all workspaces
- **WorkspaceCard**: Individual workspace display card
- **WorkspaceForm**: Create/edit workspace form
- **WorkspaceMemberManager**: Component for managing workspace members

#### Project Components
- **ProjectList**: Grid/list view of projects within a workspace
- **ProjectCard**: Individual project display card
- **ProjectForm**: Create/edit project form
- **ProjectHeader**: Project details and actions header

#### Task Components
- **TaskBoard**: Kanban-style task board view with status columns (PENDING, IN_PROGRESS, COMPLETED, CANCELLED)
- **TaskList**: List view of tasks with search, filtering, and sorting capabilities
- **TaskCard**: Individual task display card showing priority, status, deadline, tags, and assignment
- **TaskForm**: Create/edit task form with title, description, priority, deadline, tags, categories, and assignment fields
- **TaskDetail**: Detailed task view with comments, attachments, and recurring task settings
- **CommentSection**: Task comments display and creation with author information and timestamps
- **AttachmentManager**: File attachment upload and management with file type and size validation
- **RecurringTaskForm**: Form for setting up task recurrence with type (DAILY/WEEKLY/MONTHLY), interval, and end date
- **TaskAssignmentSelector**: Component for assigning/unassigning tasks to users
- **TaskStatusSelector**: Component for updating task status (PENDING/IN_PROGRESS/COMPLETED/CANCELLED)

### API Service Layer

#### Base API Configuration
```typescript
// services/api.ts
const api = axios.create({
  baseURL: 'http://localhost:8087',
  timeout: 10000,
});
```

#### Service Modules
- **workspaceService**: CRUD operations for workspaces and member management
  - GET `/workspaces` - List all workspaces
  - POST `/workspaces` - Create workspace with title, description, ownerId, memberIds
  - PUT `/workspaces/{id}` - Update workspace
  - DELETE `/workspaces/{id}` - Delete workspace
  - POST `/workspaces/{id}/members` - Add members
  - DELETE `/workspaces/{id}/members/{userId}` - Remove members
- **projectService**: CRUD operations for projects and archiving
  - GET `/workspaces/{workspaceId}/projects` - List projects in workspace
  - POST `/workspaces/{workspaceId}/projects` - Create project with title, description, ownerId
  - PUT `/workspaces/{workspaceId}/projects/{projectId}` - Update project
  - DELETE `/workspaces/{workspaceId}/projects/{projectId}` - Delete project
  - POST `/workspaces/{workspaceId}/projects/{projectId}/archive` - Archive project
- **taskService**: CRUD operations for tasks, completion, assignment
  - GET `/workspaces/{workspaceId}/projects/{projectId}/tasks` - List tasks in project
  - POST `/workspaces/{workspaceId}/projects/{projectId}/tasks` - Create task with title, description, priority, deadlineDate, tags, categories
  - PUT `/tasks/{taskId}` - Update task
  - DELETE `/tasks/{taskId}` - Delete task
  - POST `/tasks/{taskId}/complete` - Mark task as complete
  - POST `/tasks/{taskId}/assign` - Assign task to user
  - DELETE `/tasks/{taskId}/assign` - Unassign task
- **commentService**: Comment management for tasks
  - GET `/tasks/{taskId}/comments` - List task comments
  - POST `/tasks/{taskId}/comments` - Create comment with authorId and content
  - PUT `/tasks/{taskId}/comments/{commentId}` - Update comment
  - DELETE `/tasks/{taskId}/comments/{commentId}` - Delete comment
- **attachmentService**: File attachment management
  - GET `/tasks/{taskId}/attachments` - List task attachments
  - POST `/tasks/{taskId}/attachments` - Upload attachment with fileName, fileType, fileSize
  - DELETE `/tasks/{taskId}/attachments/{attachmentId}` - Delete attachment
- **recurringService**: Recurring task configuration
  - POST `/tasks/{taskId}/recurring` - Create recurring task with type, interval, endDate
  - GET `/tasks/{taskId}/recurring` - Get recurring task settings

### State Management

#### Server State (React Query)
- Workspace queries and mutations
- Project queries and mutations  
- Task queries and mutations
- Comment queries and mutations
- Attachment queries and mutations
- Optimistic updates for better UX

#### Client State (Zustand)
- UI state (sidebar collapsed, current view mode)
- User preferences (theme, layout preferences)
- Navigation state (breadcrumb, current workspace/project)
- Form state for complex multi-step forms

## Data Models

### Core Entities

#### Workspace
```typescript
interface Workspace {
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
```

#### Project
```typescript
interface Project {
  projectId: string;
  title: string;
  description: string;
  workspaceId: string;
  ownerId: string;
  status: 'PLANNING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  lastModifiedAt?: string;
  archived: boolean;
  deleted: boolean;
}
```

#### Task
```typescript
interface Task {
  taskId: string;
  title: string;
  description: string;
  workspaceId: string;
  projectId: string;
  assignedUserId?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  deadline?: string; // LocalDateTime as ISO string
  createdAt: string;
  lastModifiedAt?: string;
  tags: Tag[];
  categories: Category[];
  attachments: Attachment[];
  comments: Comment[];
  deleted: boolean;
}
```

#### Tag
```typescript
interface Tag {
  id: string;
  name: string;
}
```

#### Category
```typescript
interface Category {
  id: string;
  name: string;
}
```

#### Comment
```typescript
interface Comment {
  commentId: string;
  authorId: string;
  content: string;
  taskId: string;
  timestamp: string;
}
```

#### Attachment
```typescript
interface Attachment {
  fileId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  taskId: string;
}
```

#### RecurringTask
```typescript
interface RecurrenceRule {
  type: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  interval: number;
  endDate?: string; // LocalDateTime as ISO string
}
```

#### User
```typescript
interface User {
  userId: string;
  name: string;
  email: string;
  role: 'EMPLOYEE' | 'STUDENT';
  active: boolean;
  createdAt: string;
  lastModifiedAt?: string;
  deleted: boolean;
}
```

## Error Handling

### API Error Handling
- Centralized error interceptor in Axios configuration
- Toast notifications for user-friendly error messages with retry options
- Retry logic for transient failures
- Offline state detection and handling
- Specific error handling for workspace, project, task, comment, and attachment operations
- Graceful degradation when API endpoints are unavailable

### Form Validation
- Zod schemas for runtime type validation
- Real-time validation feedback for all form fields
- Server-side validation error display
- Optimistic UI updates with rollback on failure
- Validation for file uploads (type, size constraints)
- Required field validation for workspace, project, and task creation

### Error Boundaries
- React Error Boundaries for component-level error catching
- Fallback UI components for graceful degradation
- Error reporting and logging for debugging
- User-friendly error messages that don't expose technical details

## Testing Strategy

### Unit Testing
- **Framework**: Vitest for fast unit testing
- **Component Testing**: React Testing Library for component behavior testing
- **Coverage**: Minimum 80% code coverage for critical paths
- **Mocking**: MSW (Mock Service Worker) for API mocking

### Integration Testing
- End-to-end user flows testing
- API integration testing with real backend
- Cross-browser compatibility testing

### Performance Testing
- Bundle size monitoring
- Core Web Vitals tracking
- Lighthouse performance audits
- Memory leak detection

## UI/UX Design Principles

### Design System
- **Color Palette**: Minimalistic black and white design with subtle grays for visual hierarchy
- **Typography**: Clean, readable font hierarchy using system fonts with consistent sizing
- **Spacing**: Consistent 8px grid system for uniform layout
- **Components**: Consistent component library based on shadcn/ui with appropriate hover states
- **Visual Hierarchy**: Clear distinction between different content levels and interactive elements
- **Feedback**: Visual feedback for all user interactions including button states and form validation

### Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support
- Focus management and indicators

### Responsive Design
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Touch-friendly interface on mobile devices
- Adaptive layouts for different screen sizes

### User Experience
- **Loading States**: Skeleton loaders and progress indicators for all API operations
- **Empty States**: Helpful empty state messages with call-to-action buttons for creating workspaces, projects, and tasks
- **Feedback**: Immediate visual feedback for user actions with hover states and loading indicators
- **Navigation**: Intuitive breadcrumb navigation showing current location (Workspace > Project > Task)
- **Search**: Search and filter capabilities for workspaces, projects, and tasks
- **Bulk Operations**: Selection and batch action capabilities for managing multiple items
- **Error Handling**: Clear error messages with retry options when API requests fail
- **Performance**: Initial view loads within 2 seconds with smooth transitions between views

## Performance Optimizations

### Code Splitting
- Route-based code splitting using React.lazy()
- Component-level code splitting for large components
- Dynamic imports for heavy libraries

### Caching Strategy
- React Query caching for API responses
- Browser caching for static assets
- Service worker for offline functionality

### Bundle Optimization
- Tree shaking for unused code elimination
- Asset optimization (images, fonts)
- Gzip compression for production builds
- CDN integration for static assets

## Security Considerations

### Authentication & Authorization
- JWT token handling and refresh
- Role-based access control
- Secure token storage
- Session timeout handling

### Data Protection
- Input sanitization and validation
- XSS protection
- CSRF protection
- Secure API communication (HTTPS)

### Privacy
- No sensitive data in localStorage
- Secure cookie handling
- Data encryption for sensitive information