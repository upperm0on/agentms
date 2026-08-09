// Quick test runner for availability/service flag logic
// Run with: node test_availability_service_flag.js

(async () => {
  try {
    const { getHostelAvailabilityStatus, getRoomAvailabilityStatus } = await import('./src/utils/availabilityUtils.js');

    const print = (label, value) => {
      console.log(`\n=== ${label} ===`);
      console.log(JSON.stringify(value, null, 2));
    };

    // Helpers
    const mkRoom = (overrides = {}) => ({
      uuid: overrides.uuid || 'r-1',
      room_label: overrides.room_label || 'Standard',
      number_in_room: overrides.number_in_room ?? 2,
      number_of_rooms: overrides.number_of_rooms ?? 2,
      current_occupants: overrides.current_occupants ?? 0,
      room_available: overrides.room_available ?? true,
      ...overrides,
    });

    const mkHostel = (overrides = {}) => ({
      id: overrides.id || 1,
      name: overrides.name || 'Test Hostel',
      status: overrides.status ?? 'Available',
      is_available: overrides.is_available ?? true,
      room_details: overrides.room_details ?? [mkRoom()],
      payment_ready: overrides.payment_ready ?? true,
      ...overrides,
    });

    const scenarios = [
      {
        name: 'Payment not ready -> Service',
        hostel: mkHostel({ payment_ready: false }),
        expect: { type: 'under_service' },
      },
      {
        name: 'Explicit is_available=false -> Service',
        hostel: mkHostel({ is_available: false }),
        expect: { type: 'under_service' },
      },
      ...['Unavailable', 'Closed', 'Under Maintenance', 'Maintenance', 'Suspended'].map((s) => ({
        name: `Status ${s} -> Service`,
        hostel: mkHostel({ status: s }),
        expect: { type: 'under_service' },
      })),
      {
        name: 'No rooms -> No Rooms Available (not Service)',
        hostel: mkHostel({ room_details: [] }),
        expect: { type: 'no_rooms' },
      },
      {
        name: 'All rooms unavailable -> Not Available (not Service)',
        hostel: mkHostel({
          room_details: [mkRoom({ room_available: false }), mkRoom({ uuid: 'r-2', room_available: 0 })],
        }),
        expect: { type: 'not_available' },
      },
      {
        name: 'Some rooms available -> Available',
        hostel: mkHostel({
          room_details: [mkRoom({ room_available: false }), mkRoom({ uuid: 'r-2', room_available: true })],
        }),
        expect: { type: 'available' },
      },
    ];

    const results = [];
    for (const sc of scenarios) {
      const res = getHostelAvailabilityStatus(sc.hostel);
      results.push({ scenario: sc.name, got: res.type, expected: sc.expect.type, pass: res.type === sc.expect.type });
    }

    print('Hostel Availability - Summary', results);

    // Room-level checks
    const baseHostel = mkHostel();
    const room = mkRoom({ number_in_room: 2, number_of_rooms: 2, current_occupants: 2 }); // total 4 capacity, 2 occupied
    const reservations = [{ room_uuid: room.uuid }, { room_uuid: room.uuid }]; // 2 reserved -> 4 occupied
    const roomAvailable = getRoomAvailabilityStatus(room, baseHostel, reservations);
    print('Room Availability - Fully booked case', roomAvailable);

    const roomSomeFree = mkRoom({ number_in_room: 2, number_of_rooms: 2, current_occupants: 1 }); // 4 capacity, 1 occupied
    const reservationsFew = [{ room_uuid: roomSomeFree.uuid }]; // 1 reserved -> 2 occupied -> 2 free
    const roomSome = getRoomAvailabilityStatus(roomSomeFree, baseHostel, reservationsFew);
    print('Room Availability - Some free slots', roomSome);

    const serviceHostel = mkHostel({ payment_ready: false });
    const roomService = getRoomAvailabilityStatus(roomSomeFree, serviceHostel, []);
    print('Room Availability - Payment not ready -> Service', roomService);

    const failed = results.filter(r => !r.pass);
    if (failed.length > 0) {
      console.error('\nFailures detected:', failed);
      process.exit(1);
    } else {
      console.log('\nAll hostel availability scenarios passed.');
    }
  } catch (e) {
    console.error('Test runner error:', e);
    process.exit(2);
  }
})();


