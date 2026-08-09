import React, { useState, useEffect } from 'react';
import { Search, Filter, MapPin, DollarSign, Star, Wifi, Car, Shield } from 'lucide-react';
import { safeApiCall, isFeatureEnabled } from '../../../config/features';
import { buildApiUrl, API_ENDPOINTS } from '../../../config/api';
import './AdvancedSearch.css';

const AdvancedSearch = ({ onSearchResults, onClose }) => {
  const [searchCriteria, setSearchCriteria] = useState({
    location: '',
    priceRange: { min: 0, max: 10000 },
    amenities: [],
    rating: 0,
    roomType: '',
    gender: '',
    distance: 10, // km
    sortBy: 'relevance'
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [savedSearches, setSavedSearches] = useState([]);
  
  const amenities = [
    { id: 'wifi', label: 'WiFi', icon: Wifi },
    { id: 'parking', label: 'Parking', icon: Car },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'laundry', label: 'Laundry' },
    { id: 'kitchen', label: 'Kitchen' },
    { id: 'gym', label: 'Gym' },
    { id: 'study_room', label: 'Study Room' },
    { id: 'common_area', label: 'Common Area' }
  ];
  
  const roomTypes = [
    { value: '', label: 'Any Room Type' },
    { value: 'single', label: 'Single Room' },
    { value: 'double', label: 'Double Room' },
    { value: 'shared', label: 'Shared Room' },
    { value: 'suite', label: 'Suite' }
  ];
  
  const sortOptions = [
    { value: 'relevance', label: 'Most Relevant' },
    { value: 'price_low', label: 'Price: Low to High' },
    { value: 'price_high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'distance', label: 'Nearest First' }
  ];
  
  useEffect(() => {
    // Load saved searches from localStorage
    const saved = localStorage.getItem('savedSearches');
    if (saved) {
      setSavedSearches(JSON.parse(saved));
    }
  }, []);
  
  const handleInputChange = (field, value) => {
    setSearchCriteria(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleAmenityToggle = (amenityId) => {
    setSearchCriteria(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenityId)
        ? prev.amenities.filter(id => id !== amenityId)
        : [...prev.amenities, amenityId]
    }));
  };
  
  const handleSearch = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      let results;
      
      if (isFeatureEnabled('ADVANCED_SEARCH')) {
        // Try advanced search API
        const response = await fetch(buildApiUrl('/hq/api/v2/search/'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(searchCriteria)
        });
        
        if (response.ok) {
          results = await response.json();
        } else {
          throw new Error('Advanced search failed');
        }
      } else {
        // Fallback to basic search
        const basicParams = new URLSearchParams({
          location: searchCriteria.location,
          min_price: searchCriteria.priceRange.min,
          max_price: searchCriteria.priceRange.max
        });
        
        const response = await fetch(buildApiUrl(API_ENDPOINTS.HOSTELS) + '?' + basicParams);
        const data = await response.json();
        results = { results: data, total: data.length };
      }
      
      onSearchResults(results);
      
    } catch (err) {
      setError('Search failed. Please try again.');
      
      // Fallback to basic search
      try {
        const fallbackResponse = await fetch(buildApiUrl(API_ENDPOINTS.HOSTELS));
        const fallbackData = await fallbackResponse.json();
        onSearchResults({ results: fallbackData, total: fallbackData.length });
      } catch (fallbackErr) {
        setError('Search service is temporarily unavailable.');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const saveSearch = () => {
    const newSearch = {
      id: Date.now(),
      name: `Search ${savedSearches.length + 1}`,
      criteria: searchCriteria,
      createdAt: new Date().toISOString()
    };
    
    const updatedSearches = [...savedSearches, newSearch];
    setSavedSearches(updatedSearches);
    localStorage.setItem('savedSearches', JSON.stringify(updatedSearches));
  };
  
  const loadSavedSearch = (search) => {
    setSearchCriteria(search.criteria);
  };
  
  const clearFilters = () => {
    setSearchCriteria({
      location: '',
      priceRange: { min: 0, max: 10000 },
      amenities: [],
      rating: 0,
      roomType: '',
      gender: '',
      distance: 10,
      sortBy: 'relevance'
    });
  };
  
  return (
    <div className="advanced-search-modal">
      <div className="advanced-search-content">
        <div className="search-header">
          <h2>Advanced Search</h2>
          <button onClick={onClose} className="close-btn">×</button>
        </div>
        
        <div className="search-form">
          {/* Location Search */}
          <div className="search-field">
            <label>
              <MapPin size={20} />
              Location
            </label>
            <input
              type="text"
              placeholder="Enter location or campus"
              value={searchCriteria.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
            />
          </div>
          
          {/* Price Range */}
          <div className="search-field">
            <label>
              <DollarSign size={20} />
              Price Range (GHS)
            </label>
            <div className="price-range">
              <input
                type="number"
                placeholder="Min"
                value={searchCriteria.priceRange.min}
                onChange={(e) => handleInputChange('priceRange', {
                  ...searchCriteria.priceRange,
                  min: parseInt(e.target.value) || 0
                })}
              />
              <span>to</span>
              <input
                type="number"
                placeholder="Max"
                value={searchCriteria.priceRange.max}
                onChange={(e) => handleInputChange('priceRange', {
                  ...searchCriteria.priceRange,
                  max: parseInt(e.target.value) || 10000
                })}
              />
            </div>
          </div>
          
          {/* Room Type */}
          <div className="search-field">
            <label>Room Type</label>
            <select
              value={searchCriteria.roomType}
              onChange={(e) => handleInputChange('roomType', e.target.value)}
            >
              {roomTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          
          {/* Gender */}
          <div className="search-field">
            <label>Gender Preference</label>
            <select
              value={searchCriteria.gender}
              onChange={(e) => handleInputChange('gender', e.target.value)}
            >
              <option value="">Any</option>
              <option value="male">Male Only</option>
              <option value="female">Female Only</option>
              <option value="mixed">Mixed</option>
            </select>
          </div>
          
          {/* Rating */}
          <div className="search-field">
            <label>
              <Star size={20} />
              Minimum Rating
            </label>
            <div className="rating-input">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  className={`star-btn ${star <= searchCriteria.rating ? 'active' : ''}`}
                  onClick={() => handleInputChange('rating', star)}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
          
          {/* Amenities */}
          <div className="search-field">
            <label>Amenities</label>
            <div className="amenities-grid">
              {amenities.map(amenity => (
                <button
                  key={amenity.id}
                  className={`amenity-btn ${searchCriteria.amenities.includes(amenity.id) ? 'active' : ''}`}
                  onClick={() => handleAmenityToggle(amenity.id)}
                >
                  {amenity.icon && <amenity.icon size={16} />}
                  {amenity.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Distance */}
          <div className="search-field">
            <label>Distance from location (km)</label>
            <input
              type="range"
              min="1"
              max="50"
              value={searchCriteria.distance}
              onChange={(e) => handleInputChange('distance', parseInt(e.target.value))}
            />
            <span>{searchCriteria.distance} km</span>
          </div>
          
          {/* Sort By */}
          <div className="search-field">
            <label>Sort By</label>
            <select
              value={searchCriteria.sortBy}
              onChange={(e) => handleInputChange('sortBy', e.target.value)}
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Saved Searches */}
        {savedSearches.length > 0 && (
          <div className="saved-searches">
            <h3>Saved Searches</h3>
            <div className="saved-searches-list">
              {savedSearches.map(search => (
                <button
                  key={search.id}
                  className="saved-search-item"
                  onClick={() => loadSavedSearch(search)}
                >
                  {search.name}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Error Display */}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="search-actions">
          <button onClick={clearFilters} className="btn btn-secondary">
            Clear Filters
          </button>
          <button onClick={saveSearch} className="btn btn-outline">
            Save Search
          </button>
          <button 
            onClick={handleSearch} 
            disabled={isLoading}
            className="btn btn-primary"
          >
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdvancedSearch;

