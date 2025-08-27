import { AxiosError } from 'axios';
import type { ApiError } from '../types';
import { showToast } from '../components/ui/toast';


interface ErrorReport {
  error: Error;
  context?: string;
  userId?: string;
  timestamp: Date;
  url: string;
  userAgent: string;
  additionalInfo?: Record<string, any>;
}

class ErrorReportingService {
  private reports: ErrorReport[] = [];

  report(error: Error, context?: string, additionalInfo?: Record<string, any>) {
    const report: ErrorReport = {
      error,
      context,
      timestamp: new Date(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      additionalInfo
    };

    this.reports.push(report);
    
    
    console.error('Error reported:', report);
    
    
    
  }

  getReports() {
    return [...this.reports];
  }

  clearReports() {
    this.reports = [];
  }
}

export const errorReporter = new ErrorReportingService();


export class ErrorHandler {
  static handle(error: any, context?: string, showToastMessage = true): ApiError {
    const apiError = this.extractApiError(error);
    
    
    errorReporter.report(error, context, { apiError });
    
    
    if (showToastMessage) {
      this.showErrorToast(apiError, context);
    }
    
    return apiError;
  }

  static extractApiError(error: any): ApiError {
    
    if (error.message && error.code) {
      return error as ApiError;
    }

    
    if ((error as any).apiError) {
      return (error as any).apiError;
    }

    
    if (error.isAxiosError || error.response) {
      const axiosError = error as AxiosError;
      
      if (axiosError.response) {
        const status = axiosError.response.status;
        const data = axiosError.response.data as any;
        
        return {
          message: data?.message || this.getDefaultErrorMessage(status),
          code: data?.code || `HTTP_${status}`,
          details: data
        };
      } else if (axiosError.request) {
        return {
          message: 'Network error. Please check your connection.',
          code: 'NETWORK_ERROR',
          details: axiosError.request
        };
      }
    }

    
    return {
      message: error.message || 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR',
      details: error
    };
  }

  static showErrorToast(apiError: ApiError, context?: string) {
    const message = context 
      ? `${context}: ${apiError.message}`
      : apiError.message;

    
    if (apiError.code === 'NETWORK_ERROR') {
      showToast.warning(message);
    } else if (apiError.code?.startsWith('HTTP_5')) {
      showToast.error(`Server error: ${apiError.message}`);
    } else {
      showToast.error(message);
    }
  }

  static getDefaultErrorMessage(status: number): string {
    switch (status) {
      case 400: return 'Invalid request. Please check your input.';
      case 401: return 'Authentication required. Please log in.';
      case 403: return 'You do not have permission to perform this action.';
      case 404: return 'The requested resource was not found.';
      case 409: return 'A conflict occurred. The resource may already exist.';
      case 422: return 'Validation failed. Please check your input.';
      case 429: return 'Too many requests. Please try again later.';
      case 500: return 'Internal server error. Please try again later.';
      case 502:
      case 503:
      case 504: return 'Service temporarily unavailable. Please try again later.';
      default: return `Server error (${status})`;
    }
  }

  
  static async handleAsync<T>(
    promise: Promise<T>, 
    context?: string,
    showToast = true
  ): Promise<[T | null, ApiError | null]> {
    try {
      const result = await promise;
      return [result, null];
    } catch (error) {
      const apiError = this.handle(error, context, showToast);
      return [null, apiError];
    }
  }

  
  static wrap<T extends any[], R>(
    fn: (...args: T) => R,
    context?: string,
    showToast = true
  ) {
    return (...args: T): R | null => {
      try {
        return fn(...args);
      } catch (error) {
        this.handle(error, context, showToast);
        return null;
      }
    };
  }
}


export function setupGlobalErrorHandlers() {
  
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    errorReporter.report(
      event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
      'Unhandled Promise Rejection'
    );
    
    
    event.preventDefault();
  });

  
  window.addEventListener('error', (event) => {
    console.error('Uncaught error:', event.error);
    errorReporter.report(
      event.error || new Error(event.message),
      'Uncaught Error',
      {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      }
    );
  });
}


export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000,
  context?: string
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries) {
        break; 
      }
      
      
      const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
      
      console.warn(`${context || 'Operation'} failed (attempt ${attempt + 1}/${maxRetries + 1}), retrying in ${delay}ms...`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}