import { useState } from "react";
import "../../assets/css/hostel/HostelCard.css";
import DetailPopup from "./DetailPopup";
import SimpleReservationModal from "../reservation/SimpleReservationModal";
import ReviewsModal from "../dashboard/ReviewsModal";
import { buildMediaUrl } from "../../config/api";
import { Star, Users, MapPin, Eye, AlertTriangle, Wrench, CheckCircle, Ban, HelpCircle, MessageSquare, Calendar } from "lucide-react";
import { getHostelAvailabilityStatus, getAvailabilityIcon } from "../../utils/availabilityUtils";
import { useReservationData } from "../../hooks/useReservationData";

function HostelCard({ hostel }) {
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
    // If it's already an absolute URL or starts with http, use as is
    if (typeof imagePath === 'string' && /^(?:https?:)?\/\//i.test(imagePath)) return imagePath;
    // otherwise build media url (this will respect VITE_API_BASE_URL)
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

      <div className={`hostel_card ${!availabilityStatus.isAvailable ? 'not-available' : ''}`} onClick={() => setOpen(true)} role="button" tabIndex={0} onKeyDown={(e)=> { if(e.key === 'Enter') setOpen(true); }}>
        <div className="card-img-container">
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
        <div className="hostel_details">
          <div className="hostel_header">
            <h3 className="hostel_name">{hostel?.name || "Unknown Hostel"}</h3>
            <div className="hostel_actions">
              <div className="rating">
                <Star size={16} className="star-icon" />
                <span>{hostel?.ratings ?? "N/A"}</span>
              </div>
              <button 
                className="reviews-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsReviewsModalOpen(true);
                }}
                title="View Reviews"
              >
                <MessageSquare size={16} />
                <span>Reviews</span>
              </button>
            </div>
          </div>
          <div className="hostel_info">
            <div className="info_item">
              <MapPin size={16} className="info-icon" />
              <span>{hostel?.campus?.campus || "Unknown Campus"}</span>
            </div>
            <div className="info_item">
              <Users size={16} className="info-icon" />
              <span>{room_details.length} Room Types Available</span>
            </div>
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
          </div>
          
          {/* Reserve button for hostels that don't accept bookings */}
          {hostel?.accepts_bookings === false && availabilityStatus.isAvailable && (
            <div className="hostel_reserve_section">
              <button 
                className="hostel_reserve_btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleReservationClick(room_details);
                }}
                title="Reserve this hostel (no online booking available)"
              >
                <Calendar size={16} />
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
