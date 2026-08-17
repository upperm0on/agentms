import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, AlertCircle, Info, CheckCircle } from 'lucide-react';
import { isFeatureEnabled } from '../../../config/features';
import { buildApiUrl } from '../../../config/api';
import ProfileSwitcher from '../../common/ProfileSwitcher';
import './NotificationCenter.css';

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const wsRef = useRef(null);
  const pollingIntervalRef = useRef(null);
  
  const notificationTypes = {
    info: { icon: Info, color: '#3b82f6' },
    success: { icon: CheckCircle, color: '#10b981' },
    warning: { icon: AlertCircle, color: '#f59e0b' },
    error: { icon: AlertCircle, color: '#ef4444' }
  };
  
  useEffect(() => {
    // Load notifications from localStorage
    const savedNotifications = localStorage.getItem('notifications');
    if (savedNotifications) {
      const parsed = JSON.parse(savedNotifications);
      setNotifications(parsed);
      setUnreadCount(parsed.filter(n => !n.read).length);
    }
    
    // Initialize notification system
    initializeNotifications();
    
    return () => {
      // Cleanup
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);
  
  const initializeNotifications = async () => {
    if (isFeatureEnabled('NOTIFICATIONS')) {
      try {
        // Try WebSocket connection first
        await initializeWebSocket();
      } catch (error) {
        initializePolling();
      }
    } else {
      // Use basic polling
      initializePolling();
    }
  };
  
  const initializeWebSocket = () => {
    return new Promise((resolve, reject) => {
      try {
        const wsUrl = process.env.NODE_ENV === 'development' 
          ? 'ws://localhost:8000/ws/notifications/'
          : `wss://${window.location.host}/ws/notifications/`;
        
        wsRef.current = new WebSocket(wsUrl);
        
        wsRef.current.onopen = () => {
          setIsConnected(true);
          resolve();
        };
        
        wsRef.current.onmessage = (event) => {
          try {
            const notification = JSON.parse(event.data);
            addNotification(notification);
          } catch (error) {
          }
        };
        
        wsRef.current.onerror = (error) => {
          reject(error);
        };
        
        wsRef.current.onclose = () => {
          setIsConnected(false);
          // Fallback to polling
          initializePolling();
        };
        
      } catch (error) {
        reject(error);
      }
    });
  };
  
  const initializePolling = () => {
    // Poll for notifications every 30 seconds
    pollingIntervalRef.current = setInterval(async () => {
      await fetchNotifications();
    }, 30000);
    
    // Initial fetch
    fetchNotifications();
  };
  
  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const response = await fetch(buildApiUrl('/hq/api/notifications/'), {
        headers: {
          'Authorization': `Token ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unread_count || 0);
        
        // Save to localStorage
        localStorage.setItem('notifications', JSON.stringify(data.notifications || []));
      } else {
        throw new Error('Failed to fetch notifications');
      }
    } catch (error) {
      setError('Failed to load notifications');
      
      // Fallback to cached notifications
      const cached = localStorage.getItem('notifications');
      if (cached) {
        const parsed = JSON.parse(cached);
        setNotifications(parsed);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const addNotification = (notification) => {
    const newNotification = {
      id: notification.id || Date.now(),
      title: notification.title,
      message: notification.message,
      type: notification.type || 'info',
      read: false,
      createdAt: notification.created_at || new Date().toISOString(),
      data: notification.data || {}
    };
    
    setNotifications(prev => {
      const updated = [newNotification, ...prev];
      localStorage.setItem('notifications', JSON.stringify(updated));
      return updated;
    });
    
    setUnreadCount(prev => prev + 1);
    
    // Show browser notification if permission granted
    if (Notification.permission === 'granted') {
      new Notification(newNotification.title, {
        body: newNotification.message,
        icon: '/favicon.ico'
      });
    }
  };
  
  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(buildApiUrl(`/hq/api/notifications/${notificationId}/read/`), {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`
        }
      });
      
      if (response.ok) {
        setNotifications(prev => {
          const updated = prev.map(n => 
            n.id === notificationId ? { ...n, read: true } : n
          );
          localStorage.setItem('notifications', JSON.stringify(updated));
          return updated;
        });
        
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
    }
  };
  
  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(buildApiUrl('/hq/api/notifications/mark-all-read/'), {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`
        }
      });
      
      if (response.ok) {
        setNotifications(prev => {
          const updated = prev.map(n => ({ ...n, read: true }));
          localStorage.setItem('notifications', JSON.stringify(updated));
          return updated;
        });
        setUnreadCount(0);
      }
    } catch (error) {
    }
  };
  
  const deleteNotification = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(buildApiUrl(`/hq/api/notifications/${notificationId}/`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Token ${token}`
        }
      });
      
      if (response.ok) {
        setNotifications(prev => {
          const updated = prev.filter(n => n.id !== notificationId);
          localStorage.setItem('notifications', JSON.stringify(updated));
          return updated;
        });
        
        // Update unread count
        const deletedNotification = notifications.find(n => n.id === notificationId);
        if (deletedNotification && !deletedNotification.read) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    } catch (error) {
    }
  };
  
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  };
  
  const toggleNotificationCenter = () => {
    setIsOpen(!isOpen);
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };
  
  return (
    <div className="notification-center">
      <button 
        className="notification-bell"
        onClick={toggleNotificationCenter}
        title="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </button>
      
      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Notifications</h3>
            <div className="notification-actions">
              {unreadCount > 0 && (
                <button 
                  onClick={markAllAsRead}
                  className="mark-all-read-btn"
                >
                  Mark all read
                </button>
              )}
              <button 
                onClick={toggleNotificationCenter}
                className="close-btn"
              >
                <X size={16} />
              </button>
            </div>
          </div>
          
          <div className="notification-list">
            {isLoading ? (
              <div className="loading">Loading notifications...</div>
            ) : error ? (
              <div className="error">Failed to load notifications</div>
            ) : notifications.length === 0 ? (
              <div className="empty">No notifications</div>
            ) : (
              notifications.map(notification => {
                const typeConfig = notificationTypes[notification.type] || notificationTypes.info;
                const IconComponent = typeConfig.icon;
                
                return (
                  <div 
                    key={notification.id}
                    className={`notification-item ${!notification.read ? 'unread' : ''}`}
                  >
                    <div className="notification-icon">
                      <IconComponent size={16} color={typeConfig.color} />
                    </div>
                    <div className="notification-content">
                      <div className="notification-title">{notification.title}</div>
                      <div className="notification-message">{notification.message}</div>
                      <div className="notification-time">
                        {formatDate(notification.createdAt)}
                      </div>
                    </div>
                    <div className="notification-actions">
                      {!notification.read && (
                        <button 
                          onClick={() => markAsRead(notification.id)}
                          className="mark-read-btn"
                          title="Mark as read"
                        >
                          <Check size={14} />
                        </button>
                      )}
                      <button 
                        onClick={() => deleteNotification(notification.id)}
                        className="delete-btn"
                        title="Delete"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          
          {notifications.length > 0 && (
            <div className="notification-footer">
              <ProfileSwitcher />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;

