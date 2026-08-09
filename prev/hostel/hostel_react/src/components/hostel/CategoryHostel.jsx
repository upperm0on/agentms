import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../../assets/css/hostel/CategoryHostel.css";
import HostelCard from "./HostelCard";
import { buildApiUrl, API_ENDPOINTS } from "../../config/api";
import { checkResponseForUnverifiedAccount, handleUnverifiedAccount } from "../../utils/authUtils";
import { ChevronLeft, ChevronRight, Building2, Star, Users, MapPin } from "lucide-react";

function CategoryHostel({ externalHostels }) {
  const [hostels_data, setHostelsData] = useState([]);
  const [groupedHostels, setGroupedHostels] = useState({});
  const scrollContainerRefs = useRef({});
  const navigate = useNavigate();

  // Category mapping based on category IDs
  const categoryMapping = {
    1: { name: "Budget Hostels", icon: Building2, description: "Affordable accommodation for students" },
    2: { name: "Standard Hostels", icon: Building2, description: "Comfortable living with essential amenities" },
    3: { name: "Premium Hostels", icon: Star, description: "High-end accommodation with premium facilities" },
    4: { name: "Luxury Hostels", icon: Star, description: "Top-tier living with luxury amenities" },
    5: { name: "Shared Accommodation", icon: Users, description: "Shared living spaces for community feel" },
    6: { name: "Private Rooms", icon: Building2, description: "Individual rooms for privacy" },
    7: { name: "Campus Housing", icon: MapPin, description: "On-campus accommodation options" },
    8: { name: "Off-Campus Housing", icon: MapPin, description: "Convenient off-campus locations" },
    9: { name: "Family Housing", icon: Users, description: "Suitable for families and couples" },
    10: { name: "International Housing", icon: Building2, description: "Specialized for international students" }
  };

  const scrollLeft = (categoryKey) => {
    const container = scrollContainerRefs.current[categoryKey];
    if (container) {
      container.scrollBy({
        left: -280,
        behavior: 'smooth'
      });
    }
  };

  const scrollRight = (categoryKey) => {
    const container = scrollContainerRefs.current[categoryKey];
    if (container) {
      container.scrollBy({
        left: 280,
        behavior: 'smooth'
      });
    }
  };

  // Function to group hostels by category
  const groupHostelsByCategory = (hostels) => {
    const grouped = {};
    
    hostels.forEach(hostel => {
      const categoryId = hostel.category;
      const categoryKey = categoryId || 'uncategorized';
      
      if (!grouped[categoryKey]) {
        grouped[categoryKey] = {
          categoryId,
          hostels: []
        };
      }
      
      grouped[categoryKey].hostels.push(hostel);
    });
    
    return grouped;
  };

  // When externalHostels are provided (from Hostels page search), use them directly
  useEffect(() => {
    if (Array.isArray(externalHostels) && externalHostels.length > 0) {
      setHostelsData(externalHostels);
      const grouped = groupHostelsByCategory(externalHostels);
      setGroupedHostels(grouped);
    }
  }, [externalHostels]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const email = localStorage.getItem('email');
    async function getHostels() {
      try {
        // Try a simple fetch without custom headers to test CORS
        const response = await fetch(buildApiUrl(API_ENDPOINTS.HOSTELS), {
          method: "GET",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Token ${token}`
          },
        });

        // Check if the response indicates an unverified account
        if (await checkResponseForUnverifiedAccount(response)) {
          handleUnverifiedAccount(email, navigate);
          return;
        }

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const hostels = await response.json();
        setHostelsData(hostels); // Store in state
        try {
          localStorage.setItem('all_hostels', JSON.stringify(hostels));
          localStorage.setItem('all_hostels_timestamp', Date.now().toString());
        } catch (e) {
        }
        
        // Group hostels by category
        const grouped = groupHostelsByCategory(hostels);
        setGroupedHostels(grouped);
      } catch (error) {
      }
    }

    // Only fetch when no external hostels provided
    if (!Array.isArray(externalHostels) || externalHostels.length === 0) {
      getHostels(); // Call the function when component mounts
    }
  }, [navigate, externalHostels]);

  
  
  return (
    <>
      <div className="hostels_main_container">

        {Object.keys(groupedHostels).length > 0 ? (
          <div className="categories_container">
            {Object.entries(groupedHostels).map(([categoryKey, categoryData]) => {
              const categoryInfo = categoryMapping[categoryData.categoryId];
              const IconComponent = categoryInfo?.icon || Building2;
              const categoryName = categoryInfo?.name || 'Other Hostels';
              const categoryDescription = categoryInfo?.description || 'Various accommodation options';

              return (
                <div key={categoryKey} className="category_section">
                  <div className="category_header">
                    <div className="category_title_section">
                      <div className="category_icon_container">
                        <IconComponent size={24} className="category_icon" />
                      </div>
                      <div className="category_text">
                        <h2 className="category_name">{categoryName}</h2>
                        <p className="category_description">{categoryDescription}</p>
                        <span className="hostel_count">{categoryData.hostels.length} hostel{categoryData.hostels.length !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="category_container">
                    <button className="nav_button nav_left" onClick={() => scrollLeft(categoryKey)}>
                      <ChevronLeft size={20} />
                    </button>
                    <div 
                      className="category_list" 
                      ref={(el) => scrollContainerRefs.current[categoryKey] = el}
                    >
                      {categoryData.hostels.map((hostel, index) => (
                        <HostelCard key={`${categoryKey}-${index}`} hostel={hostel} />
                      ))}
                    </div>
                    <button className="nav_button nav_right" onClick={() => scrollRight(categoryKey)}>
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="no_hostels_message">
            <Building2 size={48} />
            <h3>No hostels available</h3>
            <p>Please check back later for available accommodations.</p>
          </div>
        )}
      </div>
    </>
  );
}

export default CategoryHostel;
