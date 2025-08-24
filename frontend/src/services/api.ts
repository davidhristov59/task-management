import axios, { AxiosError } from 'axios';
import type { ApiError } from '../types';

// Extend AxiosRequestConfig to include metadata
declare module 'axios' {
  interface AxiosRequestConfig {
    metadata?: {
      startTime: Date;
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

// Request interceptor for adding auth tokens or other headers
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add request timestamp for debugging
    config.metadata = { startTime: new Date() };
    
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
  (error: AxiosError) => {
    // Create standardized error object
    const apiError: ApiError = {
      message: 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR',
      details: error.response?.data
    };

    // Handle specific error cases
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response as { status: number; data: any };
      
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
          // You can dispatch a logout action here if using Redux/Zustand
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
      
    } else if (error.request) {
      // Network error - no response received
      apiError.message = 'Network error. Please check your connection and try again.';
      apiError.code = 'NETWORK_ERROR';
    } else {
      // Request setup error
      apiError.message = error.message || 'Request configuration error';
      apiError.code = 'REQUEST_ERROR';
    }

    // Log error for debugging
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: apiError.message,
      details: apiError.details
    });

    // Attach the standardized error to the original error
    (error as any).apiError = apiError;
    
    return Promise.reject(error);
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