import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Menu, Bell, Search, User, LogOut } from 'lucide-react'
import './Header.css'

function Header({ onToggleSidebar }) {
  const { user, logout } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)

  const handleLogout = () => {
    logout()
  }

  return (
    <header className="header">
      <div className="header-left">
        <button className="header-menu-btn" onClick={onToggleSidebar}>
          <Menu size={20} />
        </button>
        <div className="header-search">
          <Search size={16} />
          <input 
            type="text" 
            placeholder="Search..." 
            className="header-search-input"
          />
        </div>
      </div>

      <div className="header-right">
        <button className="header-notification-btn">
          <Bell size={20} />
          <span className="notification-badge">3</span>
        </button>

        <div className="header-user">
          <button 
            className="header-user-btn"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <div className="user-avatar">
              <User size={16} />
            </div>
            <span className="user-name">{user?.name || 'Admin'}</span>
          </button>

          {showUserMenu && (
            <div className="user-menu">
              <div className="user-menu-header">
                <div className="user-info">
                  <div className="user-avatar-large">
                    <User size={20} />
                  </div>
                  <div>
                    <div className="user-name-large">{user?.name || 'Admin'}</div>
                    <div className="user-email">{user?.email || 'admin@hostel.com'}</div>
                  </div>
                </div>
              </div>
              <div className="user-menu-divider"></div>
              <button className="user-menu-item" onClick={handleLogout}>
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
