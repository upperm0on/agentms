import React, { useState } from 'react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import HostelCard from '../components/hostel/HostelCard';
import YourReservation from '../components/dashboard/YourReservation';
import SimpleReservationModal from '../components/reservation/SimpleReservationModal';
import { buildApiUrl, API_ENDPOINTS } from '../config/api';
import { useAuthData } from '../hooks/useAuthData';
import { 
  Sparkles, Send, Search, Calendar, Bot, CreditCard, 
  Package, ShoppingCart, Bell, FileText, MessageSquare, Download 
} from 'lucide-react';
import '../assets/css/ChatAssistant.css';

export default function ChatAssistant() {
  const { token } = useAuthData();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  // States for active widget and layout configurations
  const [activeWidget, setActiveWidget] = useState(null);
  const [widgetData, setWidgetData] = useState(null);
  const [explanationLabel, setExplanationLabel] = useState('');
  const [layoutConfig, setLayoutConfig] = useState({
    columns: 2,
    theme_color: 'blue',
    display_density: 'comfortable',
    show_images: true,
    show_meta: true
  });

  // States for the Reservation Modal
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedHostel, setSelectedHostel] = useState(null);

  const handleSend = async (textToSend) => {
    const promptText = textToSend || input;
    if (!promptText.trim()) return;

    setLoading(true);
    if (!textToSend) setInput('');

    try {
      const response = await fetch(buildApiUrl(API_ENDPOINTS.CHAT), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token || localStorage.getItem('token')}`
        },
        body: JSON.stringify({ message: promptText })
      });

      if (!response.ok) {
        throw new Error('API Request failed');
      }

      const data = await response.json();

      setExplanationLabel(data.response_text || 'Generated result:');
      setActiveWidget(data.widget_type);
      setWidgetData(data.widget_data);
      if (data.layout_config) {
        setLayoutConfig(data.layout_config);
      }
    } catch (err) {
      setExplanationLabel('An error occurred. Please try again.');
      setActiveWidget('NONE');
      setWidgetData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (actionText) => {
    handleSend(actionText);
  };

  const handleOpenBooking = (hostel, room) => {
    setSelectedHostel(hostel);
    setSelectedRoom(room);
    setIsReservationModalOpen(true);
  };

  // Helper to map color string to hex
  const getThemeColorHex = () => {
    const colorMap = {
      blue: '#2563eb',
      indigo: '#4f46e5',
      emerald: '#10b981',
      violet: '#8b5cf6',
      slate: '#64748b'
    };
    return colorMap[layoutConfig?.theme_color] || '#2563eb';
  };

  // Build grid layout based on columns & density
  const getGridStyle = () => {
    const cols = layoutConfig?.columns || 2;
    let minWidth = '280px';
    if (cols === 1) minWidth = '100%';
    else if (cols === 3) minWidth = '240px';
    else if (cols >= 4) minWidth = '200px';

    return {
      display: 'grid',
      gridTemplateColumns: `repeat(auto-fit, minmax(${minWidth}, 1fr))`,
      gap: layoutConfig?.display_density === 'compact' ? '12px' : '20px',
      width: '100%'
    };
  };

  const renderWidget = (type, data) => {
    if (!data) return null;
    const themeColor = getThemeColorHex();
    const isCompact = layoutConfig?.display_density === 'compact';
    const showMeta = layoutConfig?.show_meta !== false;
    const showImages = layoutConfig?.show_images !== false;

    switch (type) {
      case 'WIDGET_HOSTEL_LIST':
        if (!data.hostels || data.hostels.length === 0) {
          return <div className="text-slate-500 italic text-center py-8">No hostels matched your search criteria.</div>;
        }
        return (
          <div style={getGridStyle()}>
            {data.hostels.map((hostel) => (
              <HostelCard key={hostel.id} hostel={hostel} layoutConfig={layoutConfig} />
            ))}
          </div>
        );

      case 'WIDGET_USER_RESERVATIONS':
        return <YourReservation />;

      case 'WIDGET_BOOKING_FORM':
        if (!data.rooms || data.rooms.length === 0) {
          return <div className="text-slate-500 italic text-center py-8">No room types available for this hostel.</div>;
        }
        const hostelObj = {
          id: data.hostelId,
          name: data.hostelName,
          room_details: data.rooms
        };
        return (
          <div style={{ 
            maxWidth: '600px', 
            margin: '0 auto', 
            background: '#ffffff', 
            padding: isCompact ? '16px' : '24px', 
            borderRadius: '16px', 
            border: `1px solid ${themeColor}33`, 
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)' 
          }}>
            <h4 className="font-semibold text-lg text-slate-800 mb-1">{data.hostelName}</h4>
            {showMeta && (
              <p className="text-sm text-slate-500 mb-4">Select a room configuration to book:</p>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {data.rooms.map((room) => (
                <div key={room.uuid} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div>
                    <span className="font-semibold text-slate-700 block">Room for {room.number_in_room}</span>
                    {showMeta && (
                      <span className="text-xs text-slate-500">Type: {room.room_type || 'Standard'}</span>
                    )}
                  </div>
                  <button
                    className="px-4 py-2 text-sm font-semibold rounded-lg text-white transition-colors"
                    style={{ backgroundColor: themeColor }}
                    onClick={() => handleOpenBooking(hostelObj, room)}
                  >
                    Select
                  </button>
                </div>
              ))}
            </div>
          </div>
        );

      case 'WIDGET_PAYMENT_PORTAL':
        if (!data.reference) return null;
        return (
          <div style={{ 
            maxWidth: '500px', 
            margin: '0 auto', 
            background: '#ffffff', 
            padding: '30px', 
            borderRadius: '16px', 
            border: `2px solid ${themeColor}44`, 
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)', 
            textAlign: 'center' 
          }}>
            <h4 className="font-semibold text-lg text-slate-800 mb-1">Rent Invoice</h4>
            <p className="text-sm text-slate-500 mb-4">{data.hostel_name} - Ref: {data.reference}</p>
            <div className="text-3xl font-extrabold mb-6" style={{ color: themeColor }}>GH₵{data.amount}</div>
            {data.is_active ? (
              <div className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-lg text-sm font-semibold border border-emerald-200 inline-block">
                Paid & Active
              </div>
            ) : (
              <button
                className="w-full py-3 text-white rounded-lg text-sm font-semibold transition-colors"
                style={{ backgroundColor: themeColor }}
                onClick={() => {
                  window.location.href = buildApiUrl(`${API_ENDPOINTS.PAYMENTS}?ref=${data.reference}`);
                }}
              >
                Pay via Paystack
              </button>
            )}
          </div>
        );

      case 'WIDGET_MARKETPLACE_PRODUCTS':
        if (!data.products || data.products.length === 0) {
          return <div className="text-slate-500 italic text-center py-8">No products found in the marketplace.</div>;
        }
        return (
          <div style={getGridStyle()}>
            {data.products.map((p) => (
              <div key={p.id} style={{ 
                background: '#ffffff', 
                borderRadius: '16px', 
                border: '1px solid #e5e7eb', 
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)', 
                overflow: 'hidden', 
                display: 'flex', 
                flexDirection: 'column', 
                height: '100%',
                padding: isCompact ? '12px' : '16px'
              }}>
                {showImages && (
                  <div style={{ 
                    height: isCompact ? '110px' : '160px', 
                    background: '#f1f5f9', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    borderRadius: '12px',
                    marginBottom: '12px',
                    overflow: 'hidden'
                  }}>
                    {p.image ? (
                      <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <Package size={isCompact ? 32 : 48} style={{ color: themeColor, opacity: 0.5 }} />
                    )}
                  </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flex: 1 }}>
                  <div>
                    <h5 style={{ fontWeight: 600, fontSize: isCompact ? '0.95rem' : '1.1rem', margin: '0 0 4px 0', color: '#1e293b' }}>{p.name}</h5>
                    <span style={{ fontSize: '11px', fontWeight: 500, padding: '2px 6px', background: `${themeColor}15`, color: themeColor, borderRadius: '6px', display: 'inline-block', marginBottom: '8px' }}>
                      {p.store_name}
                    </span>
                    {showMeta && (
                      <p style={{ fontSize: isCompact ? '12px' : '13px', color: '#64748b', margin: '0 0 12px 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {p.description || "No description provided."}
                      </p>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                    <span style={{ fontWeight: 700, fontSize: isCompact ? '1.1rem' : '1.25rem', color: themeColor }}>GH₵{p.price}</span>
                    <button 
                      style={{ 
                        backgroundColor: themeColor, 
                        color: '#ffffff', 
                        border: 'none', 
                        borderRadius: '10px', 
                        padding: isCompact ? '6px 12px' : '8px 16px', 
                        fontSize: isCompact ? '12px' : '13px', 
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                      onClick={() => alert(`Redirecting to store: ${p.store_name}`)}
                    >
                      <ShoppingCart size={14} />
                      Buy
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case 'WIDGET_USER_ORDERS':
        if (!data.orders || data.orders.length === 0) {
          return <div className="text-slate-500 italic text-center py-8">You haven't placed any orders yet.</div>;
        }
        return (
          <div style={{ maxWidth: '700px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {data.orders.map((o) => (
              <div key={o.id} style={{ 
                background: '#ffffff', 
                borderRadius: '14px', 
                border: '1px solid #e5e7eb', 
                padding: isCompact ? '12px' : '18px', 
                display: 'flex', 
                flexDirection: 'row', 
                justifyContent: 'space-between', 
                alignItems: 'center' 
              }}>
                <div>
                  <h5 style={{ fontWeight: 600, fontSize: '1.05rem', margin: '0 0 4px 0', color: '#1e293b' }}>{o.product_name}</h5>
                  <span style={{ fontSize: '12px', color: '#64748b', display: 'block' }}>Store: {o.store_name} | Ref: #{o.id}</span>
                </div>
                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end' }}>
                  <span style={{ fontWeight: 700, color: themeColor, fontSize: '1.1rem' }}>GH₵{o.price}</span>
                  <span style={{ 
                    fontSize: '11px', 
                    fontWeight: 600, 
                    padding: '2px 8px', 
                    borderRadius: '8px', 
                    background: o.status === 'completed' ? '#f0fdf4' : '#fef3c7', 
                    color: o.status === 'completed' ? '#16a34a' : '#d97706' 
                  }}>
                    {o.status.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        );

      case 'WIDGET_USER_NOTIFICATIONS':
        if (!data.notifications || data.notifications.length === 0) {
          return <div className="text-slate-500 italic text-center py-8">No notifications found.</div>;
        }
        return (
          <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {data.notifications.map((n) => (
              <div key={n.id} style={{ 
                background: '#ffffff', 
                borderRadius: '12px', 
                border: '1px solid #e5e7eb', 
                borderLeft: `4px solid ${n.type === 'success' ? '#10b981' : themeColor}`,
                padding: '16px',
                display: 'flex',
                gap: '12px'
              }}>
                <Bell size={20} style={{ color: n.type === 'success' ? '#10b981' : themeColor, flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h6 style={{ fontWeight: 600, fontSize: '0.95rem', color: '#1e293b', margin: '0 0 2px 0' }}>{n.title}</h6>
                  <p style={{ fontSize: '13px', color: '#64748b', margin: '0' }}>{n.message}</p>
                </div>
              </div>
            ))}
          </div>
        );

      case 'WIDGET_USER_DOCUMENTS':
        return (
          <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {data.documents.map((doc) => (
              <div key={doc.id} style={{ 
                background: '#ffffff', 
                borderRadius: '12px', 
                border: '1px solid #e5e7eb', 
                padding: '14px 18px', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center' 
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <FileText size={24} style={{ color: themeColor }} />
                  <div>
                    <span style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.95rem', display: 'block' }}>{doc.name}</span>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>Category: {doc.category} | Size: {doc.size}</span>
                  </div>
                </div>
                <button 
                  style={{ 
                    border: `1px solid ${themeColor}`, 
                    background: 'transparent', 
                    color: themeColor, 
                    borderRadius: '8px', 
                    width: '36px', 
                    height: '36px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    cursor: 'pointer' 
                  }}
                  onClick={() => alert(`Downloading: ${doc.name}`)}
                >
                  <Download size={16} />
                </button>
              </div>
            ))}
          </div>
        );

      case 'WIDGET_USER_CONVERSATIONS':
        return (
          <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {data.conversations.map((c) => (
              <div key={c.id} style={{ 
                background: '#ffffff', 
                borderRadius: '12px', 
                border: '1px solid #e5e7eb', 
                padding: '16px', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                cursor: 'pointer'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <MessageSquare size={24} style={{ color: themeColor }} />
                  <div>
                    <span style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.95rem', display: 'block' }}>{c.subject}</span>
                    <p style={{ fontSize: '12px', color: '#64748b', margin: '0', maxWidth: '350px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {c.last_message}
                    </p>
                  </div>
                </div>
                {c.unread_count > 0 && (
                  <span style={{ 
                    background: themeColor, 
                    color: '#ffffff', 
                    borderRadius: '50%', 
                    width: '20px', 
                    height: '20px', 
                    fontSize: '11px', 
                    fontWeight: 700, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                  }}>
                    {c.unread_count}
                  </span>
                )}
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  const currentThemeColor = getThemeColorHex();

  return (
    <>
      <NavBar />
      <div className="chat-assistant-container">
        <div className={`chat-content-wrapper ${activeWidget ? 'active-state' : 'empty-state'}`}>
          
          <div className="chat-header-section">
            <h1 className="chat-title">AI Assistant</h1>
            {!activeWidget && (
              <p className="chat-subtitle">
                Type an action below to instantly generate the requested section.
              </p>
            )}
          </div>

          <div className="chat-input-card" style={{ borderColor: activeWidget ? `${currentThemeColor}55` : '#e5e7eb' }}>
            <Search className="chat-search-icon" size={22} style={{ color: currentThemeColor }} />
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. 'order pizza', 'view documents', 'show warnings' or 'search hostels'"
              className="chat-input-textarea"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSend();
              }}
              disabled={loading}
            />
            <button
              onClick={() => handleSend()}
              className="chat-action-btn"
              style={{ backgroundColor: currentThemeColor }}
              disabled={loading || !input.trim()}
            >
              <Send size={18} />
            </button>
          </div>

          {/* Quick Option Chips */}
          {!activeWidget && !loading && (
            <div className="quick-options-grid">
              <button className="quick-option-button" onClick={() => handleQuickAction("Show me pizza in the student marketplace")}>
                <Package size={18} className="text-amber-500" />
                <span>Browse Student Marketplace</span>
              </button>
              <button className="quick-option-button" onClick={() => handleQuickAction("Show my recent orders")}>
                <ShoppingCart size={18} className="text-orange-500" />
                <span>Track my orders</span>
              </button>
              <button className="quick-option-button" onClick={() => handleQuickAction("View my documents and lease agreement")}>
                <FileText size={18} className="text-teal-600" />
                <span>View lease documents</span>
              </button>
              <button className="quick-option-button" onClick={() => handleQuickAction("Show my inbox and warnings")}>
                <Bell size={18} className="text-rose-500" />
                <span>List system alerts</span>
              </button>
            </div>
          )}

          {/* Loading Indicator */}
          {loading && (
            <div className="assistant-loader">
              <div className="spinner" style={{ borderTopColor: currentThemeColor }}></div>
              <span>Generating UI...</span>
            </div>
          )}

          {/* Single Output Area */}
          {!loading && activeWidget && activeWidget !== 'NONE' && (
            <>
              <div className="output-explanation-label" style={{ borderLeftColor: currentThemeColor }}>
                <Sparkles size={18} style={{ color: currentThemeColor }} />
                <span>{explanationLabel}</span>
              </div>
              <div className="active-widget-viewport">
                {renderWidget(activeWidget, widgetData)}
              </div>
            </>
          )}

          {/* Conversational Fallback Text Output */}
          {!loading && activeWidget === 'NONE' && (
            <div style={{ maxWidth: '600px', margin: '20px auto', background: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', textAlign: 'center', color: '#475569' }}>
              {explanationLabel}
            </div>
          )}

        </div>
      </div>

      {/* Reservation Modals */}
      {selectedRoom && selectedHostel && (
        <SimpleReservationModal
          isOpen={isReservationModalOpen}
          onClose={() => setIsReservationModalOpen(false)}
          roomDetails={selectedRoom}
          hostel={selectedHostel}
        />
      )}
      <Footer />
    </>
  );
}
