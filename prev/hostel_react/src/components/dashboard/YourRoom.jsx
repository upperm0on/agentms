import RoomCard from "./RoomCard";
import { Home, Circle } from 'lucide-react';
import "../../assets/css/dashboard/YourRoom.css";
import { useHostelData } from '../../hooks/useHostelData';
import { useReservationData } from '../../hooks/useReservationData';

function YourRoom() {
  const { hostel } = useHostelData();
  const { roomBooked } = useReservationData();

  // Parse room details properly
  const room_details_parsed = Array.isArray(hostel.room_details)
    ? hostel.room_details
    : (typeof hostel.room_details === 'string'
        ? (() => { try { return JSON.parse(hostel.room_details || '[]'); } catch { return []; } })()
        : []);

  const cleanedBookedRoom = roomBooked ? roomBooked.replace(/"/g, "") : ""; // removes extra quotes

  let passing_room = null;

  room_details_parsed.forEach((room) => {
    // Try to match by UUID first, then fall back to number_in_room for backward compatibility
    if (room.uuid === cleanedBookedRoom || String(room.number_in_room) === cleanedBookedRoom) {
      passing_room = room;
    }
  });

  if (!passing_room) {
    return null;
  }

  return (
    <div className="your-room-card">
      <div className="room-card-header">
        <div className="room-title-section">
          <h2 className="room-main-title"><Home size={24} /> Your Room</h2>
          <p className="room-subtitle">Your personal space</p>
        </div>
        <div className="room-status">
          <div className="status-indicator">
            <Circle size={8} className="status-dot" />
            <span className="status-text">Active</span>
          </div>
        </div>
      </div>
      <RoomCard room={passing_room} />
    </div>
  );
}

export default YourRoom;
