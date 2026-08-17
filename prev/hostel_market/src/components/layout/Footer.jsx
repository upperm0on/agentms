import React, { useEffect } from 'react'
import { Store, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Compass, LayoutGrid, TrendingUp, Package, Wallet as WalletIcon, Heart, Truck, Info, MessageCircle, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import BecomeSellerButton from '../marketplace/BecomeSellerButton' // Still using same component, just renamed functionality
import { useSelector, useDispatch } from 'react-redux'
import { fetchDelivererStatus } from '../../store/slices/delivererSlice'
import './Footer.css'

function Footer() {
  const dispatch = useDispatch()
  const { isAuthenticated, role, entrepreneur, deliverer } = useSelector(state => state.auth)
  const { isDeliverer, delivererProfile } = useSelector(state => state.deliverer)
  
  // Fetch deliverer status if authenticated and not already checked
  useEffect(() => {
    if (isAuthenticated && !isDeliverer && !deliverer && !delivererProfile) {
      dispatch(fetchDelivererStatus())
    }
  }, [isAuthenticated, isDeliverer, deliverer, delivererProfile, dispatch])
  
  const showBecomeSeller = isAuthenticated && role !== 'seller' && !entrepreneur
  const showBecomeDeliverer = isAuthenticated && !isDeliverer && !deliverer && !delivererProfile

  return (
    <footer className="marketplace-footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <div className="footer-logo">
              <Store size={24} />
              <span>sitysns Marketplace</span>
            </div>
            <p className="footer-description">
              Connecting students within hostels. Buy and sell products and services safely.
            </p>
            <div className="footer-social">
              <a href="#" className="social-link" aria-label="Facebook">
                <Facebook size={20} />
              </a>
              <a href="#" className="social-link" aria-label="Twitter">
                <Twitter size={20} />
              </a>
              <a href="#" className="social-link" aria-label="Instagram">
                <Instagram size={20} />
              </a>
            </div>
          </div>
          
          <div className="footer-section">
            <h3 className="footer-title">Marketplace</h3>
            <ul className="footer-links">
              <li><Link to="/browse"><Compass size={14} /> <span>Browse</span></Link></li>
              <li><Link to="/categories"><LayoutGrid size={14} /> <span>Categories</span></Link></li>
              <li><Link to="/trending"><TrendingUp size={14} /> <span>Trending</span></Link></li>
              <li><Link to="/my-store"><Store size={14} /> <span>My Store</span></Link></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h3 className="footer-title">Account</h3>
            <ul className="footer-links">
              <li><Link to="/orders"><Package size={14} /> <span>My Orders</span></Link></li>
              <li><Link to="/wallet"><WalletIcon size={14} /> <span>Wallet</span></Link></li>
              <li><Link to="/favorites"><Heart size={14} /> <span>Favorites</span></Link></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h3 className="footer-title">Support</h3>
            <ul className="footer-links">
              <li><Link to="/help"><Info size={14} /> <span>Help Center</span></Link></li>
              <li><Link to="/contact"><MessageCircle size={14} /> <span>Contact Us</span></Link></li>
              <li><Link to="/terms"><ShieldCheck size={14} /> <span>Terms of Service</span></Link></li>
              <li><Link to="/privacy"><ShieldCheck size={14} /> <span>Privacy Policy</span></Link></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h3 className="footer-title">Contact</h3>
            <div className="footer-contact">
              <div className="contact-item">
                <Mail size={16} />
                <span>support@sitysns.com</span>
              </div>
              <div className="contact-item">
                <Phone size={16} />
                <span>+233 XX XXX XXXX</span>
              </div>
              <div className="contact-item">
                <MapPin size={16} />
                <span>Ghana</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <div className="footer-actions">
            {showBecomeSeller && (
              <BecomeSellerButton variant="footer" />
            )}
            {showBecomeDeliverer && (
              <Link to="/become-deliverer" className="become-deliverer-button">
                <Truck size={16} />
                <span>Become a Deliverer</span>
              </Link>
            )}
          </div>
          <p>&copy; {new Date().getFullYear()} sitysns Marketplace. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer

