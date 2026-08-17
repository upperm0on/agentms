// Room availability test suite
// Run with: node test_room_availability.js

(async () => {
  try {
    const {
      calculateRoomAvailability,
      getRoomAvailabilityStatus,
    } = await import('./src/utils/availabilityUtils.js');

    const print = (label, value) => {
      console.log(`\n=== ${label} ===`);
      console.log(JSON.stringify(value, null, 2));
    };

    const mkRoom = (overrides = {}) => ({
      uuid: overrides.uuid || 'room-1',
      room_label: overrides.room_label || 'Standard',
      number_in_room: overrides.number_in_room ?? 2,
      number_of_rooms: overrides.number_of_rooms ?? 2,
      current_occupants: overrides.current_occupants ?? 0,
      ...overrides,
    });

    const mkHostel = (overrides = {}) => ({
      id: overrides.id || 1,
      name: overrides.name || 'Hostel A',
      status: overrides.status ?? 'Available',
      is_available: overrides.is_available ?? true,
      room_details: overrides.room_details ?? [],
      payment_ready: overrides.payment_ready ?? true,
      ...overrides,
    });

    const assert = (cond, msg) => {
      if (!cond) throw new Error(msg);
    };

    // 1) calculateRoomAvailability edge cases
    const nullRoom = calculateRoomAvailability(null, []);
    print('calculateRoomAvailability - null room', nullRoom);
    assert(nullRoom.totalCapacity === 0 && nullRoom.availableSlots === 0 && nullRoom.isAvailable === false, 'Null room failed');

    const zeroCapacity = calculateRoomAvailability(mkRoom({ number_in_room: 0, number_of_rooms: 0 }), []);
    print('calculateRoomAvailability - zero capacity', zeroCapacity);
    assert(zeroCapacity.totalCapacity === 0 && zeroCapacity.isAvailable === false, 'Zero capacity failed');

    const baseRoom = mkRoom({ number_in_room: 2, number_of_rooms: 3, current_occupants: 2 }); // capacity 6
    const baseReservations = [{ room_uuid: baseRoom.uuid }]; // 1 reservation
    const calc = calculateRoomAvailability(baseRoom, baseReservations); // occupied = 3 -> available 3
    print('calculateRoomAvailability - normal case', calc);
    assert(calc.totalCapacity === 6 && calc.availableSlots === 3 && calc.isAvailable === true, 'Normal case failed');

    const fullRoom = mkRoom({ number_in_room: 2, number_of_rooms: 2, current_occupants: 2 }); // capacity 4
    const fullRes = [{ room_uuid: fullRoom.uuid }, { room_uuid: fullRoom.uuid }]; // 2 reserved -> 4 occupied
    const calcFull = calculateRoomAvailability(fullRoom, fullRes);
    print('calculateRoomAvailability - fully booked', calcFull);
    assert(calcFull.availableSlots === 0 && calcFull.isAvailable === false, 'Fully booked failed');

    const overbookRoom = mkRoom({ number_in_room: 1, number_of_rooms: 2, current_occupants: 3 }); // capacity 2, already 3
    const overbookRes = [{ room_uuid: overbookRoom.uuid }]; // +1 reserved -> occupied 4 -> available -2
    const calcOver = calculateRoomAvailability(overbookRoom, overbookRes);
    print('calculateRoomAvailability - overbooked (should not be available)', calcOver);
    assert(calcOver.availableSlots <= 0 && calcOver.isAvailable === false, 'Overbooked should not be available');

    // 2) getRoomAvailabilityStatus scenarios
    const hostelService = mkHostel({ payment_ready: false });
    const statusService = getRoomAvailabilityStatus(baseRoom, hostelService, []);
    print('getRoomAvailabilityStatus - hostel payment not ready => Service', statusService);
    assert(statusService.type === 'under_service', 'Payment not ready should be under_service');

    const hostelUnavailable = mkHostel({ status: 'Unavailable' });
    const statusUnavailable = getRoomAvailabilityStatus(baseRoom, hostelUnavailable, []);
    print('getRoomAvailabilityStatus - hostel status Unavailable => Service', statusUnavailable);
    assert(statusUnavailable.type === 'under_service', 'Unavailable hostel should be under_service');

    const hostelOk = mkHostel();
    const availableRoom = mkRoom({ number_in_room: 2, number_of_rooms: 2, current_occupants: 1 }); // capacity 4, occupied 1
    const someRes = [{ room_uuid: availableRoom.uuid }]; // +1 => occupied 2 => available 2
    const statusAvailable = getRoomAvailabilityStatus(availableRoom, hostelOk, someRes);
    print('getRoomAvailabilityStatus - available slots', statusAvailable);
    assert(statusAvailable.type === 'available' && /2 Slot/.test(statusAvailable.message), 'Available room should report slots');

    const fullyBookedStatus = getRoomAvailabilityStatus(fullRoom, hostelOk, fullRes);
    print('getRoomAvailabilityStatus - fully booked', fullyBookedStatus);
    assert(fullyBookedStatus.type === 'not_available' && fullyBookedStatus.message === 'Fully Booked', 'Fully booked should be not_available');

    console.log('\nAll room availability tests passed.');
  } catch (e) {
    console.error('Room availability tests failed:', e);
    process.exit(1);
  }
})();


