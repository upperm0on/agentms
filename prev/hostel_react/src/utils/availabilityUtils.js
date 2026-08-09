// Availability utility functions for hostel and room management

/**
 * Determines the availability status of a hostel
 * @param {Object} hostel - The hostel object
 * @returns {Object} - Availability status with type and message
 */
export const getHostelAvailabilityStatus = (hostel) => {
  // Check if manager has complete payment setup
  // Only flag Service when payment_ready is explicitly false. If undefined/missing, don't block.
  if (hostel && hostel.payment_ready === false) {
    return {
      type: 'under_service',
      message: 'Service',
      isAvailable: false,
      icon: 'wrench',
      reason: 'Payment setup incomplete'
    };
  }

  // Check if hostel itself is marked as unavailable
  // Only show service button for truly unavailable statuses
  const unavailableStatuses = ['Unavailable', 'Closed', 'Under Maintenance', 'Maintenance', 'Suspended'];
  const isUnavailable = hostel.is_available === false || 
    (hostel.status && unavailableStatuses.includes(hostel.status));
  
  if (isUnavailable) {
    return {
      type: 'under_service',
      message: 'Service',
      isAvailable: false,
      icon: 'wrench'
    };
  }

  // Parse room details
  const room_details = normalizeRooms(hostel.room_details);
  
  if (room_details.length === 0) {
    return {
      type: 'no_rooms',
      message: 'No Rooms Available',
      isAvailable: false,
      icon: 'alert'
    };
  }

  // Check if all rooms are unavailable
  const allRoomsUnavailable = room_details.every(room => 
    room.room_available === false || room.room_available === 0
  );

  if (allRoomsUnavailable) {
    return {
      type: 'not_available',
      message: 'Not Available',
      isAvailable: false,
      icon: 'ban'
    };
  }

  // Check if some rooms are available
  const availableRooms = room_details.filter(room => 
    room.room_available === true || room.room_available === 1
  );

  if (availableRooms.length > 0) {
    return {
      type: 'available',
      message: `${availableRooms.length} Room${availableRooms.length > 1 ? 's' : ''} Available`,
      isAvailable: true,
      icon: 'check'
    };
  }

  // Default case
  return {
    type: 'unknown',
    message: 'Status Unknown',
    isAvailable: false,
    icon: 'question'
  };
};

/**
 * Calculates available reservation slots for a room
 * @param {Object} room - The room object
 * @param {Array} reservations - Array of existing reservations for this room
 * @returns {Object} - Availability calculation result
 */
export const calculateRoomAvailability = (room, reservations = []) => {
  // Handle null or undefined room
  if (!room) {
    return {
      totalCapacity: 0,
      currentOccupants: 0,
      reservedSlots: 0,
      availableSlots: 0,
      isAvailable: false,
      occupancyRate: 0
    };
  }

  // Get room capacity and number of rooms
  const occupantsPerRoom = room.number_in_room || 0;
  const numberOfRooms = room.number_of_rooms || 0;
  const currentOccupants = room.current_occupants || 0;
  
  // Calculate total capacity
  const totalCapacity = occupantsPerRoom * numberOfRooms;
  
  // Count existing reservations for this room
  const roomReservations = reservations.filter(reservation => 
    reservation.room_uuid === room.uuid || reservation.room === room.uuid
  );
  
  // Calculate available slots using the correct formula:
  // availableSlots = totalCapacity - (currentOccupants + reservedSlots)
  const reservedSlots = roomReservations.length;
  const totalOccupied = currentOccupants + reservedSlots;
  const availableSlots = totalCapacity - totalOccupied;
  
  return {
    totalCapacity,
    currentOccupants,
    reservedSlots,
    availableSlots,
    isAvailable: availableSlots > 0,
    occupancyRate: totalCapacity > 0 ? (totalOccupied / totalCapacity) * 100 : 0
  };
};

/**
 * Determines the availability status of a specific room
 * @param {Object} room - The room object
 * @param {Object} hostel - The parent hostel object
 * @param {Array} reservations - Array of existing reservations (optional)
 * @returns {Object} - Room availability status
 */
export const getRoomAvailabilityStatus = (room, hostel, reservations = []) => {
  // Handle null or undefined room
  if (!room) {
    return {
      type: 'not_available',
      message: 'Room Not Found',
      isAvailable: false,
      icon: 'ban'
    };
  }

  // If hostel is under service, room is not available
  if (hostel && hostel.payment_ready === false) {
    return {
      type: 'under_service',
      message: 'Service',
      isAvailable: false,
      icon: 'wrench',
      reason: 'Payment setup incomplete'
    };
  }

  // If backend precomputed availability is provided, honor it first
  if (typeof room.room_available === 'boolean') {
    if (room.room_available) {
      return {
        type: 'available',
        message: 'Slots Available',
        isAvailable: true,
        icon: 'check',
      };
    } else {
      return {
        type: 'not_available',
        message: 'Fully Booked',
        isAvailable: false,
        icon: 'ban',
      };
    }
  }

  const unavailableStatuses = ['Unavailable', 'Closed', 'Under Maintenance', 'Maintenance', 'Suspended'];
  const isHostelUnavailable = hostel.is_available === false || 
    (hostel.status && unavailableStatuses.includes(hostel.status));
  
  if (isHostelUnavailable) {
    return {
      type: 'under_service',
      message: 'Service',
      isAvailable: false,
      icon: 'wrench'
    };
  }

  // If hostel doesn't accept bookings, room is still available for reservations
  // (This check is removed to allow reservations even when bookings are disabled)

  // Calculate room availability based on reservation slots
  const availability = calculateRoomAvailability(room, reservations);
  
  if (availability.isAvailable) {
    return {
      type: 'available',
      message: `${availability.availableSlots} Slot${availability.availableSlots > 1 ? 's' : ''} Available`,
      isAvailable: true,
      icon: 'check',
      availability: availability
    };
  } else {
    return {
      type: 'not_available',
      message: 'Fully Booked',
      isAvailable: false,
      icon: 'ban',
      availability: availability
    };
  }
};

/**
 * Normalizes room details array
 * @param {*} value - Room details value
 * @returns {Array} - Normalized room details array
 */
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

/**
 * Gets the appropriate icon component for availability status
 * @param {string} iconType - The icon type
 * @returns {string} - Lucide React icon name
 */
export const getAvailabilityIcon = (iconType) => {
  const iconMap = {
    'check': 'CheckCircle',
    'ban': 'Ban',
    'wrench': 'Wrench',
    'alert': 'AlertTriangle',
    'question': 'HelpCircle'
  };
  
  return iconMap[iconType] || 'HelpCircle';
};
