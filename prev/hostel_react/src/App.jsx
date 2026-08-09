
import './App.css'
import Landingpage from './pages/Landingpage'
import Hostels from './pages/Hostels'
import SignUp from './pages/SignUp'
import Login from './pages/Login'
import LoginPrompt from './pages/LoginPrompt'
import Dashboard from './pages/Dashboard'
import EmailVerification from './pages/EmailVerification'
import VerifyEmail from './pages/VerifyEmail'
import StudentResources from './pages/StudentResources'
import CampusGuide from './pages/CampusGuide'
import SafetyTips from './pages/SafetyTips'
import HelpCenter from './pages/HelpCenter'
import ContactUs from './pages/ContactUs'
import ReportIssue from './pages/ReportIssue'
import Feedback from './pages/Feedback'
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsOfService from './pages/TermsOfService'
import CookiePolicy from './pages/CookiePolicy'
import Disclaimer from './pages/Disclaimer'

// Enhanced features (safely imported)
import AdvancedSearch from './components/enhanced/search/AdvancedSearch'
import NotificationCenter from './components/enhanced/notifications/NotificationCenter'
import EnhancedAnalytics from './components/enhanced/analytics/EnhancedAnalytics'
import DocumentManager from './components/enhanced/documents/DocumentManager'
import CommunicationCenter from './components/enhanced/communication/CommunicationCenter'

import { Route, Routes } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './store'
import NavBar from './components/NavBar'
import Footer from './components/Footer'
import ProtectedRoute from './components/auth/ProtectedRoute'
import { useEffect, useState } from 'react'
import DetailedSearch from './pages/DetailedSearch'
import HostelDetail from './pages/HostelDetail'
import { useAuthData } from './hooks/useAuthData'
import { withFeatureSafety, isFeatureEnabled } from './config/features'
import FeatureErrorBoundary from './components/common/FeatureErrorBoundary'
import SEOOptimizer from './components/seo/SEOOptimizer'

// Component wrapper for feature safety
const FeatureWrapper = ({ feature, Component, FallbackComponent }) => {
  const WrappedComponent = withFeatureSafety(feature, Component, FallbackComponent);
  return <WrappedComponent />;
};

// AppContent component that can use Redux hooks
function AppContent() {
  const { token, isAuthenticated, initialized, loading } = useAuthData();
  
  // Debug logging

  // Show loading while auth is being initialized
  if (!initialized || loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <SEOOptimizer>
      <Routes>
      {/* Public routes - accessible without authentication */}
      <Route path='/' element={isAuthenticated && token ? <Landingpage /> : <LoginPrompt />} />
      <Route path='/signup' element={<SignUp />} />
      <Route path='/login' element={<Login />} />
      <Route path='/login-prompt' element={<LoginPrompt />} />
      <Route path='/email-verification' element={<EmailVerification />} />
      <Route path='/verify-email/:token' element={<VerifyEmail />} />
      <Route path='/student-resources' element={<StudentResources />} />
      <Route path='/campus-guide' element={<CampusGuide />} />
      <Route path='/safety-tips' element={<SafetyTips />} />
      <Route path='/help-center' element={<HelpCenter />} />
      <Route path='/contact-us' element={<ContactUs />} />
      <Route path='/report-issue' element={<ReportIssue />} />
      <Route path='/feedback' element={<Feedback />} />
      <Route path='/privacy-policy' element={<PrivacyPolicy />} />
      <Route path='/terms-of-service' element={<TermsOfService />} />
      <Route path='/cookie-policy' element={<CookiePolicy />} />
      <Route path='/disclaimer' element={<Disclaimer />} />
      
      {/* Protected routes - require authentication */}
      <Route path='/hostels' element={
        <ProtectedRoute>
          <Hostels />
        </ProtectedRoute>
      } />
      <Route path='/hostels/:slugOrId' element={
        <ProtectedRoute>
          <HostelDetail />
        </ProtectedRoute>
      } />
      <Route path='/dashboard' element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path='/detailed_search' element={
        <ProtectedRoute>
          <DetailedSearch />
        </ProtectedRoute>
      } />
      
      {/* Enhanced Features Routes - Safely wrapped with feature flags */}
      <Route path='/advanced-search' element={
        <ProtectedRoute>
          <FeatureErrorBoundary>
            <FeatureWrapper 
              feature="ADVANCED_SEARCH" 
              Component={AdvancedSearch} 
              FallbackComponent={DetailedSearch} 
            />
          </FeatureErrorBoundary>
        </ProtectedRoute>
      } />
      
      <Route path='/analytics' element={
        <ProtectedRoute>
          <FeatureErrorBoundary>
            <FeatureWrapper 
              feature="ENHANCED_ANALYTICS" 
              Component={EnhancedAnalytics} 
            />
          </FeatureErrorBoundary>
        </ProtectedRoute>
      } />
      
      <Route path='/documents' element={
        <ProtectedRoute>
          <FeatureErrorBoundary>
            <FeatureWrapper 
              feature="DOCUMENT_MANAGEMENT" 
              Component={DocumentManager} 
            />
          </FeatureErrorBoundary>
        </ProtectedRoute>
      } />
      
      <Route path='/communication' element={
        <ProtectedRoute>
          <FeatureErrorBoundary>
            <FeatureWrapper 
              feature="COMMUNICATION_SYSTEM" 
              Component={CommunicationCenter} 
            />
          </FeatureErrorBoundary>
        </ProtectedRoute>
      } />
    </Routes>
    </SEOOptimizer>
  );
}

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App
