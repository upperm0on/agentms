import "../../assets/css/hostel/DetailRoom.css";
import { buildApiUrl, API_ENDPOINTS } from "../../config/api";
import { Users, DollarSign, Bed, Wifi, Car, Shield, Utensils, Dumbbell, CheckCircle, CreditCard, Ban, Wrench, CalendarCheck, RotateCcw } from "lucide-react";
import { getRoomAvailabilityStatus } from "../../utils/availabilityUtils";
import { useReservationData } from "../../hooks/useReservationData";
import { formatRoomPrice } from "../../utils/currencyUtils";
import { getManagerReservationAmount } from "../../utils/pricingUtils";

// Helper to slugify hostel names for path segments
const slugify = (str) =>
  String(str || "")
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

function DetailRoom({ room_details, hostel, onReservationClick, allReservations: propReservations }) {
  // Check if user has an existing reservation using Redux
  const { hasReservation, allReservations: hookReservations } = useReservationData();
  const allReservations = propReservations || hookReservations || [];
  const hasExistingReservation = () => hasReservation;
  // Safely parse amenities - could be JSON array or comma-separated string
  const amenities = (() => {
    try {
      if (typeof room_details.amenities === 'string' && room_details.amenities.trim().startsWith('[')) {
        return JSON.parse(room_details.amenities);
      }
      // If it's a comma-separated string, split it
      if (typeof room_details.amenities === 'string') {
        return room_details.amenities.split(',').map(item => item.trim()).filter(item => item);
      }
      // If it's already an array, return it
      if (Array.isArray(room_details.amenities)) {
        return room_details.amenities;
      }
      return [];
    } catch (error) {
      return [];
    }
  })();

  const genderKeys = Object.keys(room_details.gender);

  // Prefer backend room_availability for truth; fallback to reservations-based calc
  const availabilityByUuid = Array.isArray(hostel?.room_availability)
    ? hostel.room_availability.reduce((acc, r) => {
        if (r && r.room_uuid) acc[r.room_uuid] = r;
        return acc;
      }, {})
    : {};

  // If backend provided availability for this room, honor it by injecting a boolean on the room object
  const backendAvail = availabilityByUuid[room_details?.uuid];
  const enrichedRoom = backendAvail
    ? { ...room_details, room_available: !!backendAvail.is_available }
    : room_details;

  // Use backend stats for messaging when present
  const roomAvailabilityStatus = getRoomAvailabilityStatus(enrichedRoom, hostel, allReservations);
  const isRoomAvailable = roomAvailabilityStatus.isAvailable;
  const backendStats = backendAvail || null;
  const displayMessage = backendStats
    ? (backendStats.available_slots > 0
        ? `${backendStats.available_slots} Slot${backendStats.available_slots > 1 ? 's' : ''} Available`
        : 'Fully Booked')
    : roomAvailabilityStatus.message;

  const hostelSlug = slugify(hostel?.name);
  // Normalize room image: support array, JSON string, or comma-separated string
  const parseFirstImage = (val) => {
    try {
      if (Array.isArray(val)) return (val[0] || "").trim();
      if (typeof val === "string") {
        const s = val.trim();
        if (!s) return "";
        if (s.startsWith("[")) {
          const arr = JSON.parse(s);
          if (Array.isArray(arr)) return (arr[0] || "").toString().trim();
        }
        if (s.includes(",")) {
          const first = s.split(",").map(t => t.trim()).find(Boolean);
          return first || "";
        }
        return s;
      }
      return "";
    } catch {
      return typeof val === "string" ? val.split(",")[0].trim() : "";
    }
  };

  const roomImage = parseFirstImage(room_details?.room_image);
  const roomImageSrc = /^https?:\/\//i.test(String(roomImage))
    ? roomImage
    : (roomImage
        ? `https://hosttelz.s3.eu-north-1.amazonaws.com/room_images/${hostelSlug}/${room_details.number_in_room}/${roomImage}`
        : "");

  const token = localStorage.getItem("token");
  const handlePayment = async () => {
    if (!isRoomAvailable) return;
    try {
      // Initiate payment on backend
      const res = await fetch(buildApiUrl(API_ENDPOINTS.PAYMENTS), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({ 
          room_uuid: room_details.uuid,
          room_number: room_details.number_in_room,
        }),
      });
      const backendData = await res.json();

      // Initialize Paystack transaction
      const paystackRes = await fetch(buildApiUrl(API_ENDPOINTS.PAYMENT_VERIFY), {
        method: "POST",
        headers: {
          Authorization: `Token ${token}`, // Replace with your actual secret key
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: backendData.email,
          amount: room_details.price * 100, // Ensure this is in kobo (multiply by 100 if needed)
          callback_url: "/dashboard/",
          hostel_id: hostel.id,
          room_number: room_details.number_in_room,
          room_uuid: room_details.uuid,
        }),
      });

      const response = await paystackRes.json();
      window.location.href = response.authorization_url;

    } catch (error) {
      alert("Payment failed. Try again.");
    }
  };

  return (
    <div className="room-card">
      <div className="room-image-container">
        <img
          src={roomImage ? roomImageSrc : "/images/room1.png"}
          alt="room_image"
        />
        <div className="room-badge">
          <Users size={14} />
          <span>{room_details["number_in_room"]} in Room</span>
        </div>
      </div>
      
      <div className="room-content">
        <div className="room-header">
          <h4 className="room-title">Room {room_details["number_in_room"]}</h4>
          <div className="room-gender">
            <Bed size={16} />
            <span>
              {genderKeys.length > 1
                ? "Mixed"
                : genderKeys[0].charAt(0).toUpperCase() + genderKeys[0].slice(1)}
            </span>
          </div>
        </div>

        <div className="room-pricing">
          <div className="price-container">
            <span className="price-display">
              {formatRoomPrice(
                room_details, 
                hostel?.manager?.payment_currency || 'GHS', 
                hostel?.checkout_date || hostel?.checkout
              )}
            </span>
          </div>
          {/* No manager callout; rely on disabled button state */}
        </div>

        <div className="room-amenities">
          <h5 className="amenities-title">Room Amenities</h5>
          <div className="amenities-list">
            {amenities.map((amenity, key) => {
              return (
                <div className="amenity-tag" key={key}>
                  <div className="amenity-icon">
                    {amenity.toLowerCase().includes('wifi') && <Wifi size={14} />}
                    {amenity.toLowerCase().includes('parking') && <Car size={14} />}
                    {amenity.toLowerCase().includes('security') && <Shield size={14} />}
                    {amenity.toLowerCase().includes('kitchen') && <Utensils size={14} />}
                    {amenity.toLowerCase().includes('gym') && <Dumbbell size={14} />}
                    {!amenity.toLowerCase().includes('wifi') && 
                     !amenity.toLowerCase().includes('parking') && 
                     !amenity.toLowerCase().includes('security') && 
                     !amenity.toLowerCase().includes('kitchen') && 
                     !amenity.toLowerCase().includes('gym') && 
                     <CheckCircle size={14} />}
                  </div>
                  <span className="amenity-name">{amenity}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="room-action-buttons">
          {/* Book Now button - only show if hostel accepts bookings */}
          {hostel?.accepts_bookings !== false && (
            <button
              type="button"
              className="book-room-btn"
              onClick={handlePayment}
              disabled={!isRoomAvailable}
              aria-disabled={!isRoomAvailable}
              title={isRoomAvailable ? "Book this room with full payment" : displayMessage}
            >
              {isRoomAvailable ? <CreditCard size={18} /> : (roomAvailabilityStatus.type === 'under_service' ? <Wrench size={18} /> : <Ban size={18} />)}
              <span>{isRoomAvailable ? "Book Now" : displayMessage}</span>
            </button>
          )}
          
          {/* Reserve button - always functional for reservations */}
          <button
            type="button"
            className={`reserve-room-btn ${hasExistingReservation() ? 'change-reservation' : ''}`}
            onClick={() => {
              if (onReservationClick) {
                onReservationClick(room_details);
              }
            }}
            disabled={!isRoomAvailable || !(Number(room_details?.reservation_price) > 0)}
            aria-disabled={!isRoomAvailable || !(Number(room_details?.reservation_price) > 0)}
            title={isRoomAvailable 
              ? (!(Number(room_details?.reservation_price) > 0)
                  ? "Reservations disabled: manager has not set a reservation price"
                  : (hasExistingReservation() ? "Change your reservation (no refund)" : "Reserve this room with deposit")) 
              : displayMessage}
          >
            {isRoomAvailable ? (
              hasExistingReservation() ? <RotateCcw size={18} /> : <CalendarCheck size={18} />
            ) : (
              roomAvailabilityStatus.type === 'under_service' ? <Wrench size={18} /> : <Ban size={18} />
            )}
            <span>
              {isRoomAvailable ? (hasExistingReservation() ? "Change Reservation" : "Reserve Room") : displayMessage}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default DetailRoom;