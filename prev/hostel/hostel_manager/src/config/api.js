// API Configuration
// This file centralizes API endpoint configuration for easier environment management

// Get the base URL from environment variables or use relative paths by default
const getBaseURL = () => {
  // Check for production environment
  const isProduction = import.meta.env.PROD;

  // If VITE_API_BASE_URL is set, use it
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  // For production, use relative paths to avoid CORS issues
  if (isProduction) {
    return ''; // Use relative paths in production
  }

  // For development, use local API server on port 8080
  return 'http://localhost:8000';
};

// API endpoints configuration
export const API_ENDPOINTS = {
  // Authentication endpoints
  LOGIN: '/hq/api/login/',
  GOOGLE_OAUTH: '/hq/api/google-oauth/',
  SIGNUP: '/hq/api/signup/',
  LANDING_PAGE: '/hq/api/landing_page/',
  RESEND_VERIFICATION: '/hq/api/resend-verification/',
  VERIFY_EMAIL: '/hq/api/verify-email/',
  CHAT: '/hq/api/chat/',

  // Hostel endpoints
  HOSTELS: '/hq/api/hostels/',
  SEARCH_REQUEST: '/hq/api/search_request/',

  // Payment endpoints
  PAYMENTS: '/hq/api/payments/',
  PAYMENT_VERIFY: '/hq/api/payments/verify/',
  CONSUMER_REQUEST: '/hq/api/payments/consumer_request/',

  // Reservation endpoints
  RESERVATIONS_CREATE: '/hq/api/reservations/create/',
  RESERVATIONS_LIST: '/hq/api/reservations/list/',
  RESERVATIONS_DELETE: '/hq/api/reservations/delete/',
  RESERVATIONS_PAYMENT_INITIATE: '/hq/api/reservations/payment/initiate/',
  RESERVATIONS_PAYMENT_VERIFY: '/hq/api/reservations/payment/verify/',

  // Review endpoints
  REVIEWS_CREATE: '/hq/api/reviews/create/',
  REVIEWS_GET: '/hq/api/reviews/',

  // Media endpoints
  MEDIA_BASE: '/media/',
  ROOM_IMAGES: '/media/room_images',

  // Profile management endpoints
  PROFILE_SWITCH: '/hq/api/profile/switch/',
  AVAILABLE_PROFILES: '/hq/api/profile/available/',
  MANAGER_PROFILE: '/hq/api/manager/profile/',
  ADMIN_PROFILE: '/hq/api/admin/profile/',
};

// Helper function to build full API URLs
export const buildApiUrl = (endpoint) => {
  if (!endpoint) return '';
  let epStr = String(endpoint).trim();
  // If it looks like '/https://...' or '//https://...', strip leading slashes before absolute check
  epStr = epStr.replace(/^\/+((?:https?:)?\/\/)/i, '$1');
  // Absolute or protocol-relative
  if (/^(?:https?:)?\/\//i.test(epStr)) {
    // If protocol-relative, assume https
    return epStr.startsWith('http') ? epStr : `https:${epStr}`;
  }
  const baseURL = String(getBaseURL() || '').replace(/\/+$/, '');
  const ep = epStr.startsWith('/') ? epStr : `/${epStr}`;
  return `${baseURL}${ep}`;
};

// Helper function to build media URLs
export const buildMediaUrl = (path) => {
  if (!path) return '';
  let pStr = String(path).trim();
  // If it looks like '/https://...' or '//https://...', strip leading slashes before absolute check
  pStr = pStr.replace(/^\/+((?:https?:)?\/\/)/i, '$1');
  // Absolute or protocol-relative
  if (/^(?:https?:)?\/\//i.test(pStr)) {
    // If protocol-relative, assume https
    return pStr.startsWith('http') ? pStr : `https:${pStr}`;
  }
  const baseURL = String(getBaseURL() || '').replace(/\/+$/, '');
  const p = pStr.startsWith('/') ? pStr : `/${pStr}`;
  return `${baseURL}${p}`;
};

// Environment variable usage
// - VITE_API_BASE_URL=http://localhost:8080: Uses absolute URLs for development (overrides default)
// - VITE_API_BASE_URL=https://api.example.com: Uses production URLs

// Default export for easy importing
export default {
  endpoints: API_ENDPOINTS,
  buildApiUrl,
  buildMediaUrl,
  getBaseURL,
};
