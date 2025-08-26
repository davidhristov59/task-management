import axios, { AxiosError, type AxiosRequestConfig } from 'axios';
import type { ApiError } from '../types';
import { showToast } from '../components/ui/toast';

// Extend AxiosRequestConfig to include metadata and retry options
declare module 'axios' {
  interface AxiosRequestConfig {
    metadata?: {
      startTime: Date;
      retryCount?: number;
    };
    skipErrorToast?: boolean;
    retryConfig?: {
      retries?: number;
      retryDelay?: number;
      retryCondition?: (error: AxiosError) => boolean;
    };
  }
}

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:8087',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Default retry configuration
const DEFAULT_RETRY_CONFIG = {
  retries: 3,
  retryDelay: 1000,
  retryCondition: (error: AxiosError) => {
    // Retry on network errors or 5xx server errors
    return !error.response || (error.response.status >= 500 && error.response.status < 600);
  }
};

// Retry interceptor
const retryInterceptor = async (error: AxiosError): Promise<any> => {
  const config = error.config as AxiosRequestConfig;
  
  if (!config) {
    return Promise.reject(error);
  }

  const retryConfig = { ...DEFAULT_RETRY_CONFIG, ...config.retryConfig };
  const currentRetryCount = config.metadata?.retryCount || 0;

  // Check if we should retry
  if (
    currentRetryCount < retryConfig.retries &&
    retryConfig.retryCondition(error)
  ) {
    // Update retry count
    config.metadata = {
      ...config.metadata,
      retryCount: currentRetryCount + 1,
      startTime: new Date()
    };

    // Calculate delay with exponential backoff
    const delay = retryConfig.retryDelay * Math.pow(2, currentRetryCount);
    
    // Show retry notification
    if (!config.skipErrorToast) {
      showToast.info(`Retrying request... (${currentRetryCount + 1}/${retryConfig.retries})`, {
        duration: delay
      });
    }

    // Wait before retry
    await new Promise(resolve => setTimeout(resolve, delay));

    // Retry the request
    return api.request(config);
  }

  return Promise.reject(error);
};

// Request interceptor for adding auth tokens or other headers
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Initialize metadata if not exists
    if (!config.metadata) {
      config.metadata = { startTime: new Date(), retryCount: 0 };
    }
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors globally
api.interceptors.response.use(
  (response) => {
    // Log response time for debugging
    const endTime = new Date();
    const startTime = response.config.metadata?.startTime;
    if (startTime) {
      const duration = endTime.getTime() - startTime.getTime();
      console.debug(`API call to ${response.config.url} took ${duration}ms`);
    }
    
    return response;
  },
  async (error: AxiosError) => {
    // Try retry logic first
    try {
      return await retryInterceptor(error);
    } catch (retryError) {
      // If retry fails or is not applicable, handle the error
      const finalError = retryError as AxiosError;
      
      // Create standardized error object
      const apiError: ApiError = {
        message: 'An unexpected error occurred',
        code: 'UNKNOWN_ERROR',
        details: finalError.response?.data
      };

      // Handle specific error cases
      if (finalError.response) {
        // Server responded with error status
        const { status, data } = finalError.response as { status: number; data: any };
        
        switch (status) {
          case 400:
            apiError.message = 'Invalid request. Please check your input.';
            apiError.code = 'BAD_REQUEST';
            break;
          case 401:
            apiError.message = 'Authentication required. Please log in.';
            apiError.code = 'UNAUTHORIZED';
            // Clear auth token and redirect to login
            localStorage.removeItem('authToken');
            break;
          case 403:
            apiError.message = 'You do not have permission to perform this action.';
            apiError.code = 'FORBIDDEN';
            break;
          case 404:
            apiError.message = 'The requested resource was not found.';
            apiError.code = 'NOT_FOUND';
            break;
          case 409:
            apiError.message = 'A conflict occurred. The resource may already exist.';
            apiError.code = 'CONFLICT';
            break;
          case 422:
            apiError.message = 'Validation failed. Please check your input.';
            apiError.code = 'VALIDATION_ERROR';
            break;
          case 429:
            apiError.message = 'Too many requests. Please try again later.';
            apiError.code = 'RATE_LIMITED';
            break;
          case 500:
            apiError.message = 'Internal server error. Please try again later.';
            apiError.code = 'INTERNAL_SERVER_ERROR';
            break;
          case 502:
          case 503:
          case 504:
            apiError.message = 'Service temporarily unavailable. Please try again later.';
            apiError.code = 'SERVICE_UNAVAILABLE';
            break;
          default:
            apiError.message = data?.message || `Server error (${status})`;
            apiError.code = `HTTP_${status}`;
        }
        
        // Use server-provided error message if available
        if (data?.message) {
          apiError.message = data.message;
        }
        
      } else if (finalError.request) {
        // Network error - no response received
        apiError.message = 'Network error. Please check your connection and try again.';
        apiError.code = 'NETWORK_ERROR';
      } else {
        // Request setup error
        apiError.message = finalError.message || 'Request configuration error';
        apiError.code = 'REQUEST_ERROR';
      }

      // Show error toast if not disabled
      const config = finalError.config as AxiosRequestConfig;
      if (!config?.skipErrorToast) {
        showToast.error(apiError.message);
      }

      // Log error for debugging
      console.error('API Error:', {
        url: finalError.config?.url,
        method: finalError.config?.method,
        status: finalError.response?.status,
        message: apiError.message,
        details: apiError.details,
        retryCount: config?.metadata?.retryCount || 0
      });

      // Attach the standardized error to the original error
      (finalError as any).apiError = apiError;
      
      return Promise.reject(finalError);
    }
  }
);

// Utility function to extract API error from axios error
export const getApiError = (error: any): ApiError => {
  if ((error as any).apiError) {
    return (error as any).apiError;
  }
  
  return {
    message: 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR',
    details: error
  };
};

// Utility function to check if error is a network error
export const isNetworkError = (error: any): boolean => {
  return (error as any).apiError?.code === 'NETWORK_ERROR' || !error.response;
};

// Utility function to check if error is a server error (5xx)
export const isServerError = (error: any): boolean => {
  return error.response?.status >= 500;
};

// Utility function to check if error is a client error (4xx)
export const isClientError = (error: any): boolean => {
  const status = error.response?.status;
  return status >= 400 && status < 500;
};

export default api;