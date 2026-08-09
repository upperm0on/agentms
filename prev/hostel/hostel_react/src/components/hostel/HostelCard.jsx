import { useState } from "react";
import "../../assets/css/hostel/HostelCard.css";
import DetailPopup from "./DetailPopup";
import SimpleReservationModal from "../reservation/SimpleReservationModal";
import ReviewsModal from "../dashboard/ReviewsModal";
import { buildMediaUrl } from "../../config/api";
import { Star, Users, MapPin, Eye, AlertTriangle, Wrench, CheckCircle, Ban, HelpCircle, MessageSquare, Calendar } from "lucide-react";
import { getHostelAvailabilityStatus, getAvailabilityIcon } from "../../utils/availabilityUtils";
import { useReservationData } from "../../hooks/useReservationData";

function HostelCard({ hostel, layoutConfig }) {
  const [open, setOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
  const [isReviewsModalOpen, setIsReviewsModalOpen] = useState(false);
  
  // Get reservation data for availability calculation
  const { hasReservation, allReservations } = useReservationData();

  // Make sure room_details exists and is an array
  const normalizeRooms = (value) => {
    try {
      if (Array.isArray(value)) return value;
      if (typeof value === "string") {
        const trimmed = value.trim();
        if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
          const parsed = JSON.parse(trimmed);
          return Array.isArray(parsed) ? parsed : [];
        }
        return [];
      }
      if (typeof value === "object" && value !== null) {
        return Array.isArray(value) ? value : [];
      }
      return [];
    } catch (e) {
      return [];
    }
  };

  const room_details = normalizeRooms(hostel.room_details);
  
  // Get hostel availability status
  const availabilityStatus = getHostelAvailabilityStatus(hostel);
  
  // Get the appropriate icon component
  const getAvailabilityIconComponent = (iconType) => {
    const iconMap = {
      'check': CheckCircle,
      'ban': Ban,
      'wrench': Wrench,
      'alert': AlertTriangle,
      'question': HelpCircle
    };
    return iconMap[iconType] || HelpCircle;
  };
  
  const AvailabilityIcon = getAvailabilityIconComponent(availabilityStatus.icon);

  // Handle image URL construction
  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/images/hostel4.png";
    if (typeof imagePath === 'string' && /^(?:https?:)?\/\//i.test(imagePath)) return imagePath;
    try { return buildMediaUrl(imagePath); } catch { return imagePath; }
  };

  const handleReservationClick = (roomDetails) => {
    setSelectedRoom(roomDetails);
    setIsReservationModalOpen(true);
  };

  const handleReservationClose = () => {
    setIsReservationModalOpen(false);
    setSelectedRoom(null);
  };

  // Determine compactness styles
  const isCompact = layoutConfig?.display_density === 'compact';
  const showMeta = layoutConfig?.show_meta !== false;
  const showImages = layoutConfig?.show_images !== false;

  return (
    <>
      <DetailPopup
        hostel={hostel}
        open={open}
        onClose={() => setOpen(false)}
        onReservationClick={handleReservationClick}
      />

      <SimpleReservationModal
        isOpen={isReservationModalOpen}
        onClose={handleReservationClose}
        roomDetails={selectedRoom}
        hostel={hostel}
      />

      <ReviewsModal
        isOpen={isReviewsModalOpen}
        onClose={() => setIsReviewsModalOpen(false)}
        hostelId={hostel?.id}
        hostelName={hostel?.name}
      />

      <div 
        className={`hostel_card ${!availabilityStatus.isAvailable ? 'not-available' : ''}`} 
        onClick={() => setOpen(true)} 
        role="button" 
        tabIndex={0} 
        onKeyDown={(e)=> { if(e.key === 'Enter') setOpen(true); }}
        style={{
          padding: isCompact ? '12px' : '16px',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          justifyContent: 'space-between'
        }}
      >
        {showImages && (
          <div className="card-img-container" style={{ height: isCompact ? '120px' : '180px' }}>
            <img
              src={getImageUrl(hostel?.image)}
              alt={hostel?.name || "Hostel image"}
            />
            <div className="card-overlay">
              {!availabilityStatus.isAvailable && (
                <div className={`availability_badge ${availabilityStatus.type} icon-only`} aria-label={`Hostel ${availabilityStatus.message.toLowerCase()}`} title={availabilityStatus.message}>
                  <AvailabilityIcon size={20} className="availability_icon" />
                </div>
              )}
              <div style={{display:'flex', justifyContent:'center', width:'100%'}}>
                <div className="view-details">
                  <Eye size={18} />
                  <span>View Details</span>
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="hostel_details" style={{ padding: isCompact ? '4px 0 0 0' : '12px 0 0 0', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 className="hostel_name" style={{ fontSize: isCompact ? '1.05rem' : '1.2rem', marginBottom: isCompact ? '4px' : '8px', width: '100%', display: 'block' }}>
              {hostel?.name || "Unknown Hostel"}
            </h3>
            
            {showMeta && (
              <div className="hostel_actions" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: isCompact ? '6px' : '12px', flexWrap: 'wrap' }}>
                <div className="rating">
                  <Star size={14} className="star-icon" />
                  <span>{hostel?.ratings ?? "N/A"}</span>
                </div>
                <button 
                  className="reviews-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsReviewsModalOpen(true);
                  }}
                  title="View Reviews"
                  style={{ padding: isCompact ? '2px 4px' : '4px 8px', fontSize: isCompact ? '11px' : '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <MessageSquare size={14} />
                  <span>Reviews</span>
                </button>
                {hostel?.gender_type && (
                  <span 
                    className="gender-badge" 
                    style={{ 
                      fontSize: isCompact ? '10px' : '11px', 
                      fontWeight: 600, 
                      padding: isCompact ? '2px 6px' : '4px 8px', 
                      borderRadius: '6px', 
                      background: hostel.gender_type.toLowerCase() === 'male' ? '#eff6ff' : hostel.gender_type.toLowerCase() === 'female' ? '#fdf2f8' : '#f0fdf4', 
                      color: hostel.gender_type.toLowerCase() === 'male' ? '#1e40af' : hostel.gender_type.toLowerCase() === 'female' ? '#9d174d' : '#166534', 
                      textTransform: 'capitalize' 
                    }}
                  >
                    {hostel.gender_type}
                  </span>
                )}
              </div>
            )}
            
            {showMeta && (
              <div className="hostel_info" style={{ gap: isCompact ? '4px' : '10px' }}>
                <div className="info_item" style={{ fontSize: isCompact ? '12px' : '14px' }}>
                  <MapPin size={14} className="info-icon" />
                  <span>{hostel?.campus?.campus || "Unknown Campus"}</span>
                </div>
                <div className="info_item" style={{ fontSize: isCompact ? '12px' : '14px' }}>
                  <Users size={14} className="info-icon" />
                  <span>{room_details.length} Room Types Available</span>
                </div>
                {!isCompact && (
                  <div className="room_details">
                    {room_details.slice(0, 2).map((room) => (
                      <div key={room.uuid || room.number_in_room} className="room_item">
                        {room.number_in_room} in Room
                      </div>
                    ))}
                    {room_details.length > 2 && (
                      <div className="more_rooms">+{room_details.length - 2} more</div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Reserve button for hostels that don't accept bookings */}
          {hostel?.accepts_bookings === false && availabilityStatus.isAvailable && showMeta && (
            <div className="hostel_reserve_section" style={{ marginTop: '8px' }}>
              <button 
                className="hostel_reserve_btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleReservationClick(room_details);
                }}
                title="Reserve this hostel (no online booking available)"
                style={{ padding: isCompact ? '6px 12px' : '8px 16px', fontSize: isCompact ? '12px' : '14px' }}
              >
                <Calendar size={14} />
                <span>Reserve</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default HostelCard;
