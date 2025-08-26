import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { useEffect } from 'react'
import { queryClient } from '@/lib/queryClient'
import { AppLayout } from '@/components/layout'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { ToastProvider } from '@/components/ui/toast'
import { FloatingOfflineIndicator } from '@/components/ui/offline-indicator'
import { setupGlobalErrorHandlers } from '@/utils/errorHandling'
import { 
  WorkspacesPage, 
  WorkspaceDetailPage, 
  ProjectDetailPage, 
  TaskDetailPage 
} from '@/pages'
import './App.css'

function App() {
  useEffect(() => {
    // Set up global error handlers
    setupGlobalErrorHandlers()
  }, [])

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router>
          <ToastProvider />
          <FloatingOfflineIndicator />
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
