import React, { useState, useEffect } from 'react';
import { ChevronDown, User, Building2, Settings, LogOut } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { buildApiUrl, API_ENDPOINTS } from '../../config/api';
import { setCurrentHostel, clearHostelData, switchProfile, setAvailableProfiles } from '../../store/slices/hostelSlice';
import { logout } from '../../store/slices/authSlice';
import { fetchAvailableProfiles } from '../../store/thunks/hostelThunks';
import './ProfileSwitcher.css';

const ProfileSwitcher = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [availableProfiles, setAvailableProfiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { token, email, user } = useSelector(state => state.auth);
  const { currentHostel, currentProfile, availableProfiles: storeProfiles } = useSelector(state => state.hostel);

  // Mock profiles for now - in a real app, these would come from API
  const mockProfiles = [
    {
      id: 'consumer',
      type: 'consumer',
      name: 'Student Profile',
      description: 'View as student/consumer',
      icon: User,
      active: !!currentHostel,
      endpoint: '/hq/api/payments/consumer_request/'
    },
    {
      id: 'manager',
      type: 'manager', 
      name: 'Manager Profile',
      description: 'Manage hostels',
      icon: Building2,
      active: false,
      endpoint: '/hq/api/manager/profile/'
    },
    {
      id: 'admin',
      type: 'admin',
      name: 'Admin Profile', 
      description: 'System administration',
      icon: Settings,
      active: false,
      endpoint: '/hq/api/admin/profile/'
    }
  ];

  useEffect(() => {
    // Fetch available profiles when component mounts
    dispatch(fetchAvailableProfiles());
  }, [dispatch]);

  useEffect(() => {
    // Update local state when store profiles change
    if (storeProfiles.length > 0) {
      const profiles = storeProfiles.map(profile => ({
        ...profile,
        active: profile.type === currentProfile
      }));
      setAvailableProfiles(profiles);
    }
  }, [storeProfiles, currentProfile]);

  const handleProfileSwitch = async (profile) => {
    if (profile.active) {
      setIsOpen(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (profile.type === 'consumer') {
        // Switch to consumer profile
        const response = await fetch(buildApiUrl(profile.endpoint), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          dispatch(switchProfile({ 
            profileType: 'consumer', 
            hostelData: data.stat === "True" ? data.data : null 
          }));
        } else {
          dispatch(switchProfile({ profileType: 'consumer', hostelData: null }));
        }
      } else if (profile.type === 'manager') {
        // Switch to manager profile
        dispatch(switchProfile({ profileType: 'manager', hostelData: null }));
        navigate('/manager-dashboard');
      } else if (profile.type === 'admin') {
        // Switch to admin profile
        dispatch(switchProfile({ profileType: 'admin', hostelData: null }));
        navigate('/admin-dashboard');
      }

      setIsOpen(false);
    } catch (err) {
      setError('Failed to switch profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
    setIsOpen(false);
  };

  const getCurrentProfile = () => {
    if (!availableProfiles || availableProfiles.length === 0) {
      return null;
    }
    return availableProfiles.find(p => p.active) || availableProfiles[0];
  };

  const currentProfileData = getCurrentProfile();

  return (
    <div className="profile-switcher">
      <button 
        className="profile-switcher-trigger"
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
      >
        <div className="profile-info">
          {currentProfileData && currentProfileData.icon && <currentProfileData.icon size={16} />}
          <span className="profile-name">
            {currentProfileData ? currentProfileData.name : 'Select Profile'}
          </span>
        </div>
        <ChevronDown size={16} className={`chevron ${isOpen ? 'open' : ''}`} />
      </button>

      {isOpen && (
        <div className="profile-switcher-dropdown">
          <div className="profile-switcher-header">
            <h4>Switch Profile</h4>
            <p>Choose how you want to use the platform</p>
          </div>
          
          <div className="profile-list">
            {availableProfiles && availableProfiles.length > 0 ? availableProfiles.map((profile) => (
              <button
                key={profile.id}
                className={`profile-option ${profile.active ? 'active' : ''}`}
                onClick={() => handleProfileSwitch(profile)}
                disabled={loading}
              >
                <div className="profile-option-content">
                  {profile.icon && <profile.icon size={20} />}
                  <div className="profile-option-text">
                    <span className="profile-option-name">{profile.name}</span>
                    <span className="profile-option-description">{profile.description}</span>
                  </div>
                  {profile.active && (
                    <div className="active-indicator">Current</div>
                  )}
                </div>
              </button>
            )) : (
              <div className="no-profiles">
                <p>No profiles available</p>
              </div>
            )}
          </div>

          <div className="profile-switcher-footer">
            <button 
              className="logout-button"
              onClick={handleLogout}
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>

          {error && (
            <div className="profile-switcher-error">
              {error}
            </div>
          )}
        </div>
      )}

      {/* Backdrop to close dropdown */}
      {isOpen && (
        <div 
          className="profile-switcher-backdrop"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default ProfileSwitcher;
