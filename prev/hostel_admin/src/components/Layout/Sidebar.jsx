import { NavLink } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  Calendar, 
  BarChart3, 
  Database,
  Settings,
  X,
  LogOut
} from 'lucide-react'
import { useDispatch } from 'react-redux'
import { logoutAdmin } from '../../store/slices/authSlice'
import './Sidebar.css'

function Sidebar({ isOpen, onClose }) {
  const dispatch = useDispatch()

  const handleLogout = () => {
    dispatch(logoutAdmin())
  }

  const menuItems = [
    {
      path: '/dashboard',
      icon: LayoutDashboard,
      label: 'Dashboard',
      exact: true
    },
    {
      path: '/hostels',
      icon: Building2,
      label: 'Hostels'
    },
    {
      path: '/users',
      icon: Users,
      label: 'Users'
    },
    {
      path: '/reservations',
      icon: Calendar,
      label: 'Reservations'
    },
    {
      path: '/database',
      icon: Database,
      label: 'Database'
    },
    {
      path: '/settings',
      icon: Settings,
      label: 'Settings'
    }
  ]

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
      
      <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <Building2 size={24} />
            <span>Hostel Admin</span>
          </div>
          <button className="sidebar-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => 
                  `sidebar-link ${isActive ? 'active' : ''}`
                }
                onClick={onClose}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-logout" onClick={handleLogout}>
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
