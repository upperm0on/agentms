// Enhanced API configuration for new features
import { buildApiUrl } from './api';

// Enhanced API endpoints
export const ENHANCED_API_ENDPOINTS = {
  // Advanced Search
  ADVANCED_SEARCH: '/hq/api/v2/search/',
  SEARCH_HISTORY: '/hq/api/v2/search/history/',
  SAVED_SEARCHES: '/hq/api/v2/search/saved/',
  
  // Notifications
  NOTIFICATIONS: '/hq/api/v2/notifications/',
  NOTIFICATION_PREFERENCES: '/hq/api/v2/notifications/preferences/',
  MARK_NOTIFICATION_READ: (id) => `/hq/api/v2/notifications/${id}/read/`,
  MARK_ALL_READ: '/hq/api/v2/notifications/mark-all-read/',
  DELETE_NOTIFICATION: (id) => `/hq/api/v2/notifications/${id}/`,
  
  // Enhanced Analytics
  ENHANCED_ANALYTICS: '/hq/api/v2/analytics/',
  ANALYTICS_EXPORT: '/hq/api/v2/analytics/export/',
  ANALYTICS_REPORTS: '/hq/api/v2/analytics/reports/',
  
  // Document Management
  DOCUMENTS: '/hq/api/v2/documents/',
  DOCUMENT_UPLOAD: '/hq/api/v2/documents/upload/',
  DOCUMENT_DOWNLOAD: (id) => `/hq/api/v2/documents/${id}/download/`,
  DOCUMENT_SHARE: (id) => `/hq/api/v2/documents/${id}/share/`,
  DOCUMENT_DELETE: (id) => `/hq/api/v2/documents/${id}/`,
  BULK_DELETE: '/hq/api/v2/documents/bulk-delete/',
  
  // Communication
  CONVERSATIONS: '/hq/api/v2/communication/conversations/',
  CONVERSATION_MESSAGES: (id) => `/hq/api/v2/communication/conversations/${id}/messages/`,
  SEND_MESSAGE: (id) => `/hq/api/v2/communication/conversations/${id}/messages/`,
  CREATE_CONVERSATION: '/hq/api/v2/communication/conversations/',
  
  // WebSocket endpoints
  WS_NOTIFICATIONS: process.env.NODE_ENV === 'development' 
    ? 'ws://localhost:8000/ws/notifications/'
    : `wss://${window.location.host}/ws/notifications/`,
  WS_COMMUNICATION: process.env.NODE_ENV === 'development' 
    ? 'ws://localhost:8000/ws/communication/'
    : `wss://${window.location.host}/ws/communication/`,
};

