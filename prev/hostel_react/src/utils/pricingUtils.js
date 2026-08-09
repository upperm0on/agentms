// Helpers for manager-controlled reservation pricing and deposit

export const getManagerDepositPercentage = (hostel) => {
  const candidate = Number(hostel?.manager?.deposit_percentage);
  if (Number.isFinite(candidate) && candidate > 0 && candidate <= 100) {
    return candidate;
  }
  return 30;
};

export const getManagerReservationAmount = (room, hostel) => {
  const roomLevel = Number(room?.reservation_price);
  if (Number.isFinite(roomLevel) && roomLevel > 0) {
    return roomLevel;
  }

  const hostelLevel = Number(hostel?.manager?.reservation_price);
  if (Number.isFinite(hostelLevel) && hostelLevel > 0) {
    return hostelLevel;
  }

  const fallback = Number(room?.price);
  return Number.isFinite(fallback) && fallback > 0 ? fallback : 0;
};


