import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, 
  Send, 
  Paperclip, 
  Smile, 
  Phone, 
  Video,
  MoreVertical,
  Search,
  Filter,
  Plus,
  Users,
  Bell,
  BellOff
} from 'lucide-react';
import { isFeatureEnabled } from '../../../config/features';
import { buildApiUrl } from '../../../config/api';
import './CommunicationCenter.css';

const CommunicationCenter = () => {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  
  const messagesEndRef = useRef(null);
  const wsRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  
  const conversationStatuses = [
    { id: 'all', label: 'All Conversations' },
    { id: 'active', label: 'Active' },
    { id: 'resolved', label: 'Resolved' },
    { id: 'archived', label: 'Archived' }
  ];
  
  const messageTypes = {
    text: 'text',
    image: 'image',
    file: 'file',
    system: 'system'
  };
  
  useEffect(() => {
    fetchConversations();
    initializeWebSocket();
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);
  
  useEffect(() => {
    if (activeConversation) {
      fetchMessages(activeConversation.id);
    }
  }, [activeConversation]);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const initializeWebSocket = () => {
    if (!isFeatureEnabled('COMMUNICATION_SYSTEM')) {
      return;
    }
    
    try {
      const wsUrl = process.env.NODE_ENV === 'development' 
        ? 'ws://localhost:8000/ws/communication/'
        : `wss://${window.location.host}/ws/communication/`;
      
      wsRef.current = new WebSocket(wsUrl);
      
      wsRef.current.onopen = () => {
      };
      
      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleWebSocketMessage(data);
        } catch (error) {
        }
      };
      
      wsRef.current.onerror = (error) => {
      };
      
      wsRef.current.onclose = () => {
        // Attempt to reconnect after 5 seconds
        setTimeout(initializeWebSocket, 5000);
      };
    } catch (error) {
    }
  };
  
  const handleWebSocketMessage = (data) => {
    switch (data.type) {
      case 'new_message':
        if (data.conversation_id === activeConversation?.id) {
          setMessages(prev => [...prev, data.message]);
        }
        updateConversationLastMessage(data.conversation_id, data.message);
        break;
      case 'typing':
        if (data.conversation_id === activeConversation?.id) {
          setTypingUsers(prev => [...prev.filter(u => u.id !== data.user.id), data.user]);
          setTimeout(() => {
            setTypingUsers(prev => prev.filter(u => u.id !== data.user.id));
          }, 3000);
        }
        break;
      case 'conversation_updated':
        updateConversation(data.conversation);
        break;
      default:
    }
  };
  
  const fetchConversations = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(buildApiUrl('/hq/api/communication/conversations/'), {
        headers: {
          'Authorization': `Token ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations || []);
      } else {
        throw new Error('Failed to fetch conversations');
      }
    } catch (err) {
      setError('Failed to load conversations');
      
      // Fallback to cached conversations
      const cached = localStorage.getItem('conversations_cache');
      if (cached) {
        setConversations(JSON.parse(cached));
      }
    } finally {
      setLoading(false);
    }
  };
  
  const fetchMessages = async (conversationId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(buildApiUrl(`/hq/api/communication/conversations/${conversationId}/messages/`), {
        headers: {
          'Authorization': `Token ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      } else {
        throw new Error('Failed to fetch messages');
      }
    } catch (error) {
      setMessages([]);
    }
  };
  
  const sendMessage = async () => {
    if (!newMessage.trim() || !activeConversation) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(buildApiUrl(`/hq/api/communication/conversations/${activeConversation.id}/messages/`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify({
          content: newMessage.trim(),
          type: messageTypes.text
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, data.message]);
        setNewMessage('');
        
        // Send typing stop
        sendTypingEvent(false);
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      alert('Failed to send message. Please try again.');
    }
  };
  
  const sendTypingEvent = (isTyping) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && activeConversation) {
      wsRef.current.send(JSON.stringify({
        type: 'typing',
        conversation_id: activeConversation.id,
        is_typing: isTyping
      }));
    }
  };
  
  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    // Send typing start
    if (!isTyping) {
      setIsTyping(true);
      sendTypingEvent(true);
    }
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      sendTypingEvent(false);
    }, 1000);
  };
  
  const updateConversation = (updatedConversation) => {
    setConversations(prev => 
      prev.map(conv => 
        conv.id === updatedConversation.id ? updatedConversation : conv
      )
    );
  };
  
  const updateConversationLastMessage = (conversationId, message) => {
    setConversations(prev => 
      prev.map(conv => 
        conv.id === conversationId 
          ? { ...conv, last_message: message, updated_at: message.created_at }
          : conv
      )
    );
  };
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
  
  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.participants.some(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) || conv.subject?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || conv.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });
  
  if (loading) {
    return (
      <div className="communication-loading">
        <div className="loading-spinner"></div>
        <p>Loading conversations...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="communication-error">
        <p>{error}</p>
        <button onClick={fetchConversations} className="retry-btn">
          Try Again
        </button>
      </div>
    );
  }
  
  return (
    <div className="communication-center">
      <div className="communication-header">
        <div className="communication-title">
          <MessageCircle size={24} />
          <h2>Communication Center</h2>
        </div>
        
        <div className="communication-actions">
          <button className="new-conversation-btn">
            <Plus size={16} />
            New Conversation
          </button>
        </div>
      </div>
      
      <div className="communication-layout">
        {/* Conversations Sidebar */}
        <div className="conversations-sidebar">
          <div className="conversations-header">
            <div className="search-section">
              <div className="search-input">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="filter-section">
              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                {conversationStatuses.map(status => (
                  <option key={status.id} value={status.id}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="conversations-list">
            {filteredConversations.length === 0 ? (
              <div className="empty-conversations">
                <MessageCircle size={32} />
                <p>No conversations found</p>
              </div>
            ) : (
              filteredConversations.map(conversation => (
                <div
                  key={conversation.id}
                  className={`conversation-item ${activeConversation?.id === conversation.id ? 'active' : ''}`}
                  onClick={() => setActiveConversation(conversation)}
                >
                  <div className="conversation-avatar">
                    <Users size={16} />
                  </div>
                  
                  <div className="conversation-content">
                    <div className="conversation-header">
                      <h4 className="conversation-title">
                        {conversation.subject || 'Untitled Conversation'}
                      </h4>
                      <span className="conversation-time">
                        {formatDate(conversation.updated_at)}
                      </span>
                    </div>
                    
                    <p className="conversation-preview">
                      {conversation.last_message?.content || 'No messages yet'}
                    </p>
                    
                    <div className="conversation-meta">
                      <span className={`conversation-status ${conversation.status}`}>
                        {conversation.status}
                      </span>
                      {conversation.unread_count > 0 && (
                        <span className="unread-badge">
                          {conversation.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* Messages Area */}
        <div className="messages-area">
          {activeConversation ? (
            <>
              <div className="messages-header">
                <div className="conversation-info">
                  <h3>{activeConversation.subject || 'Untitled Conversation'}</h3>
                  <p>{activeConversation.participants.length} participants</p>
                </div>
                
                <div className="conversation-actions">
                  <button className="action-btn" title="Call">
                    <Phone size={16} />
                  </button>
                  <button className="action-btn" title="Video Call">
                    <Video size={16} />
                  </button>
                  <button className="action-btn" title="More">
                    <MoreVertical size={16} />
                  </button>
                </div>
              </div>
              
              <div className="messages-list">
                {messages.length === 0 ? (
                  <div className="empty-messages">
                    <MessageCircle size={48} />
                    <p>No messages yet</p>
                    <p>Start the conversation!</p>
                  </div>
                ) : (
                  messages.map(message => (
                    <div key={message.id} className={`message-item ${message.is_own ? 'own' : 'other'}`}>
                      <div className="message-content">
                        <div className="message-text">{message.content}</div>
                        <div className="message-meta">
                          <span className="message-time">
                            {formatDate(message.created_at)}
                          </span>
                          {message.is_own && (
                            <span className="message-status">
                              {message.status === 'sent' ? '✓' : '✓✓'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                
                {typingUsers.length > 0 && (
                  <div className="typing-indicator">
                    <div className="typing-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                    <span>
                      {typingUsers.map(u => u.name).join(', ')} typing...
                    </span>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
              
              <div className="message-input">
                <div className="input-actions">
                  <button className="input-btn" title="Attach File">
                    <Paperclip size={16} />
                  </button>
                  <button className="input-btn" title="Emoji">
                    <Smile size={16} />
                  </button>
                </div>
                
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={handleTyping}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                />
                
                <button 
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="send-btn"
                >
                  <Send size={16} />
                </button>
              </div>
            </>
          ) : (
            <div className="no-conversation">
              <MessageCircle size={64} />
              <h3>Select a Conversation</h3>
              <p>Choose a conversation from the sidebar to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommunicationCenter;

