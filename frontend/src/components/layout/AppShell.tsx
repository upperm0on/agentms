import type { ReactNode } from 'react'
import { Bell, Building2, ChevronDown, Flag, LayoutDashboard, LogOut, MapPin, Menu, MessageSquareText, Plus, Settings, ShieldCheck, UserRound, Users } from 'lucide-react'
import type { Database, Role, User } from '../../api/mockApi'
import { initials } from '../../lib/uiHelpers'
import './AppShell.css'

export function Brand({ navigate }: { navigate: (path: string) => void }) {
  return <button className="brand" onClick={() => navigate('/')}><span>AM</span><strong>AgentMS</strong></button>
}

function dashboardPath(role: User['role']) {
  return role === 'Agent' ? '/agent/dashboard' : role === 'Admin' ? '/admin/dashboard' : '/student/dashboard'
}

export function PublicHeader({ path, navigate, db, notificationsOpen, setNotificationsOpen, currentUser, onLogout }: { path: string; navigate: (p: string) => void; db: Database; notificationsOpen: boolean; setNotificationsOpen: (v: boolean) => void; currentUser: User | null; onLogout: () => void }) {
  return (
    <header className="topbar public-topbar">
      <Brand navigate={navigate} />
      <nav className="topnav" aria-label="Public navigation">
        <NavButton active={path === '/'} onClick={() => navigate('/')}>Discover</NavButton>
        <NavButton active={path.startsWith('/listings')} onClick={() => navigate('/listings')}>Browse rooms</NavButton>
        {currentUser && <NavButton active={false} onClick={() => navigate(dashboardPath(currentUser.role))}>Dashboard</NavButton>}
      </nav>
      <div className="top-actions">
        <NotificationButton role={currentUser ? currentUser.role.toLowerCase() as Role : 'student'} db={db} open={notificationsOpen} setOpen={setNotificationsOpen} />
        {currentUser ? (
          <>
            <button className="btn primary" onClick={() => navigate(dashboardPath(currentUser.role))}><LayoutDashboard size={16} />Dashboard</button>
            <button className="icon-btn" aria-label="Log out" onClick={onLogout}><LogOut /></button>
          </>
        ) : (
          <>
            <button className="btn ghost desktop-only" onClick={() => navigate('/login')}>Log in</button>
            <button className="btn primary" onClick={() => navigate('/signup')}>Create account</button>
          </>
        )}
      </div>
    </header>
  )
}

export function AppShellHeader({ role, path, navigate, db, menuOpen, setMenuOpen, notificationsOpen, setNotificationsOpen, onLogout }: { role: Role; path: string; navigate: (p: string) => void; db: Database; menuOpen: boolean; setMenuOpen: (v: boolean) => void; notificationsOpen: boolean; setNotificationsOpen: (v: boolean) => void; onLogout: () => void }) {
  const studentNav = [['/student/dashboard', 'Home'], ['/listings', 'Find rooms'], ['/student/saved', 'Saved'], ['/student/inquiries', 'Inquiries']]
  const activeUser = role === 'student' ? db.profile.name : role === 'agent' ? db.agents[0]?.name : db.users.find((user) => user.role === 'Admin')?.name
  const displayName = activeUser || (role === 'admin' ? 'Admin user' : role === 'agent' ? 'Agent user' : 'Student user')
  return (
    <header className="topbar app-topbar">
      <button className="icon-btn mobile-menu" aria-label="Open navigation" onClick={() => setMenuOpen(!menuOpen)}><Menu /></button>
      <Brand navigate={navigate} />
      {role === 'student' && <nav className="topnav student-nav">{studentNav.map(([href, label]) => <NavButton key={href} active={path === href} onClick={() => navigate(href)}>{label}</NavButton>)}</nav>}
      <div className="top-actions">
        <NotificationButton role={role} db={db} open={notificationsOpen} setOpen={setNotificationsOpen} />
        <button className="avatar-button" onClick={() => navigate(role === 'student' ? '/student/profile' : role === 'agent' ? '/agent/profile' : '/admin/users')}>
          <span>{initials(displayName)}</span>
          <div className="desktop-only"><strong>{displayName}</strong><small>{role}</small></div>
          <ChevronDown size={15} className="desktop-only" />
        </button>
        <button className="icon-btn" aria-label="Log out" onClick={onLogout}><LogOut /></button>
      </div>
    </header>
  )
}

function NotificationButton({ role, db, open, setOpen }: { role: Role; db: Database; open: boolean; setOpen: (v: boolean) => void }) {
  const items = db.notifications.filter((n) => n.audience === role)
  return (
    <div className="notification-wrap">
      <button className="icon-btn" aria-label="Notifications" onClick={() => setOpen(!open)}><Bell /><span className="notification-dot">{items.filter((i) => !i.read).length}</span></button>
      {open && <div className="notification-popover"><div className="popover-heading"><strong>Notifications</strong><span>{items.length} updates</span></div>{items.length ? items.map((item) => <div className="notification-row" key={item.id}><span className={`status-dot ${item.tone}`} /><div><strong>{item.title}</strong><p>{item.body}</p><small>{item.time} ago</small></div></div>) : <p className="muted">You are all caught up.</p>}</div>}
    </div>
  )
}

const agentNav = [
  ['/agent/dashboard', 'Overview', LayoutDashboard], ['/agent/listings', 'Listings', Building2], ['/agent/profile', 'Public profile', UserRound], ['/agent/verification', 'Verification', ShieldCheck], ['/agent/settings', 'Settings', Settings],
] as const
const adminNav = [
  ['/admin/dashboard', 'Overview', LayoutDashboard], ['/admin/agents', 'Agents', ShieldCheck], ['/admin/listings', 'Listings', Building2], ['/admin/inquiries', 'Inquiries', MessageSquareText], ['/admin/reports', 'Reports', Flag], ['/admin/locations', 'Locations', MapPin], ['/admin/users', 'Users', Users],
] as const

export function Sidebar({ role, path, navigate, open, onLogout }: { role: 'agent' | 'admin'; path: string; navigate: (p: string) => void; open: boolean; onLogout: () => void }) {
  const nav = role === 'agent' ? agentNav : adminNav
  return (
    <aside className={`sidebar ${open ? 'open' : ''}`}>
      {role === 'admin' && <div className="sidebar-title"><span>Admin operations</span><strong>Trust & moderation</strong></div>}
      <nav>{nav.map(([href, label, Icon]) => <button key={href} className={path === href || (href.endsWith('listings') && path.includes('/listings/')) || (href.endsWith('agents') && path.includes('/agents/')) ? 'active' : ''} onClick={() => navigate(href)}><Icon size={18} />{label}</button>)}</nav>
      {role === 'agent' && <button className="btn primary sidebar-action" onClick={() => navigate('/agent/listings/new')}><Plus size={17} />New listing</button>}
      <div className="sidebar-foot"><button onClick={onLogout}><LogOut size={17} />Log out</button></div>
    </aside>
  )
}

function NavButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return <button className={`nav-button ${active ? 'active' : ''}`} onClick={onClick}>{children}</button>
}
