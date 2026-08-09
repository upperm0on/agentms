import { Home, DollarSign, BarChart3, Users, Tag, Sparkles, Circle } from 'lucide-react';
import '../../assets/css/dashboard/RoomCard.css';

function RoomCard({ room }) {
  if (!room) return null;
  // Safe parsing for amenities
  let amenities = [];
  if (room.amenities) {
    // If it's already an array, use it directly
    if (Array.isArray(room.amenities)) {
      amenities = room.amenities;
    } else if (typeof room.amenities === 'string') {
      // Try parsing as JSON first
      try {
        const parsed = JSON.parse(room.amenities);
        amenities = Array.isArray(parsed) ? parsed : [];
      } catch {
        // If JSON parsing fails, try splitting comma-separated string
        amenities = room.amenities.split(',').map(item => item.trim()).filter(item => item);
      }
    }
  }  
  
  return (
    <div className="room_card">
      <p>
        <strong><Home size={16} /> {room.number_in_room} in a room</strong> – <span><DollarSign size={16} /> GH₵{room.price}</span>
      </p>
      <p><BarChart3 size={16} /> Rooms available: <span>{room.number_of_rooms}</span></p>
      <p><Users size={16} /> Current occupants: <span>{room.current_occupants || 0}</span></p>
      <p><Tag size={16} /> Room label: <span>{room.room_label || 'Standard'}</span></p>
      {amenities.length > 0 && (
        <ul>
            <p className="ul_heading"><Sparkles size={16} /> Your Amenities</p>
          {amenities.map((a, i) => (
            <li key={i}><Circle size={12} /> {a}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default RoomCard;
