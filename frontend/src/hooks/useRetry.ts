import { useState, useCallback } from 'react'
import { showToast } from '../components/ui/toast'

interface RetryOptions {
  maxAttempts?: number
  delay?: number
  backoff?: boolean
  onRetry?: (attempt: number) => void
  onMaxAttemptsReached?: () => void
}

interface RetryState {
  isRetrying: boolean
  attempts: number
  lastError?: Error
}

export function useRetry<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  options: RetryOptions = {}
) {
  const {
    maxAttempts = 3,
    delay = 1000,
    backoff = true,
    onRetry,
    onMaxAttemptsReached
  } = options

  const [retryState, setRetryState] = useState<RetryState>({
    isRetrying: false,
    attempts: 0
  })

  const executeWithRetry = useCallback(
    async (...args: T): Promise<R> => {
      let currentAttempt = 0
      let lastError: Error | undefined

      while (currentAttempt < maxAttempts) {
        try {
          setRetryState(prev => ({
            ...prev,
            isRetrying: currentAttempt > 0,
            attempts: currentAttempt + 1
          }))

          const result = await fn(...args)
          
          // Success - reset state
          setRetryState({
            isRetrying: false,
            attempts: 0
          })
          
          return result
        } catch (error) {
          lastError = error as Error
          currentAttempt++

          if (currentAttempt < maxAttempts) {
            // Calculate delay with optional backoff
            const currentDelay = backoff ? delay * Math.pow(2, currentAttempt - 1) : delay
            
            onRetry?.(currentAttempt)
            
            // Show retry toast
            showToast.info(`Retrying... (${currentAttempt}/${maxAttempts})`, {
              duration: currentDelay
            })
            
            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, currentDelay))
          }
        }
      }

      // Max attempts reached
      setRetryState({
        isRetrying: false,
        attempts: maxAttempts,
        lastError
      })

      onMaxAttemptsReached?.()
      
      showToast.error(`Failed after ${maxAttempts} attempts. Please try again later.`)
      
      throw lastError || new Error('Unknown error occurred during retry')
    },
    [fn, maxAttempts, delay, backoff, onRetry, onMaxAttemptsReached]
  )

  const reset = useCallback(() => {
    setRetryState({
      isRetrying: false,
      attempts: 0
    })
  }, [])

  return {
    executeWithRetry,
    reset,
    ...retryState
  }
}

// Hook for retrying React Query mutations
export function useRetryMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: RetryOptions = {}
) {
  const { executeWithRetry, ...retryState } = useRetry(mutationFn, options)

  return {
    mutateWithRetry: executeWithRetry,
    ...retryState
  }
}