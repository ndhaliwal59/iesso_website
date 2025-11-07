/**
 * API configuration utility
 * Uses environment variables for API base URL, with fallback to localhost for development
 */
export const getApiBaseUrl = (): string => {
  // In production, use environment variable for Render backend URL
  if (import.meta.env.PROD) {
    return import.meta.env.VITE_API_URL || '';
  }
  // Development: use localhost
  return import.meta.env.VITE_API_URL || 'http://localhost:8000';
};

export const API_BASE_URL = getApiBaseUrl();

