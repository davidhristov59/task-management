import { WifiOff, AlertCircle, RefreshCw } from 'lucide-react'
import { useOnlineStatus } from '../../hooks/useOnlineStatus'
import { Button } from './button'

interface OfflineIndicatorProps {
  className?: string
  showDetails?: boolean
}

export function OfflineIndicator({ className = '', showDetails = false }: OfflineIndicatorProps) {
  const { isOnline, isFullyConnected, checkConnectivity } = useOnlineStatus({
    showToasts: false // Don't show toasts from this component
  })

  if (isFullyConnected) {
    return null
  }

  const handleRetryConnection = async () => {
    await checkConnectivity()
  }

  return (
    <div className={`bg-yellow-50 border-l-4 border-yellow-400 p-4 ${className}`}>
      <div className="flex items-center">
        <div className="flex-shrink-0">
          {!isOnline ? (
            <WifiOff className="h-5 w-5 text-yellow-400" />
          ) : (
            <AlertCircle className="h-5 w-5 text-yellow-400" />
          )}
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm text-yellow-700">
            {!isOnline 
              ? 'You are currently offline' 
              : 'Connection to server lost'
            }
          </p>
          {showDetails && (
            <p className="text-xs text-yellow-600 mt-1">
              Some features may not work properly. Changes will be saved when connection is restored.
            </p>
          )}
        </div>
        <div className="ml-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRetryConnection}
            className="text-yellow-700 border-yellow-300 hover:bg-yellow-100"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Retry
          </Button>
        </div>
      </div>
    </div>
  )
}

// Floating offline indicator for persistent display
export function FloatingOfflineIndicator() {
  const { isFullyConnected } = useOnlineStatus()

  if (isFullyConnected) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
        <WifiOff className="h-4 w-4" />
        <span className="text-sm font-medium">Offline</span>
      </div>
    </div>
  )
}