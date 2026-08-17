// Feature flags for safe feature rollout
export const FEATURE_FLAGS = {
  // Core features (always enabled)
  BASIC_AUTH: true,
  BASIC_HOSTEL_MANAGEMENT: true,
  BASIC_PAYMENT: true,
  BASIC_RESERVATION: true,
  BASIC_RATING_REVIEW: true,
  
  // Enhanced features (start disabled, enable gradually)
  ADVANCED_SEARCH: false,
  NOTIFICATIONS: false,
  ENHANCED_ANALYTICS: false,
  DOCUMENT_MANAGEMENT: false,
  COMMUNICATION_SYSTEM: false,
  SECURITY_FEATURES: false,
  MOBILE_OPTIMIZATION: false,
  
  // Development flags
  DEBUG_MODE: process.env.NODE_ENV === 'development',
  API_LOGGING: process.env.NODE_ENV === 'development',
};

// Feature flag helper functions
export const isFeatureEnabled = (feature) => {
  return FEATURE_FLAGS[feature] === true;
};

export const getFeatureConfig = (feature) => {
  return {
    enabled: isFeatureEnabled(feature),
    fallback: true, // Always provide fallback
  };
};

// Safe feature wrapper
export const withFeatureFlag = (feature, Component, FallbackComponent = null) => {
  return (props) => {
    if (isFeatureEnabled(feature)) {
      return Component(props);
    }
    return FallbackComponent ? FallbackComponent(props) : null;
  };
};

// Alias for withFeatureFlag (for consistency with imports)
export const withFeatureSafety = withFeatureFlag;

// API endpoint configuration with fallbacks
export const API_CONFIG = {
  // Current working endpoints
  V1: {
    SEARCH: '/hq/api/hostels/',
    ANALYTICS: '/hq/api/analytics/',
    NOTIFICATIONS: '/hq/api/notifications/',
  },
  // Enhanced endpoints (fallback to V1 if not available)
  V2: {
    SEARCH: '/hq/api/v2/search/',
    ANALYTICS: '/hq/api/v2/analytics/',
    NOTIFICATIONS: '/hq/api/v2/notifications/',
  },
};

// Safe API call helper
export const safeApiCall = async (endpoint, options = {}) => {
  try {
    // Try enhanced endpoint first if feature is enabled
    const enhancedEndpoint = API_CONFIG.V2[endpoint];
    const fallbackEndpoint = API_CONFIG.V1[endpoint];
    
    if (enhancedEndpoint && isFeatureEnabled('ADVANCED_SEARCH')) {
      const response = await fetch(enhancedEndpoint, options);
      if (response.ok) {
        return await response.json();
      }
    }
    
    // Fallback to basic endpoint
    const response = await fetch(fallbackEndpoint, options);
    if (response.ok) {
      return await response.json();
    }
    
    throw new Error('API call failed');
  } catch (error) {
    // Return safe fallback data
    return { error: true, message: 'Service temporarily unavailable' };
  }
};
