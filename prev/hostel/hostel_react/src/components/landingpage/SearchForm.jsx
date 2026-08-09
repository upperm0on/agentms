import { useState, useEffect } from "react";
import { MapPin, Search } from "lucide-react";
import "../../assets/css/landingpage/SearchForm.css";
import { buildApiUrl, API_ENDPOINTS } from "../../config/api";
import { checkResponseForUnverifiedAccount, handleUnverifiedAccount } from "../../utils/authUtils";

import CampusListDialog from "./CampusListDialog";
import { Navigate, useNavigate } from "react-router-dom";

function SearchForm() {
  const [location, setLocation] = useState("");
  const [price, setPrice] = useState("");
  const [roomType, setRoomType] = useState("");
  const [campusList, setCampusList] = useState(null);
  const [searchResults, setSearchResults] = useState(null);
  const [error, setError] = useState(null);
  const [showCampusDialog, setShowCampusDialog] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem("token"); // Ensure token is available
  const email = localStorage.getItem("email");

  // Fetch campus list on component mount
  useEffect(() => {
    const fetchCampusList = async () => {
      try {
        const response = await fetch(buildApiUrl(API_ENDPOINTS.SEARCH_REQUEST), {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
        });

        // Check if the response indicates an unverified account
        if (await checkResponseForUnverifiedAccount(response)) {
          handleUnverifiedAccount(email, navigate);
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to fetch campus list");
        }

        const data = await response.json();
        setCampusList(data); // Assume data = [{id: 1, name: "Campus A"}, ...]
      } catch (error) {
        setError("Failed to fetch campus list. Please try again.");
      }
    };

    if (campusList === null) {
      fetchCampusList();
    }
  }, [campusList, token, email, navigate]);

  // Handle input change for location
  const handleLocationChange = (e) => {
    const value = e.target.value;
    setLocation(value);
    setShowCampusDialog(value.length > 0); // Show dialog when typing
  };

  // Handle campus selection from dialog
  const handleCampusSelect = (campus) => {
    setLocation(campus.campus); // Fill input with selected campus
    setShowCampusDialog(false); // Hide dialog
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSearchResults(null);

    try {
      const response = await fetch(buildApiUrl(API_ENDPOINTS.SEARCH_REQUEST), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({
          location: location,
          max_price: price,
          room_type: roomType,
        }),
      });

      // Check if the response indicates an unverified account
      if (await checkResponseForUnverifiedAccount(response)) {
        handleUnverifiedAccount(email, navigate);
        return;
      }

      if (!response.ok) {
        throw new Error("Search failed");
      }

      const data = await response.json();
      setSearchResults(data);

      // save the fresh results, not the stale state
      localStorage.setItem("search_data", JSON.stringify(data));

    } catch (error) {
      setError("Search failed. Please try again.");
    }
  };

  return (
    <div className="search_container">
      <form onSubmit={handleSubmit} className="search_form">
        <div className="search_form_title">Find your perfect Hostel</div>

        {/* Location */}
        <div className="search_form_item first">
          <div className="location-icon-container">
            <MapPin size={20} className="location_icon" />
          </div>
          <input
            type="text"
            value={location}
            onChange={handleLocationChange}
            placeholder="Search by Location or Campus"
            id="location"
            autoFocus
          />
        {/* Show campus list dialog when typing */}
        {showCampusDialog && campusList && (
          <CampusListDialog
            campusList={campusList}
            filterText={location}
            onSelect={handleCampusSelect}
          />
        )}

          <button type="submit" className="search_button">
            <Search size={18} />
            Search
          </button>
        </div>

        {/* Display error */}
        {error && <div className="error_message">{error}</div>}

        {/* Display search results */}
        {searchResults && (
          <div className="search_results">
            <h3>Search Results:</h3>
            {<Navigate to={"/detailed_search"} />}
          </div>
        )}
      </form>
    </div>
  );
}

export default SearchForm;
