import { useState, useEffect } from 'react'
import { showToast } from '../components/ui/toast'

interface OnlineStatusOptions {
  showToasts?: boolean
  pingUrl?: string
  pingInterval?: number
}

export function useOnlineStatus(options: OnlineStatusOptions = {}) {
  const { 
    showToasts = true, 
    pingUrl = '/api/health', 
    pingInterval = 30000 
  } = options

  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [isConnected, setIsConnected] = useState(true) 
  const [lastOnlineTime, setLastOnlineTime] = useState<Date | null>(null)

  
  const checkConnectivity = async () => {
    try {
      const response = await fetch(pingUrl, {
        method: 'HEAD',
        cache: 'no-cache',
        signal: AbortSignal.timeout(5000)
      })
      
      const connected = response.ok
      setIsConnected(connected)
      
      if (connected && !isConnected && showToasts) {
        showToast.success('Connection restored!')
      }
      
      return connected
    } catch (error) {
      setIsConnected(false)
      return false
    }
  }

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setLastOnlineTime(new Date())
      
      if (showToasts) {
        showToast.success('You are back online!')
      }
      
      
      checkConnectivity()
    }

    const handleOffline = () => {
      setIsOnline(false)
      
      if (showToasts) {
        showToast.warning('You are currently offline. Some features may not work.')
      }
    }

    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    
    const intervalId = setInterval(checkConnectivity, pingInterval)

    
    checkConnectivity()

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      clearInterval(intervalId)
    }
  }, [showToasts, pingUrl, pingInterval, isConnected])

  return {
    isOnline,
    isConnected,
    isFullyConnected: isOnline && isConnected,
    lastOnlineTime,
    checkConnectivity
  }
}