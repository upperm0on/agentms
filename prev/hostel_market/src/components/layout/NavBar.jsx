import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Store, Search, XCircle, Menu, X, ShoppingCart, Wallet, Heart, Compass, LayoutGrid, ArrowRight, LogOut, Truck } from 'lucide-react'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../../store/slices/authSlice'
import { useToast } from '../../contexts/ToastContext'
import LogoutModal from '../common/LogoutModal'
import './NavBar.css'

function NavBar() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { success } = useToast()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const { isAuthenticated, entrepreneur, deliverer } = useSelector(state => state.auth)
  const { isDeliverer } = useSelector(state => state.deliverer)
  const ordersCount = useSelector(state => state.orders?.orders?.length || 0)
  const favoritesCount = useSelector(state => state.favorites?.ids?.length || 0)
  
  // Show My Store button if entrepreneur has a store
  // Check both store object (even if empty) and store_id
  const hasStore = !!(entrepreneur && ((entrepreneur.store !== null && entrepreneur.store !== undefined) || entrepreneur?.store_id))
  
  // Show Deliverer Dashboard if user is a deliverer
  const showDelivererDashboard = isAuthenticated && (isDeliverer || deliverer)

  const handleLogoutClick = () => {
    setShowLogoutModal(true)
    setIsMobileMenuOpen(false)
  }

  const handleLogoutConfirm = () => {
    setShowLogoutModal(false)
    dispatch(logout())
    success('Logged out successfully')
    navigate('/')
  }

  const handleLogoutCancel = () => {
    setShowLogoutModal(false)
  }
  
  return (
    <nav className="marketplace-navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" onClick={() => setIsMobileMenuOpen(false)}>
          <Store size={24} />
          <span>sitysns Marketplace</span>
        </Link>
        
        {/* Desktop Navigation */}
        <div className="navbar-desktop">
          <div className="navbar-search">
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Search stores, products, services..." 
              className="navbar-search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  navigate(search ? `/browse?q=${encodeURIComponent(search)}` : '/browse')
                }
              }}
            />
            {search && (
              <button
                aria-label="Clear search"
                className="navbar-search-clear"
                onClick={() => setSearch('')}
              >
                <XCircle size={16} />
              </button>
            )}
            <button
              className="navbar-search-submit"
              aria-label="Search"
              onClick={() => navigate(search ? `/browse?q=${encodeURIComponent(search)}` : '/browse')}
            >
              <ArrowRight size={18} />
            </button>
          </div>
          
          <ul className="navbar-links">
            <li>
              <Link to="/browse" className="navbar-icon-link" aria-label="Browse" title="Browse">
                <Compass size={20} />
              </Link>
            </li>
            <li>
              <Link to="/categories" className="navbar-icon-link" aria-label="Categories" title="Categories">
                <LayoutGrid size={20} />
              </Link>
            </li>
          </ul>
          
          {isAuthenticated ? (
            <div className="navbar-user">
              <Link to="/orders" className="navbar-icon-link">
                <ShoppingCart size={20} />
                <span className="badge">{ordersCount}</span>
              </Link>
              <Link to="/favorites" className="navbar-icon-link">
                <Heart size={20} />
                {favoritesCount > 0 && <span className="badge">{favoritesCount}</span>}
              </Link>
              <Link to="/wallet" className="navbar-icon-link">
                <Wallet size={20} />
              </Link>
              {hasStore && (
                <Link to="/my-store" className="navbar-icon-link navbar-store-button" aria-label="My Store" title="My Store">
                  <Store size={20} />
                </Link>
              )}
              {showDelivererDashboard && (
                <Link to="/deliverer-dashboard" className="navbar-icon-link" aria-label="Deliverer Dashboard" title="Deliverer Dashboard">
                  <Truck size={20} />
                </Link>
              )}
              <button
                onClick={handleLogoutClick}
                className="navbar-icon-link"
                aria-label="Logout"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <div className="navbar-auth">
              <Link to="/login" className="navbar-button">Login</Link>
            </div>
          )}
        </div>
        
        {/* Mobile Menu Button */}
        <button 
          className="navbar-mobile-toggle"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="navbar-mobile">
          <div className="navbar-search mobile">
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Search..." 
              className="navbar-search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setIsMobileMenuOpen(false)
                  navigate(search ? `/browse?q=${encodeURIComponent(search)}` : '/browse')
                }
              }}
            />
          </div>
          <ul className="navbar-mobile-links">
            <li>
              <Link to="/browse" onClick={() => setIsMobileMenuOpen(false)} aria-label="Browse" title="Browse">
                <Compass size={24} />
                <span className="mobile-link-text">Browse</span>
              </Link>
            </li>
            <li>
              <Link to="/categories" onClick={() => setIsMobileMenuOpen(false)} aria-label="Categories" title="Categories">
                <LayoutGrid size={24} />
                <span className="mobile-link-text">Categories</span>
              </Link>
            </li>
            
            {isAuthenticated && (
              <>
                <li>
                  <Link to="/favorites" onClick={() => setIsMobileMenuOpen(false)} aria-label="Favorites" title="Favorites">
                    <Heart size={24} />
                    {favoritesCount > 0 && <span className="mobile-badge">{favoritesCount}</span>}
                    <span className="mobile-link-text">Favorites</span>
                  </Link>
                </li>
                {hasStore && (
                  <li>
                    <Link to="/my-store" onClick={() => setIsMobileMenuOpen(false)} aria-label="My Store" title="My Store">
                      <Store size={24} />
                      <span className="mobile-link-text">My Store</span>
                    </Link>
                  </li>
                )}
                {showDelivererDashboard && (
                  <li>
                    <Link to="/deliverer-dashboard" onClick={() => setIsMobileMenuOpen(false)} aria-label="Deliverer Dashboard" title="Deliverer Dashboard">
                      <Truck size={24} />
                      <span className="mobile-link-text">Deliverer</span>
                    </Link>
                  </li>
                )}
                <li>
                  <Link to="/orders" onClick={() => setIsMobileMenuOpen(false)} aria-label="Orders" title="Orders">
                    <ShoppingCart size={24} />
                    {ordersCount > 0 && <span className="mobile-badge">{ordersCount}</span>}
                    <span className="mobile-link-text">Orders</span>
                  </Link>
                </li>
                <li>
                  <Link to="/wallet" onClick={() => setIsMobileMenuOpen(false)} aria-label="Wallet" title="Wallet">
                    <Wallet size={24} />
                    <span className="mobile-link-text">Wallet</span>
                  </Link>
                </li>
                <li>
                  <button
                    onClick={handleLogoutClick}
                    className="navbar-mobile-logout"
                    aria-label="Logout"
                    title="Logout"
                  >
                    <LogOut size={24} />
                    <span className="mobile-link-text">Logout</span>
                  </button>
                </li>
              </>
            )}
            {!isAuthenticated && (
              <>
                <li>
                  <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} aria-label="Login" title="Login">
                    <LogOut size={24} />
                    <span className="mobile-link-text">Login</span>
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={handleLogoutCancel}
        onConfirm={handleLogoutConfirm}
      />
    </nav>
  )
}

export default NavBar

