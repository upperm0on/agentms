function SideBarNav({
  roomTypes,
  amenities,
  selectedRoomType,
  setSelectedRoomType,
  selectedAmenities,
  setSelectedAmenities,
}) {
  return (
    <aside>
      <h2>Filters</h2>

      {/* Room Types */}
      <div>
        <h3>Room Types</h3>
        {roomTypes.map((room) => (
          <label key={room}>
            <input
              type="radio"
              name="roomType"
              value={room}
              checked={selectedRoomType === room.toString()}
              onChange={() =>
                setSelectedRoomType(
                  selectedRoomType === room.toString() ? "" : room.toString()
                )
              }
            />
            {room}-in-room
          </label>
        ))}
      </div>

      {/* Amenities */}
      <div>
        <h3>Amenities</h3>
        {amenities.map((amenity) => (
          <label key={amenity}>
            <input
              type="checkbox"
              value={amenity}
              checked={selectedAmenities.includes(amenity)}
              onChange={(e) =>
                e.target.checked
                  ? setSelectedAmenities([...selectedAmenities, amenity])
                  : setSelectedAmenities(
                      selectedAmenities.filter((a) => a !== amenity)
                    )
              }
            />
            {amenity}
          </label>
        ))}
      </div>
    </aside>
  );
}

export default SideBarNav;
