import React from 'react';
import { isFeatureEnabled } from '../../config/features';

// Global error boundary for new features
class FeatureErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null 
    };
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  
  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Log error to monitoring service (if available)
    if (window.gtag) {
      window.gtag('event', 'exception', {
        description: error.toString(),
        fatal: false
      });
    }
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="feature-error-fallback">
          <div className="error-message">
            <h3>Feature Temporarily Unavailable</h3>
            <p>This feature is currently being updated. Please try again later.</p>
            {this.props.fallbackComponent ? (
              <this.props.fallbackComponent />
            ) : (
              <button 
                onClick={() => window.location.reload()} 
                className="btn btn-primary"
              >
                Refresh Page
              </button>
            )}
          </div>
        </div>
      );
    }
    
    return this.props.children;
  }
}

// Higher-order component for feature safety
export const withFeatureSafety = (feature, Component, FallbackComponent = null) => {
  return (props) => {
    if (!isFeatureEnabled(feature)) {
      return FallbackComponent ? <FallbackComponent {...props} /> : null;
    }
    
    return (
      <FeatureErrorBoundary fallbackComponent={FallbackComponent}>
        <Component {...props} />
      </FeatureErrorBoundary>
    );
  };
};

export default FeatureErrorBoundary;

