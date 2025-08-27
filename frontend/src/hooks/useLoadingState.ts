import { useState, useCallback } from 'react'
import { showToast } from '../components/ui/toast'
import { ErrorHandler } from '../utils/errorHandling'

interface LoadingStateOptions {
  showSuccessToast?: boolean
  showErrorToast?: boolean
  successMessage?: string
  errorContext?: string
}

interface LoadingState {
  isLoading: boolean
  error: Error | null
  data: any
}

export function useLoadingState<T = any>(initialData?: T) {
  const [state, setState] = useState<LoadingState>({
    isLoading: false,
    error: null,
    data: initialData || null
  })

  const execute = useCallback(async <R = T>(
    asyncFn: () => Promise<R>,
    options: LoadingStateOptions = {}
  ): Promise<R | null> => {
    const {
      showSuccessToast = false,
      showErrorToast = true,
      successMessage,
      errorContext
    } = options

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const result = await asyncFn()
      
      setState({
        isLoading: false,
        error: null,
        data: result
      })

      if (showSuccessToast && successMessage) {
        showToast.success(successMessage)
      }

      return result
    } catch (error) {
      ErrorHandler.handle(error as Error, errorContext, showErrorToast)
      
      setState({
        isLoading: false,
        error: error as Error,
        data: null
      })

      return null
    }
  }, [])

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      data: null
    })
  }, [])

  const setData = useCallback((data: T) => {
    setState(prev => ({ ...prev, data }))
  }, [])

  const setError = useCallback((error: Error) => {
    setState(prev => ({ ...prev, error }))
  }, [])

  return {
    ...state,
    execute,
    reset,
    setData,
    setError
  }
}


export function useFormSubmission<TData = any, TResult = any>() {
  const { execute, isLoading, error, reset } = useLoadingState<TResult>()

  const submit = useCallback(async (
    submitFn: (data: TData) => Promise<TResult>,
    data: TData,
    options: LoadingStateOptions = {}
  ) => {
    return execute(() => submitFn(data), {
      showSuccessToast: true,
      successMessage: 'Operation completed successfully',
      errorContext: 'Form submission',
      ...options
    })
  }, [execute])

  return {
    submit,
    isSubmitting: isLoading,
    error,
    reset
  }
}


export function useMultipleLoadingStates() {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})

  const setLoading = useCallback((key: string, loading: boolean) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: loading
    }))
  }, [])

  const isLoading = useCallback((key: string) => {
    return loadingStates[key] || false
  }, [loadingStates])

  const isAnyLoading = useCallback(() => {
    return Object.values(loadingStates).some(Boolean)
  }, [loadingStates])

  const executeWithKey = useCallback(async <T>(
    key: string,
    asyncFn: () => Promise<T>,
    options: LoadingStateOptions = {}
  ): Promise<T | null> => {
    setLoading(key, true)
    
    try {
      const result = await asyncFn()
      
      if (options.showSuccessToast && options.successMessage) {
        showToast.success(options.successMessage)
      }
      
      return result
    } catch (error) {
      ErrorHandler.handle(error as Error, options.errorContext, options.showErrorToast)
      return null
    } finally {
      setLoading(key, false)
    }
  }, [setLoading])

  return {
    loadingStates,
    setLoading,
    isLoading,
    isAnyLoading,
    executeWithKey
  }
}