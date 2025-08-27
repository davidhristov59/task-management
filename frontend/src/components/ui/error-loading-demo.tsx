import { useState } from 'react'
import { Button } from './button'
import { LoadingSpinner, LoadingOverlay } from './loading-spinner'
import { WorkspaceCardSkeleton, TaskCardSkeleton, ListSkeleton } from './loading-skeletons'
import { showToast } from './toast'
import { OfflineIndicator } from './offline-indicator'
import { useLoadingState, useRetry, useOnlineStatus } from '@/hooks'
import { ErrorBoundary, withErrorBoundary } from '../ErrorBoundary'


export function ErrorLoadingDemo() {
  const [showSkeletons, setShowSkeletons] = useState(false)
  const [showOfflineIndicator, setShowOfflineIndicator] = useState(false)
  const { isFullyConnected } = useOnlineStatus()
  
  
  const { isLoading, execute } = useLoadingState()
  
  
  const { executeWithRetry, isRetrying, attempts } = useRetry(
    async () => {
      
      if (Math.random() < 0.7) {
        throw new Error('Simulated API failure')
      }
      return 'Success!'
    },
    {
      maxAttempts: 3,
      delay: 1000,
      backoff: true
    }
  )

  const handleToastDemo = (type: 'success' | 'error' | 'warning' | 'info') => {
    const messages = {
      success: 'Operation completed successfully!',
      error: 'Something went wrong. Please try again.',
      warning: 'This is a warning message.',
      info: 'Here is some information for you.'
    }
    showToast[type](messages[type])
  }

  const handleLoadingDemo = async () => {
    await execute(async () => {
      
      await new Promise(resolve => setTimeout(resolve, 2000))
      return 'Demo completed'
    }, {
      showSuccessToast: true,
      successMessage: 'Loading demo completed!',
      errorContext: 'Loading demo'
    })
  }

  const handleRetryDemo = async () => {
    try {
      const result = await executeWithRetry()
      showToast.success(`Retry demo succeeded: ${result}`)
    } catch (error) {
      showToast.error('Retry demo failed after all attempts')
    }
  }

  const handleErrorBoundaryDemo = () => {
    
    throw new Error('Demo error boundary trigger')
  }

  return (
    <div className="p-6 space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold mb-2">Error Handling & Loading States Demo</h1>
        <p className="text-gray-600">
          This demo showcases all the error handling and loading state components.
        </p>
      </div>

      {/* Connection Status */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Connection Status</h2>
        <p className="mb-2">
          Status: <span className={isFullyConnected ? 'text-green-600' : 'text-red-600'}>
            {isFullyConnected ? 'Online' : 'Offline'}
          </span>
        </p>
        <Button
          variant="outline"
          onClick={() => setShowOfflineIndicator(!showOfflineIndicator)}
        >
          {showOfflineIndicator ? 'Hide' : 'Show'} Offline Indicator
        </Button>
        {showOfflineIndicator && <OfflineIndicator className="mt-2" showDetails />}
      </div>

      {/* Toast Notifications */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Toast Notifications</h2>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => handleToastDemo('success')} className="bg-green-600 hover:bg-green-700">
            Success Toast
          </Button>
          <Button onClick={() => handleToastDemo('error')} className="bg-red-600 hover:bg-red-700">
            Error Toast
          </Button>
          <Button onClick={() => handleToastDemo('warning')} className="bg-yellow-600 hover:bg-yellow-700">
            Warning Toast
          </Button>
          <Button onClick={() => handleToastDemo('info')} className="bg-blue-600 hover:bg-blue-700">
            Info Toast
          </Button>
        </div>
      </div>

      {/* Loading States */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Loading States</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Button onClick={handleLoadingDemo} disabled={isLoading}>
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Loading...
                </>
              ) : (
                'Start Loading Demo'
              )}
            </Button>
            <LoadingSpinner size="sm" />
            <LoadingSpinner size="md" />
            <LoadingSpinner size="lg" />
          </div>
          
          <LoadingOverlay isLoading={isLoading}>
            <div className="bg-white p-4 border rounded">
              <p>This content is overlaid with loading spinner when demo is running.</p>
            </div>
          </LoadingOverlay>
        </div>
      </div>

      {/* Skeleton Loading */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Skeleton Loading</h2>
        <Button
          variant="outline"
          onClick={() => setShowSkeletons(!showSkeletons)}
          className="mb-4"
        >
          {showSkeletons ? 'Hide' : 'Show'} Skeletons
        </Button>
        
        {showSkeletons && (
          <div className="space-y-6">
            <div>
              <h3 className="font-medium mb-2">Workspace Card Skeletons</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <WorkspaceCardSkeleton />
                <WorkspaceCardSkeleton />
                <WorkspaceCardSkeleton />
              </div>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Task Card Skeletons</h3>
              <ListSkeleton count={3} ItemSkeleton={TaskCardSkeleton} />
            </div>
          </div>
        )}
      </div>

      {/* Retry Functionality */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Retry Functionality</h2>
        <div className="space-y-2">
          <Button onClick={handleRetryDemo} disabled={isRetrying}>
            {isRetrying ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Retrying... (Attempt {attempts})
              </>
            ) : (
              'Test Retry Logic'
            )}
          </Button>
          <p className="text-sm text-gray-600">
            This will simulate an API call that fails ~70% of the time and retry up to 3 times.
          </p>
        </div>
      </div>

      {/* Error Boundary */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Error Boundary</h2>
        <ErrorBoundary>
          <div className="space-y-2">
            <Button 
              onClick={handleErrorBoundaryDemo}
              className="bg-red-600 hover:bg-red-700"
            >
              Trigger Error Boundary
            </Button>
            <p className="text-sm text-gray-600">
              This will throw an error to demonstrate the error boundary fallback UI.
            </p>
          </div>
        </ErrorBoundary>
      </div>
    </div>
  )
}


export const DemoComponentWithErrorBoundary = withErrorBoundary(
  () => <div>This component is wrapped with an error boundary</div>,
  <div>Custom fallback UI for this component</div>
)