// Safe API call with fallback
export const safeEnhancedApiCall = async (endpoint, options = {}) => {
  try {
    const response = await fetch(buildApiUrl(endpoint), {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${localStorage.getItem('token')}`,
        ...options.headers,
      },
    });
    
    if (response.ok) {
      return await response.json();
    } else {
      throw new Error(`API call failed: ${response.status}`);
    }
  } catch (error) {
    throw error;
  }
};

// WebSocket connection manager
export class WebSocketManager {
  constructor(url, onMessage, onError, onClose) {
    this.url = url;
    this.onMessage = onMessage;
    this.onError = onError;
    this.onClose = onClose;
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
  }
  
  connect() {
    try {
      this.ws = new WebSocket(this.url);
      
      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
      };
      
      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.onMessage(data);
        } catch (error) {
        }
      };
      
      this.ws.onerror = (error) => {
        this.onError(error);
      };
      
      this.ws.onclose = (event) => {
        this.onClose(event);
        
        // Attempt to reconnect if not a clean close
        if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
          setTimeout(() => {
            this.reconnectAttempts++;
            this.connect();
          }, this.reconnectDelay * this.reconnectAttempts);
        }
      };
    } catch (error) {
      this.onError(error);
    }
  }
  
  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
    }
  }
  
  disconnect() {
    if (this.ws) {
      this.ws.close(1000, 'User disconnected');
      this.ws = null;
    }
  }
}

// Feature-specific API helpers
export const enhancedApiHelpers = {
  // Search helpers
  search: {
    async performAdvancedSearch(criteria) {
      return safeEnhancedApiCall(ENHANCED_API_ENDPOINTS.ADVANCED_SEARCH, {
        method: 'POST',
        body: JSON.stringify(criteria),
      });
    },
    
    async getSearchHistory() {
      return safeEnhancedApiCall(ENHANCED_API_ENDPOINTS.SEARCH_HISTORY);
    },
    
    async saveSearch(searchData) {
      return safeEnhancedApiCall(ENHANCED_API_ENDPOINTS.SAVED_SEARCHES, {
        method: 'POST',
        body: JSON.stringify(searchData),
      });
    },
  },
  
  // Notification helpers
  notifications: {
    async getNotifications() {
      return safeEnhancedApiCall(ENHANCED_API_ENDPOINTS.NOTIFICATIONS);
    },
    
    async markAsRead(notificationId) {
      return safeEnhancedApiCall(ENHANCED_API_ENDPOINTS.MARK_NOTIFICATION_READ(notificationId), {
        method: 'POST',
      });
    },
    
    async markAllAsRead() {
      return safeEnhancedApiCall(ENHANCED_API_ENDPOINTS.MARK_ALL_READ, {
        method: 'POST',
      });
    },
    
    async deleteNotification(notificationId) {
      return safeEnhancedApiCall(ENHANCED_API_ENDPOINTS.DELETE_NOTIFICATION(notificationId), {
        method: 'DELETE',
      });
    },
  },
  
  // Analytics helpers
  analytics: {
    async getEnhancedAnalytics(dateRange, metrics) {
      return safeEnhancedApiCall(ENHANCED_API_ENDPOINTS.ENHANCED_ANALYTICS, {
        method: 'POST',
        body: JSON.stringify({ date_range: dateRange, metrics }),
      });
    },
    
    async exportAnalytics(format, dateRange, metrics) {
      const response = await fetch(buildApiUrl(ENHANCED_API_ENDPOINTS.ANALYTICS_EXPORT), {
        method: 'POST',
        headers: {
          'Authorization': `Token ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ format, date_range: dateRange, metrics }),
      });
      
      if (response.ok) {
        return await response.blob();
      } else {
        throw new Error('Export failed');
      }
    },
  },
  
  // Document helpers
  documents: {
    async getDocuments() {
      return safeEnhancedApiCall(ENHANCED_API_ENDPOINTS.DOCUMENTS);
    },
    
    async uploadDocuments(files, categories) {
      const formData = new FormData();
      files.forEach((file, index) => {
        formData.append('files', file);
        formData.append('categories', categories[index] || 'other');
      });
      
      const response = await fetch(buildApiUrl(ENHANCED_API_ENDPOINTS.DOCUMENT_UPLOAD), {
        method: 'POST',
        headers: {
          'Authorization': `Token ${localStorage.getItem('token')}`,
        },
        body: formData,
      });
      
      if (response.ok) {
        return await response.json();
      } else {
        throw new Error('Upload failed');
      }
    },
    
    async downloadDocument(documentId) {
      const response = await fetch(buildApiUrl(ENHANCED_API_ENDPOINTS.DOCUMENT_DOWNLOAD(documentId)), {
        headers: {
          'Authorization': `Token ${localStorage.getItem('token')}`,
        },
      });
      
      if (response.ok) {
        return await response.blob();
      } else {
        throw new Error('Download failed');
      }
    },
    
    async shareDocument(documentId, expiresIn = 7) {
      return safeEnhancedApiCall(ENHANCED_API_ENDPOINTS.DOCUMENT_SHARE(documentId), {
        method: 'POST',
        body: JSON.stringify({ expires_in: expiresIn }),
      });
    },
    
    async deleteDocument(documentId) {
      return safeEnhancedApiCall(ENHANCED_API_ENDPOINTS.DOCUMENT_DELETE(documentId), {
        method: 'DELETE',
      });
    },
    
    async bulkDelete(documentIds) {
      return safeEnhancedApiCall(ENHANCED_API_ENDPOINTS.BULK_DELETE, {
        method: 'POST',
        body: JSON.stringify({ document_ids: documentIds }),
      });
    },
  },
  
  // Communication helpers
  communication: {
    async getConversations() {
      return safeEnhancedApiCall(ENHANCED_API_ENDPOINTS.CONVERSATIONS);
    },
    
    async getMessages(conversationId) {
      return safeEnhancedApiCall(ENHANCED_API_ENDPOINTS.CONVERSATION_MESSAGES(conversationId));
    },
    
    async sendMessage(conversationId, content, type = 'text') {
      return safeEnhancedApiCall(ENHANCED_API_ENDPOINTS.SEND_MESSAGE(conversationId), {
        method: 'POST',
        body: JSON.stringify({ content, type }),
      });
    },
    
    async createConversation(participants, subject) {
      return safeEnhancedApiCall(ENHANCED_API_ENDPOINTS.CREATE_CONVERSATION, {
        method: 'POST',
        body: JSON.stringify({ participants, subject }),
      });
    },
  },
};

export default {
  ENHANCED_API_ENDPOINTS,
  safeEnhancedApiCall,
  WebSocketManager,
  enhancedApiHelpers,
};

