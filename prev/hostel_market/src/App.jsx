import React, { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import NavBar from './components/layout/NavBar'
import Footer from './components/layout/Footer'
import ErrorBoundary from './components/ErrorBoundary'
import MarketplaceHome from './pages/MarketplaceHome'
import BrowsePage from './pages/BrowsePage'
import CategoriesPage from './pages/CategoriesPage'
import StoreDetail from './pages/StoreDetail'
import ProductDetail from './pages/ProductDetail'
import OrderHistory from './components/orders/OrderHistory'
import Login from './pages/Login'
import Favorites from './pages/Favorites'
import Wallet from './pages/Wallet'
import MyStore from './pages/MyStore'
import StoreSettings from './pages/StoreSettings'
import OpenStore from './pages/OpenStore'
import BecomeDeliverer from './pages/BecomeDeliverer'
import DelivererDashboard from './pages/DelivererDashboard'
import NotFound from './pages/NotFound'
import SellerRoute from './components/ui/SellerRoute'
import DevMenu from './components/dev/DevMenu'
import { setEntrepreneur, setDeliverer } from './store/slices/authSlice'
import { checkEntrepreneurWithToken } from './services/authService'
import { fetchDelivererStatus } from './store/slices/delivererSlice'
import './App.css'

function App() {
  const dispatch = useDispatch()
  const { isAuthenticated, token, entrepreneur, deliverer } = useSelector(state => state.auth)

  // Check entrepreneur status when app loads or user logs in
  useEffect(() => {
    if (isAuthenticated && token) {
      // Always check entrepreneur status when authenticated, even if we have entrepreneur data
      // This ensures we have the latest data after login
      checkEntrepreneurWithToken(token)
        .then(result => {
          if (result.is_entrepreneur && result.entrepreneur) {
            dispatch(setEntrepreneur(result.entrepreneur))
          } else if (entrepreneur) {
            // If we had entrepreneur data but check says user is not entrepreneur, clear it
            dispatch(setEntrepreneur(null))
          }
        })
        .catch(() => {
          // User is not an entrepreneur, that's fine - don't clear existing data on error
        })
      
      // Check deliverer status when authenticated
      dispatch(fetchDelivererStatus())
        .then(result => {
          if (result.type === 'deliverer/fetchStatus/fulfilled') {
            const data = result.payload
            if (data && data.is_deliverer && data.deliverer) {
              dispatch(setDeliverer(data.deliverer))
            } else if (deliverer) {
              // If we had deliverer data but check says user is not deliverer, clear it
              dispatch(setDeliverer(null))
            }
          } else if (result.type === 'deliverer/fetchStatus/rejected' && deliverer) {
            // If fetch failed and we had deliverer data, clear it
            dispatch(setDeliverer(null))
          }
        })
        .catch(() => {
          // User is not a deliverer, that's fine - don't clear existing data on error
        })
    } else if (!isAuthenticated) {
      if (entrepreneur) {
        dispatch(setEntrepreneur(null))
      }
      if (deliverer) {
        dispatch(setDeliverer(null))
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, token])

  return (
    <div className="app">
      <ErrorBoundary
        title="Navigation Error"
        message="An error occurred while loading the navigation. Please refresh the page."
      >
        <NavBar />
      </ErrorBoundary>
      <main className="app-main">
        <ErrorBoundary
          title="Page Error"
          message="An error occurred while loading this page. Please try again or go back."
          showDetails={process.env.NODE_ENV === 'development'}
        >
          <Routes>
            <Route path="/" element={<MarketplaceHome />} />
            <Route path="/browse" element={<BrowsePage />} />
            <Route path="/categories/:categorySlug" element={<CategoriesPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/stores/:id" element={<StoreDetail />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/my-store" element={<MyStore />} />
            <Route path="/my-store/settings" element={<SellerRoute><StoreSettings /></SellerRoute>} />
            <Route path="/orders" element={<OrderHistory userRole="buyer" />} />
            <Route path="/wallet" element={<Wallet />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/login" element={<Login />} />
            <Route path="/open-store" element={<OpenStore />} />
            <Route path="/become-deliverer" element={<BecomeDeliverer />} />
            <Route path="/deliverer-dashboard" element={<DelivererDashboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ErrorBoundary>
      </main>
      <ErrorBoundary
        title="Footer Error"
        message="An error occurred while loading the footer."
      >
        <Footer />
      </ErrorBoundary>
      <DevMenu />
    </div>
  )
}

export default App

