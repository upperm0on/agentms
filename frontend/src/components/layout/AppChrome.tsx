import { Bell, ChevronDown, LayoutDashboard, Building2, Inbox, UserRound, ShieldCheck, Settings, MapPin, Users, Flag, Plus, LogOut, RefreshCw, Menu } from 'lucide-react'
import type { ReactNode } from 'react'
import type { Database, Role } from '../../api/mockApi'
import type { NavigationProps, WorkspaceRole } from '../../app/types'

function Brand({ navigate }: Pick<NavigationProps, 'navigate'>) {
  return <button className="brand" onClick={() => navigate('/')}><span>AM</span><strong>AgentMS</strong></button>
}

function Notifications({ role, db }: { role: Role; db: Database }) {
  const count = db.notifications.filter((item) => item.audience === role && !item.read).length
  return <button className="icon-btn" aria-label="Notifications"><Bell /><span className="notification-dot">{count}</span></button>
}

export function PublicHeader({ path, navigate, db }: NavigationProps & { db: Database }) {
  return <header className="topbar public-topbar"><Brand navigate={navigate} /><nav className="topnav"><NavButton active={path === '/'} onClick={() => navigate('/')}>Discover</NavButton><NavButton active={path.startsWith('/listings')} onClick={() => navigate('/listings')}>Browse rooms</NavButton></nav><div className="top-actions"><Notifications role="student" db={db} /><button className="btn ghost desktop-only" onClick={() => navigate('/login')}>Log in</button><button className="btn primary" onClick={() => navigate('/signup')}>Create account</button></div></header>
}

export function WorkspaceHeader({ role, path, navigate, db, onMenu }: NavigationProps & { role: WorkspaceRole; db: Database; onMenu: () => void }) {
  const studentNav = [['/student/dashboard', 'Home'], ['/listings', 'Find rooms'], ['/student/saved', 'Saved'], ['/student/inquiries', 'Inquiries']]
  const name = role === 'student' ? 'Esi Boateng' : role === 'agent' ? 'Ama Mensah' : 'Kofi Owusu'
  return <header className="topbar app-topbar"><button className="icon-btn mobile-menu" aria-label="Open navigation" onClick={onMenu}><Menu /></button><Brand navigate={navigate} />{role === 'student' && <nav className="topnav student-nav">{studentNav.map(([href, label]) => <NavButton key={href} active={path === href} onClick={() => navigate(href)}>{label}</NavButton>)}</nav>}<div className="top-actions"><Notifications role={role} db={db} /><button className="avatar-button" onClick={() => navigate(role === 'student' ? '/student/profile' : role === 'agent' ? '/agent/profile' : '/admin/users')}><span>{role === 'student' ? 'EB' : role === 'agent' ? 'AM' : 'KO'}</span><div className="desktop-only"><strong>{name}</strong><small>{role}</small></div><ChevronDown size={15} className="desktop-only" /></button></div></header>
}

export function PrototypeRail({ role, navigate, onReset }: { role: WorkspaceRole; navigate: (path: string) => void; onReset: () => void }) {
  return <div className="prototype-rail"><span>Interactive prototype</span><div className="segmented"><button className={role === 'student' ? 'active' : ''} onClick={() => navigate('/student/dashboard')}>Student</button><button className={role === 'agent' ? 'active' : ''} onClick={() => navigate('/agent/dashboard')}>Agent</button><button className={role === 'admin' ? 'active' : ''} onClick={() => navigate('/admin/dashboard')}>Admin</button></div><button className="rail-reset" onClick={onReset}><RefreshCw size={13} />Reset data</button></div>
}

const agentLinks = [['/agent/dashboard', 'Overview', LayoutDashboard], ['/agent/listings', 'Listings', Building2], ['/agent/inquiries', 'Inquiries', Inbox], ['/agent/profile', 'Public profile', UserRound], ['/agent/verification', 'Verification', ShieldCheck], ['/agent/settings', 'Settings', Settings]] as const
const adminLinks = [['/admin/dashboard', 'Overview', LayoutDashboard], ['/admin/agents', 'Agents', ShieldCheck], ['/admin/listings', 'Listings', Building2], ['/admin/reports', 'Reports', Flag], ['/admin/locations', 'Locations', MapPin], ['/admin/users', 'Users', Users]] as const

export function WorkspaceSidebar({ role, path, navigate, open }: NavigationProps & { role: Exclude<WorkspaceRole, 'student'>; open: boolean }) {
  const links = role === 'agent' ? agentLinks : adminLinks
  return <aside className={`sidebar ${open ? 'open' : ''}`}><div className="sidebar-title"><span>{role === 'agent' ? 'Agent workspace' : 'Admin operations'}</span><strong>{role === 'agent' ? 'CampusKey Rooms' : 'Trust & moderation'}</strong></div><nav>{links.map(([href, label, Icon]) => <button key={href} className={path === href || (href.endsWith('listings') && path.includes('/listings/')) || (href.endsWith('agents') && path.includes('/agents/')) ? 'active' : ''} onClick={() => navigate(href)}><Icon size={18} />{label}</button>)}</nav>{role === 'agent' && <button className="btn primary sidebar-action" onClick={() => navigate('/agent/listings/new')}><Plus size={17} />New listing</button>}<div className="sidebar-foot"><button onClick={() => navigate('/')}><LogOut size={17} />Exit workspace</button></div></aside>
}

function NavButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return <button className={`nav-button ${active ? 'active' : ''}`} onClick={onClick}>{children}</button>
}
