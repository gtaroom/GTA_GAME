/**
 * Simple toast utility that works with the existing notification system
 */

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastOptions {
  duration?: number;
}

/**
 * Show a toast notification using the existing notification system
 */
export function toast(message: string, type: ToastType = 'info', options: ToastOptions = {}) {
  // Use the existing API interceptor toast system
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('show-toast', {
      detail: { message, type, duration: options.duration || 3000 }
    }));
  }
  
  // Also log to console for development
  console.log(`Toast [${type}]: ${message}`);
}

/**
 * Convenience methods for different toast types
 */
export const toastSuccess = (message: string, options?: ToastOptions) => 
  toast(message, 'success', options);

export const toastError = (message: string, options?: ToastOptions) => 
  toast(message, 'error', options);

export const toastWarning = (message: string, options?: ToastOptions) => 
  toast(message, 'warning', options);

export const toastInfo = (message: string, options?: ToastOptions) => 
  toast(message, 'info', options);
