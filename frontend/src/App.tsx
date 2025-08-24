import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/queryClient'
import { AppLayout } from '@/components/layout'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { 
  WorkspacesPage, 
  WorkspaceDetailPage, 
  ProjectDetailPage, 
  TaskDetailPage 
} from '@/pages'
import './App.css'

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router>
          <Routes>
            <Route path="/" element={<AppLayout />}>
              <Route index element={<WorkspacesPage />} />
              <Route path="workspaces/:workspaceId" element={<WorkspaceDetailPage />} />
              <Route path="workspaces/:workspaceId/projects/:projectId" element={<ProjectDetailPage />} />
              <Route path="workspaces/:workspaceId/projects/:projectId/tasks/:taskId" element={<TaskDetailPage />} />
            </Route>
          </Routes>
        </Router>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}

export default App
