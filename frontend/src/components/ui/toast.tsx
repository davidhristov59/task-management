import toast, { Toaster, type ToastOptions } from 'react-hot-toast'
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react'

// Custom toast component with consistent styling
const CustomToast = ({ 
  message, 
  type, 
  onDismiss 
}: { 
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  onDismiss: () => void 
}) => {
  const icons = {
    success: <CheckCircle className="h-5 w-5 text-green-600" />,
    error: <XCircle className="h-5 w-5 text-red-600" />,
    warning: <AlertCircle className="h-5 w-5 text-yellow-600" />,
    info: <Info className="h-5 w-5 text-blue-600" />
  }

  const bgColors = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200', 
    warning: 'bg-yellow-50 border-yellow-200',
    info: 'bg-blue-50 border-blue-200'
  }

  return (
    <div className={`flex items-center gap-3 p-4 rounded-lg border ${bgColors[type]} shadow-lg max-w-md`}>
      {icons[type]}
      <span className="text-sm font-medium text-gray-900 flex-1">{message}</span>
      <button
        onClick={onDismiss}
        className="text-gray-400 hover:text-gray-600 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

// Toast utility functions
export const showToast = {
  success: (message: string, options?: ToastOptions) => {
    return toast.custom(
      (t) => (
        <CustomToast 
          message={message} 
          type="success" 
          onDismiss={() => toast.dismiss(t.id)} 
        />
      ),
      { duration: 4000, ...options }
    )
  },

  error: (message: string, options?: ToastOptions) => {
    return toast.custom(
      (t) => (
        <CustomToast 
          message={message} 
          type="error" 
          onDismiss={() => toast.dismiss(t.id)} 
        />
      ),
      { duration: 6000, ...options }
    )
  },

  warning: (message: string, options?: ToastOptions) => {
    return toast.custom(
      (t) => (
        <CustomToast 
          message={message} 
          type="warning" 
          onDismiss={() => toast.dismiss(t.id)} 
        />
      ),
      { duration: 5000, ...options }
    )
  },

  info: (message: string, options?: ToastOptions) => {
    return toast.custom(
      (t) => (
        <CustomToast 
          message={message} 
          type="info" 
          onDismiss={() => toast.dismiss(t.id)} 
        />
      ),
      { duration: 4000, ...options }
    )
  },

  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string
      success: string | ((data: T) => string)
      error: string | ((error: any) => string)
    },
    options?: ToastOptions
  ) => {
    return toast.promise(promise, messages, {
      style: {
        minWidth: '250px',
      },
      success: {
        duration: 4000,
        icon: '✅',
      },
      error: {
        duration: 6000,
        icon: '❌',
      },
      loading: {
        icon: '⏳',
      },
      ...options
    })
  }
}

// Toast provider component
export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      gutter={8}
      containerClassName=""
      containerStyle={{}}
      toastOptions={{
        className: '',
        duration: 4000,
        style: {
          background: 'transparent',
          boxShadow: 'none',
          padding: 0,
        },
      }}
    />
  )
}