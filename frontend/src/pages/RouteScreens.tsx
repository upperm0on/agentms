import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import {
  Archive, ArrowLeft, Bell, Bookmark, Building2, Check, CheckCircle2,
  ChevronDown, ChevronRight, CircleAlert, Clock3, Eye, EyeOff, FileCheck2, Flag,
  Heart, Inbox, KeyRound, LayoutDashboard, ListFilter, LoaderCircle, LockKeyhole, LogOut,
  Mail, MapPin, Menu, MessageSquareText, Pencil, Phone, Plus, RefreshCw,
  Search, Send, Settings, ShieldCheck, SlidersHorizontal, Trash2, Upload, UserRound,
  Users, X,
} from 'lucide-react'
import {
  loadDatabase,
  type Agent, type Database, type Inquiry, type InquiryStatus, type Listing, type Report,
  type Role, type Tone,
} from '../api/mockApi'
import { loadBackendDatabase, persistBackendMutation } from '../api/backendApi'
import { Workscape } from '../workscape/Workscape'
import '../App.css'

type ModalState =
  | { type: 'inquiry'; listing: Listing }
  | { type: 'report'; listing: Listing }
  | { type: 'location'; locationId?: string }
  | { type: 'confirm'; title: string; body: string; action: () => void; danger?: boolean }
  | null

const money = new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS', maximumFractionDigits: 0 })

function usePath() {
  const [path, setPath] = useState(window.location.pathname === '/index.html' ? '/' : window.location.pathname)
  useEffect(() => {
    const onPop = () => setPath(window.location.pathname)
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])
  const navigate = (next: string) => {
    window.history.pushState({}, '', next)
    setPath(next)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  return { path, navigate }
}

function App() {
  const { path, navigate } = usePath()
  const [db, setDb] = useState(loadDatabase)
  const [modal, setModal] = useState<ModalState>(null)
  const [toast, setToast] = useState('')
  const [busy, setBusy] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)

  const role: Role = path.startsWith('/agent') ? 'agent' : path.startsWith('/admin') ? 'admin' : path.startsWith('/student') ? 'student' : 'public'
  const effectiveRole: Role = role === 'public' ? 'student' : role

  async function refreshFromBackend(nextRole = role) {
    try {
      const remote = await loadBackendDatabase(nextRole)
      setDb(remote)
    } catch (error) {
      console.error('Backend refresh failed', error)
      setToast('Backend API unavailable; showing cached prototype data')
      window.setTimeout(() => setToast(''), 3200)
    }
  }

  useEffect(() => {
    refreshFromBackend(role)
  }, [role])

  const go = (next: string) => {
    setMenuOpen(false)
    setNotificationsOpen(false)
    navigate(next)
  }

  async function mutate(message: string, update: (draft: Database) => void) {
    setBusy(true)
    const before = structuredClone(db)
    const draft = structuredClone(db)
    update(draft)
    setDb(draft)
    try {
      await persistBackendMutation(before, draft, role)
      await refreshFromBackend(role)
    } catch (error) {
      console.error('Backend mutation failed', error)
      setToast('Backend update failed; local preview updated only')
    }
    setBusy(false)
    setModal(null)
    if (!toast) setToast(message)
    window.setTimeout(() => setToast(''), 3200)
  }

  function restoreDemo() {
    refreshFromBackend(role)
    setToast('Backend data reloaded')
  }

  const app = { db, path, navigate: go, mutate, setModal, busy }

  if (path === '/workscape') return <Workscape navigate={go} />

  return (
    <div className={`app role-${role}`}>
      {role === 'public' ? (
        <PublicHeader path={path} navigate={go} db={db} notificationsOpen={notificationsOpen} setNotificationsOpen={setNotificationsOpen} />
      ) : (
        <AppShellHeader role={role} path={path} navigate={go} db={db} menuOpen={menuOpen} setMenuOpen={setMenuOpen} notificationsOpen={notificationsOpen} setNotificationsOpen={setNotificationsOpen} />
      )}
      <PrototypeRail role={effectiveRole} navigate={go} restoreDemo={restoreDemo} />
      <main className={role === 'agent' || role === 'admin' ? 'with-sidebar' : ''}>
        {(role === 'agent' || role === 'admin') && <Sidebar role={role} path={path} navigate={navigate} open={menuOpen} db={db} />}
        <div className={role === 'agent' || role === 'admin' ? 'workspace' : ''}>
          <Router {...app} />
        </div>
      </main>
      {modal && <Modal modal={modal} db={db} mutate={mutate} close={() => setModal(null)} busy={busy} />}
      {toast && <div className="toast" role="status"><CheckCircle2 size={18} />{toast}</div>}
    </div>
  )
}

type AppProps = {
  db: Database
  path: string
  navigate: (path: string) => void
  mutate: (message: string, update: (draft: Database) => void) => Promise<void>
  setModal: (modal: ModalState) => void
  busy: boolean
}

function Router(props: AppProps) {
  const { path } = props
  if (path === '/') return <HomePage {...props} />
  if (path === '/listings') return <ListingsPage {...props} />
  if (/^\/listings\/[^/]+$/.test(path)) return <ListingDetailPage {...props} id={path.split('/')[2]} />
  if (/^\/agents\/[^/]+$/.test(path)) return <PublicAgentPage {...props} id={path.split('/')[2]} />
  if (path === '/login' || path === '/signup' || path === '/forgot-password' || path === '/reset-password' || path.startsWith('/verify-email')) return <AuthPage {...props} />
  if (path === '/student/dashboard') return <StudentDashboard {...props} />
  if (path === '/student/inquiries') return <StudentInquiries {...props} />
  if (path === '/student/saved') return <StudentSaved {...props} />
  if (path === '/student/profile') return <StudentProfile {...props} />
  if (path === '/agent/dashboard') return <AgentDashboard {...props} />
  if (path === '/agent/profile') return <AgentProfile {...props} />
  if (path === '/agent/verification') return <AgentVerification {...props} />
  if (path === '/agent/listings') return <AgentListings {...props} />
  if (path === '/agent/listings/new') return <ListingFormPage {...props} />
  if (/^\/agent\/listings\/[^/]+\/edit$/.test(path)) return <ListingFormPage {...props} id={path.split('/')[3]} />
  if (path === '/agent/inquiries') return <AgentInquiries {...props} />
  if (path === '/agent/settings') return <AgentSettings {...props} />
  if (path === '/admin/dashboard') return <AdminDashboard {...props} />
  if (path === '/admin/agents') return <AdminAgents {...props} />
  if (/^\/admin\/agents\/[^/]+$/.test(path)) return <AdminAgentDetail {...props} id={path.split('/')[3]} />
  if (path === '/admin/listings') return <AdminListings {...props} />
  if (path === '/admin/reports') return <AdminReports {...props} />
  if (path === '/admin/locations') return <AdminLocations {...props} />
  if (path === '/admin/users') return <AdminUsers {...props} />
  return <EmptyState icon={<MapPin />} title="Page not found" body="That route is not part of the AgentMS MVP." action="Return home" onAction={() => props.navigate('/')} />
}

function Brand({ navigate }: { navigate: (path: string) => void }) {
  return <button className="brand" onClick={() => navigate('/')}><span>AM</span><strong>AgentMS</strong></button>
}

function PublicHeader({ path, navigate, db, notificationsOpen, setNotificationsOpen }: { path: string; navigate: (p: string) => void; db: Database; notificationsOpen: boolean; setNotificationsOpen: (v: boolean) => void }) {
  return (
    <header className="topbar public-topbar">
      <Brand navigate={navigate} />
      <nav className="topnav" aria-label="Public navigation">
        <NavButton active={path === '/'} onClick={() => navigate('/')}>Discover</NavButton>
        <NavButton active={path.startsWith('/listings')} onClick={() => navigate('/listings')}>Browse rooms</NavButton>
      </nav>
      <div className="top-actions">
        <NotificationButton role="student" db={db} open={notificationsOpen} setOpen={setNotificationsOpen} />
        <button className="btn ghost desktop-only" onClick={() => navigate('/login')}>Log in</button>
        <button className="btn primary" onClick={() => navigate('/signup')}>Create account</button>
      </div>
    </header>
  )
}

function AppShellHeader({ role, path, navigate, db, menuOpen, setMenuOpen, notificationsOpen, setNotificationsOpen }: { role: Role; path: string; navigate: (p: string) => void; db: Database; menuOpen: boolean; setMenuOpen: (v: boolean) => void; notificationsOpen: boolean; setNotificationsOpen: (v: boolean) => void }) {
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
      </div>
    </header>
  )
}

function PrototypeRail({ role, navigate, restoreDemo }: { role: Role; navigate: (p: string) => void; restoreDemo: () => void }) {
  return (
    <div className="prototype-rail">
      <span>Interactive prototype</span>
      <div className="segmented">
        <button className={role === 'student' ? 'active' : ''} onClick={() => navigate('/student/dashboard')}>Student</button>
        <button className={role === 'agent' ? 'active' : ''} onClick={() => navigate('/agent/dashboard')}>Agent</button>
        <button className={role === 'admin' ? 'active' : ''} onClick={() => navigate('/admin/dashboard')}>Admin</button>
      </div>
      <button className="rail-workscape" onClick={() => navigate('/workscape')}><Eye size={13} /> Workscape</button>
      <button className="rail-reset" onClick={restoreDemo}><RefreshCw size={13} /> Reset data</button>
    </div>
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
  ['/agent/dashboard', 'Overview', LayoutDashboard], ['/agent/listings', 'Listings', Building2], ['/agent/inquiries', 'Inquiries', Inbox], ['/agent/profile', 'Public profile', UserRound], ['/agent/verification', 'Verification', ShieldCheck], ['/agent/settings', 'Settings', Settings],
] as const
const adminNav = [
  ['/admin/dashboard', 'Overview', LayoutDashboard], ['/admin/agents', 'Agents', ShieldCheck], ['/admin/listings', 'Listings', Building2], ['/admin/reports', 'Reports', Flag], ['/admin/locations', 'Locations', MapPin], ['/admin/users', 'Users', Users],
] as const

function Sidebar({ role, path, navigate, open, db }: { role: 'agent' | 'admin'; path: string; navigate: (p: string) => void; open: boolean; db: Database }) {
  const nav = role === 'agent' ? agentNav : adminNav
  return (
    <aside className={`sidebar ${open ? 'open' : ''}`}>
      <div className="sidebar-title"><span>{role === 'agent' ? 'Agent workspace' : 'Admin operations'}</span><strong>{role === 'agent' ? db.agents[0]?.business ?? 'Agent inventory' : 'Trust & moderation'}</strong></div>
      <nav>{nav.map(([href, label, Icon]) => <button key={href} className={path === href || (href.endsWith('listings') && path.includes('/listings/')) || (href.endsWith('agents') && path.includes('/agents/')) ? 'active' : ''} onClick={() => navigate(href)}><Icon size={18} />{label}</button>)}</nav>
      {role === 'agent' && <button className="btn primary sidebar-action" onClick={() => navigate('/agent/listings/new')}><Plus size={17} />New listing</button>}
      <div className="sidebar-foot"><button onClick={() => navigate('/')}><LogOut size={17} />Exit workspace</button></div>
    </aside>
  )
}

function NavButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return <button className={`nav-button ${active ? 'active' : ''}`} onClick={onClick}>{children}</button>
}

function HomePage(props: AppProps) {
  const [query, setQuery] = useState('')
  const fresh = props.db.listings.filter((l) => l.status === 'Published' && l.moderation === 'Approved').slice(0, 3)
  return (
    <>
      <section className="home-hero">
        <div className="hero-copy"><div className="trust-kicker"><ShieldCheck size={16} /> Verified agents, current rooms</div><h1>Know what is available before you make the trip.</h1><p>Search student rooms around Ghana's campuses, see when availability was last confirmed, and speak directly with a trusted agent.</p>
          <form className="hero-search" onSubmit={(e) => { e.preventDefault(); props.navigate(`/listings${query ? `?q=${encodeURIComponent(query)}` : ''}`) }}><MapPin size={20} /><input aria-label="Campus or area" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search KNUST, Ayeduase, Legon..." /><button className="btn primary" type="submit"><Search size={18} />Find a room</button></form>
          <div className="popular"><span>Popular:</span>{['Ayeduase', 'Kotei', 'East Legon'].map((x) => <button key={x} onClick={() => props.navigate(`/listings?q=${x}`)}>{x}</button>)}</div>
        </div>
        <div className="hero-property"><img src="/images/room-5.jpeg" alt="Bright furnished student room" /><div className="hero-property-label"><div><Badge tone="success">Confirmed today</Badge><strong>Rooms near KNUST</strong><span>From GHS 2,400 / academic year</span></div><button className="icon-btn light" onClick={() => props.navigate('/listings')} aria-label="Browse rooms"><ChevronRight /></button></div></div>
      </section>
      <section className="content-section"><SectionHeading eyebrow="Fresh inventory" title="Available near campus" description="Listings agents have checked recently." action={<button className="text-button" onClick={() => props.navigate('/listings')}>View all rooms <ChevronRight size={16} /></button>} /><ListingGrid listings={fresh} {...props} /></section>
      <section className="trust-band"><div><ShieldCheck /><strong>Verified identity</strong><span>Know who you are dealing with.</span></div><div><Clock3 /><strong>Freshness first</strong><span>Every listing shows its last check.</span></div><div><Flag /><strong>Accountable listings</strong><span>Report details that do not match.</span></div></section>
    </>
  )
}

function ListingsPage(props: AppProps) {
  const params = new URLSearchParams(window.location.search)
  const [query, setQuery] = useState(params.get('q') ?? '')
  const [campus, setCampus] = useState('All campuses')
  const [availability, setAvailability] = useState('Any availability')
  const [sort, setSort] = useState('Freshest')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [filtersCollapsed, setFiltersCollapsed] = useState(false)
  const activeFilterCount = Number(Boolean(query)) + Number(campus !== 'All campuses') + Number(availability !== 'Any availability')
  const clearFilters = () => {
    setQuery('')
    setCampus('All campuses')
    setAvailability('Any availability')
  }
  const filtered = useMemo(() => {
    const term = query.toLowerCase()
    return props.db.listings.filter((l) => l.status === 'Published' && l.moderation !== 'Rejected' && (!term || `${l.title} ${l.campus} ${l.area}`.toLowerCase().includes(term)) && (campus === 'All campuses' || l.campus === campus) && (availability === 'Any availability' || l.availability === availability)).sort((a, b) => sort === 'Lowest price' ? a.price - b.price : sort === 'Highest price' ? b.price - a.price : freshnessRank(a.freshness) - freshnessRank(b.freshness))
  }, [props.db.listings, query, campus, availability, sort])
  return (
    <div className={`browse-layout ${filtersCollapsed ? 'filters-collapsed' : ''}`}>
      <aside className={`filter-rail ${filtersOpen ? 'open' : ''} ${filtersCollapsed ? 'collapsed' : ''}`}>
        <div className="filter-icon-rail" aria-label="Filter shortcuts">
          <button className="icon-btn has-tip" data-tip="Open filters" aria-label="Open filters" onClick={() => setFiltersCollapsed(false)}><SlidersHorizontal /></button>
          <button className={`icon-btn has-tip ${campus !== 'All campuses' ? 'active' : ''}`} data-tip="Campus filter" aria-label="Campus filter" onClick={() => setFiltersCollapsed(false)}><MapPin /></button>
          <button className={`icon-btn has-tip ${availability !== 'Any availability' ? 'active' : ''}`} data-tip="Availability filter" aria-label="Availability filter" onClick={() => setFiltersCollapsed(false)}><CheckCircle2 /></button>
          <button className="icon-btn has-tip" data-tip="Clear filters" aria-label="Clear filters" onClick={clearFilters}><RefreshCw /></button>
        </div>
        <div className="filter-panel-content">
          <div className="filter-title"><strong>Filters {activeFilterCount > 0 && <span>{activeFilterCount}</span>}</strong><div className="filter-title-actions"><button className="icon-btn desktop-filter-toggle has-tip tip-left" data-tip="Collapse filters" aria-label="Collapse filters" onClick={() => setFiltersCollapsed(true)}><ChevronRight /></button><button className="icon-btn mobile-only" aria-label="Close filters" onClick={() => setFiltersOpen(false)}><X /></button></div></div>
          <FilterGroup label="Campus"><select value={campus} onChange={(e) => setCampus(e.target.value)}><option>All campuses</option>{[...new Set(props.db.listings.map((l) => l.campus))].map((x) => <option key={x}>{x}</option>)}</select></FilterGroup>
          <FilterGroup label="Availability"><select value={availability} onChange={(e) => setAvailability(e.target.value)}><option>Any availability</option><option>Available</option><option>Limited</option><option>Full</option></select></FilterGroup>
          <FilterGroup label="Price range"><div className="price-inputs"><input placeholder="Min" inputMode="numeric" /><input placeholder="Max" inputMode="numeric" /></div></FilterGroup>
          <FilterGroup label="Room type"><label className="check"><input type="checkbox" /> Single room</label><label className="check"><input type="checkbox" /> Shared room</label><label className="check"><input type="checkbox" /> Self-contained</label></FilterGroup>
          <FilterGroup label="Freshness"><label className="check"><input type="checkbox" defaultChecked /> Confirmed this week</label></FilterGroup>
        </div>
      </aside>
      <section className="browse-results"><div className="page-header compact-page"><div><span className="eyebrow">Room discovery</span><h1>Find a room that is still available</h1><p>{filtered.length} listings match your search</p></div></div><div className="search-toolbar"><div className="input-with-icon"><Search size={18} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search campus, area, or property" /></div><button className="btn secondary filter-button" onClick={() => setFiltersOpen(true)}><SlidersHorizontal size={17} />Filters</button><select aria-label="Sort listings" value={sort} onChange={(e) => setSort(e.target.value)}><option>Freshest</option><option>Lowest price</option><option>Highest price</option></select></div>{filtered.length ? <ListingGrid listings={filtered} {...props} /> : <EmptyState icon={<Search />} title="No rooms match those filters" body="Try another area or widen your availability filter." action="Clear filters" onAction={clearFilters} />}</section>
    </div>
  )
}

function ListingGrid({ listings, navigate, mutate }: { listings: Listing[] } & AppProps) {
  const [activeHintId, setActiveHintId] = useState<string | null>(null)
  const firstAvailability = useMemo(() => firstByValue(listings, (listing) => listing.availability), [listings])
  const firstFreshness = useMemo(() => firstByValue(listings, (listing) => listing.freshness), [listings])
  const firstVerified = listings.find((listing) => listing.verified)?.id
  return <div className="listing-grid">{listings.map((listing) => <ListingCard key={listing.id} listing={listing} navigate={navigate} mutate={mutate} activeHint={activeHintId === listing.id} showAvailabilityHint={firstAvailability[listing.availability] === listing.id} showFreshnessHint={firstFreshness[listing.freshness] === listing.id} showVerifiedHint={firstVerified === listing.id} activateHint={() => setActiveHintId(listing.id)} clearHint={() => setActiveHintId((current) => current === listing.id ? null : current)} />)}</div>
}

function ListingCard({ listing, navigate, mutate, activeHint, showAvailabilityHint, showFreshnessHint, showVerifiedHint, activateHint, clearHint }: { listing: Listing; navigate: (p: string) => void; mutate: AppProps['mutate']; activeHint: boolean; showAvailabilityHint: boolean; showFreshnessHint: boolean; showVerifiedHint: boolean; activateHint: () => void; clearHint: () => void }) {
  return (
    <article className="listing-card" onMouseEnter={activateHint} onMouseLeave={clearHint} onFocusCapture={activateHint} onBlur={clearHint} onWheel={activateHint} onTouchStart={activateHint}><button className="listing-image" onClick={() => navigate(`/listings/${listing.id}`)}><img src={listing.image} alt={listing.title} /></button><button className={`save-button ${listing.saved ? 'saved' : ''}`} aria-label={listing.saved ? 'Remove from saved' : 'Save listing'} onClick={() => mutate(listing.saved ? 'Removed from saved rooms' : 'Saved for later', (draft) => { const item = draft.listings.find((l) => l.id === listing.id); if (item) item.saved = !item.saved })}>{listing.saved ? <Heart fill="currentColor" /> : <Heart />}</button><div className="listing-content"><button className="listing-title" onClick={() => navigate(`/listings/${listing.id}`)}><strong>{listing.title}</strong><span>{listing.property}</span></button><div className="location"><MapPin size={15} />{listing.area} · {listing.campus}</div><div className="listing-bottom"><div><strong>{money.format(listing.price)}</strong><span> / {listing.period}</span></div><span>{listing.occupancy}</span></div><div className="listing-signals"><SignalTag kind="availability" value={listing.availability} active={activeHint && showAvailabilityHint} explain={showAvailabilityHint} /><SignalTag kind="freshness" value={listing.freshness} active={activeHint && showFreshnessHint} explain={showFreshnessHint} /><span className="signal-slot">{listing.verified && <SignalTag kind="verified" value="Verified agent" active={activeHint && showVerifiedHint} explain={showVerifiedHint} />}</span></div></div></article>
  )
}

function ListingDetailPage(props: AppProps & { id: string }) {
  const listing = props.db.listings.find((l) => l.id === props.id)
  if (!listing) return <EmptyState icon={<Building2 />} title="Listing unavailable" body="This room may have been removed." action="Browse rooms" onAction={() => props.navigate('/listings')} />
  const agent = props.db.agents.find((a) => a.id === listing.agentId)
  return (
    <div className="detail-page"><button className="back-button" onClick={() => props.navigate('/listings')}><ArrowLeft size={17} />Back to results</button><div className="gallery"><img className="gallery-main" src={listing.image} alt={listing.title} /><img src="/images/room-2.png" alt="Room interior detail" /><img src="/images/room-4.png" alt="Property interior detail" /></div><div className="detail-grid"><article className="detail-main"><div className="detail-title"><div><div className="badge-row"><SignalTag kind="availability" value={listing.availability} /><SignalTag kind="freshness" value={listing.freshness} />{listing.verified && <SignalTag kind="verified" value="Verified agent" />}</div><h1>{listing.title}</h1><p><MapPin size={17} />{listing.property}, {listing.area} · {listing.campus}</p></div><button className={`icon-btn ${listing.saved ? 'saved' : ''}`} onClick={() => props.mutate('Saved rooms updated', (draft) => { const item = draft.listings.find((l) => l.id === listing.id); if (item) item.saved = !item.saved })}><Bookmark fill={listing.saved ? 'currentColor' : 'none'} /></button></div><div className="key-facts"><Fact label="Room" value={listing.occupancy} /><Fact label="Gender" value={listing.gender} /><Fact label="Capacity" value={`${listing.slots} of ${listing.capacity} slots`} /><Fact label="Updated" value={listing.updatedAt} /></div><DetailSection title="About this room"><p>{listing.description}</p></DetailSection><DetailSection title="Amenities"><div className="amenities">{listing.amenities.map((a) => <span key={a}><Check size={15} />{a}</span>)}</div></DetailSection><DetailSection title="House rules"><ul>{listing.rules.map((r) => <li key={r}>{r}</li>)}</ul></DetailSection><button className="report-link" onClick={() => props.setModal({ type: 'report', listing })}><Flag size={15} />Report inaccurate information</button></article><aside className="booking-panel"><span className="eyebrow">Annual rate</span><div className="detail-price">{money.format(listing.price)}<small> / {listing.period}</small></div><p>Ask the agent first, or continue with a one-time booking flow without creating a student account.</p><button className="btn primary full" disabled={listing.availability === 'Full'} onClick={() => props.setModal({ type: 'inquiry', listing })}><MessageSquareText size={18} />{listing.availability === 'Full' ? 'Currently full' : 'Ask about this room'}</button>{agent && <AgentMiniCard agent={agent} navigate={props.navigate} />}</aside></div>
    </div>
  )
}

function PublicAgentPage(props: AppProps & { id: string }) {
  const agent = props.db.agents.find((a) => a.id === props.id)
  if (!agent) return <EmptyState icon={<UserRound />} title="Agent not found" body="This public profile is unavailable." action="Browse listings" onAction={() => props.navigate('/listings')} />
  const agentListings = props.db.listings.filter((l) => l.agentId === agent.id && l.status === 'Published')
  return <div className="content-section agent-public"><button className="back-button" onClick={() => props.navigate('/listings')}><ArrowLeft size={17} />Back to rooms</button><div className="profile-hero"><div className="profile-avatar">{initials(agent.name)}</div><div><Badge tone={agent.verification === 'Verified' ? 'success' : 'warning'}><ShieldCheck size={13} />{agent.verification}</Badge><h1>{agent.name}</h1><p>{agent.business}</p><span><MapPin size={15} />{agent.areas.join(', ')}</span></div><a className="btn primary" href={`tel:${agent.phone}`}><Phone size={17} />Call agent</a></div><div className="metric-grid"><Metric label="Response rate" value={`${agent.responseRate}%`} detail="Past 90 days" /><Metric label="Freshness score" value={`${agent.freshnessScore}%`} detail="Current listings" /><Metric label="Active rooms" value={String(agentListings.length)} detail="Published now" /></div><DetailSection title="About"><p>{agent.bio}</p></DetailSection><SectionHeading eyebrow="Current inventory" title={`Rooms from ${agent.business}`} description={`${agentListings.length} active listings`} /><ListingGrid listings={agentListings} {...props} /></div>
}

function AuthPage(props: AppProps) {
  const { path, navigate, busy } = props
  const [role, setRole] = useState<'Student' | 'Agent'>('Student')
  const [sent, setSent] = useState(false)
  const title = path === '/login' ? 'Welcome back' : path === '/signup' ? 'Create your AgentMS account' : path === '/forgot-password' ? 'Reset your password' : path.startsWith('/verify-email') ? 'Email verified' : 'Choose a new password'
  function submit(e: FormEvent) { e.preventDefault(); setSent(true); if (path === '/login' || path === '/signup') window.setTimeout(() => navigate(role === 'Agent' ? '/agent/dashboard' : '/student/dashboard'), 500) }
  return <div className="auth-page"><section className="auth-context"><Brand navigate={navigate} /><div><span className="eyebrow">Trusted student accommodation</span><h1>Current rooms.<br />Accountable agents.</h1><p>Search and follow up without losing track of who said what or when availability was checked.</p></div><div className="auth-proof"><ShieldCheck /><span><strong>Freshness is visible</strong>Every room shows its last confirmation.</span></div></section><section className="auth-form-wrap"><form className="form-card" onSubmit={submit}><button className="back-button" type="button" onClick={() => navigate('/')}><ArrowLeft size={17} />Back to search</button>{path.startsWith('/verify-email') ? <><div className="success-illustration"><Mail /><CheckCircle2 /></div><h2>{title}</h2><p>Your account is ready. Continue to your student dashboard.</p><button className="btn primary full" type="button" onClick={() => navigate('/student/dashboard')}>Continue</button></> : <><div><span className="eyebrow">{path === '/login' ? 'Sign in' : 'Account access'}</span><h2>{title}</h2><p>{path === '/forgot-password' ? 'We will send a reset link to your verified email.' : path === '/reset-password' ? 'Use at least 8 characters with one number.' : 'Use the prototype with either role.'}</p></div>{(path === '/login' || path === '/signup') && <div className="segmented large"><button type="button" className={role === 'Student' ? 'active' : ''} onClick={() => setRole('Student')}>Student</button><button type="button" className={role === 'Agent' ? 'active' : ''} onClick={() => setRole('Agent')}>Agent</button></div>}{path === '/signup' && <div className="form-row"><Field label="First name"><input required placeholder="Esi" /></Field><Field label="Last name"><input required placeholder="Boateng" /></Field></div>}<Field label="Email address"><input required type="email" defaultValue="esi@knust.edu.gh" /></Field>{path !== '/forgot-password' && <Field label={path === '/reset-password' ? 'New password' : 'Password'}><input required type="password" defaultValue="password12" /></Field>}{path === '/reset-password' && <Field label="Confirm password"><input required type="password" defaultValue="password12" /></Field>}{sent && <div className="inline-success"><CheckCircle2 size={17} />{path === '/forgot-password' ? 'Reset link sent. Check your inbox.' : 'Success. Opening your workspace...'}</div>}<button className="btn primary full" disabled={busy}>{busy && <LoaderCircle className="spin" />}{path === '/login' ? 'Sign in' : path === '/signup' ? 'Create account' : path === '/forgot-password' ? 'Send reset link' : 'Update password'}</button>{path === '/login' && <button className="text-button center" type="button" onClick={() => navigate('/forgot-password')}>Forgot password?</button>}{path === '/signup' ? <p className="form-switch">Already registered? <button type="button" onClick={() => navigate('/login')}>Log in</button></p> : path === '/login' && <p className="form-switch">New to AgentMS? <button type="button" onClick={() => navigate('/signup')}>Create an account</button></p>}</>}</form></section></div>
}

function StudentDashboard(props: AppProps) {
  const studentName = props.db.profile.name
  const firstName = studentName.split(' ')[0] || 'there'
  const active = props.db.inquiries.filter((i) => !i.status.startsWith('Closed') && (!studentName || i.student === studentName))
  const saved = props.db.listings.filter((l) => l.saved)
  const viewingCount = active.filter((i) => i.status === 'Viewing Scheduled').length
  const availableSaved = saved.filter((l) => l.availability === 'Available').length
  const campusMatches = props.db.listings.filter((l) => l.status === 'Published' && l.moderation === 'Approved' && l.campus === props.db.profile.campus)
  const freshMatches = campusMatches.filter((l) => l.freshness === 'Confirmed today' || l.freshness === 'Confirmed this week').length
  return <div className="page student-page"><div className="dashboard-greeting"><div><span className="eyebrow">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</span><h1>Good morning, {firstName}.</h1><p>{active.length} active inquiries and {saved.length} saved rooms are synced from the backend.</p></div><button className="btn primary" onClick={() => props.navigate('/listings')}><Search size={17} />Find more rooms</button></div><div className="student-action-strip"><button className="has-tip tip-top" data-tip="Browse rooms" aria-label="Browse rooms" onClick={() => props.navigate('/listings')}><Search size={18} /><span>Browse</span></button><button className="has-tip tip-top" data-tip="Saved rooms" aria-label="Saved rooms" onClick={() => props.navigate('/student/saved')}><Bookmark size={18} /><span>{saved.length}</span></button><button className="has-tip tip-top" data-tip="Inquiries" aria-label="Inquiries" onClick={() => props.navigate('/student/inquiries')}><MessageSquareText size={18} /><span>{active.length}</span></button><button className="has-tip tip-top" data-tip="Profile preferences" aria-label="Profile preferences" onClick={() => props.navigate('/student/profile')}><UserRound size={18} /><span>Profile</span></button></div><div className="metric-grid"><Metric icon={<MessageSquareText />} label="Active inquiries" value={String(active.length)} detail={`${viewingCount} viewing scheduled`} tone="info" /><Metric icon={<Bookmark />} label="Saved rooms" value={String(saved.length)} detail={`${availableSaved} available now`} /><Metric icon={<Clock3 />} label="Fresh matches" value={String(freshMatches)} detail={`${campusMatches.length} near ${props.db.profile.campus}`} tone="success" /></div><div className="student-dashboard"><section><SectionHeading eyebrow="Keep moving" title="Your active inquiries" description="The latest response from each agent." action={<button className="text-button" onClick={() => props.navigate('/student/inquiries')}>See all <ChevronRight size={16} /></button>} /><div className="inquiry-timeline">{active.map((i) => <button key={i.id} onClick={() => props.navigate('/student/inquiries')}><span className={`timeline-icon ${statusTone(i.status)}`}><MessageSquareText size={17} /></span><div><strong>{i.listing}</strong><p>{i.agent} · {i.status}</p></div><span>{i.updatedAt}</span><ChevronRight size={17} /></button>)}</div></section><aside className="inquiry-notification-place"><div className="panel-heading"><div><span className="eyebrow">Notifications</span><h2>Inquiry updates</h2></div><Bell size={20} /></div>{props.db.notifications.filter((n) => n.audience === 'student').map((n) => <div className="inquiry-update" key={n.id}><span className={`status-dot ${n.tone}`} /><div><strong>{n.title}</strong><p>{n.body}</p><small>{n.time} ago</small></div></div>)}</aside></div><SectionHeading eyebrow="Saved for comparison" title="Rooms you are watching" description="Availability can move quickly. Check the freshness before calling." action={<button className="text-button" onClick={() => props.navigate('/student/saved')}>View saved <ChevronRight size={16} /></button>} /><ListingGrid listings={saved.slice(0, 3)} {...props} /></div>
}

function StudentInquiries(props: AppProps) {
  const [selected, setSelected] = useState<Inquiry | null>(null)
  const rows = props.db.inquiries.filter((i) => !props.db.profile.name || i.student === props.db.profile.name)
  const activeRows = rows.filter((i) => !i.status.startsWith('Closed'))
  const closedRows = rows.filter((i) => i.status.startsWith('Closed'))
  return <div className="page"><PageHeader eyebrow="Student workspace" title="My inquiries" description="See where each conversation stands and what happens next." /><div className="tabs icon-tabs"><button className="active"><MessageSquareText size={16} />Active <span>{activeRows.length}</span></button><button><Archive size={16} />Closed <span>{closedRows.length}</span></button></div>{rows.length ? <div className="record-list">{rows.map((i) => <button className="record-row" key={i.id} onClick={() => setSelected(i)}><span className={`record-icon ${statusTone(i.status)}`}><MessageSquareText /></span><div className="record-main"><strong>{i.listing}</strong><span>{i.agent}</span></div><Badge tone={statusTone(i.status)}>{i.status}</Badge><div className="record-date"><strong>{i.updatedAt}</strong><span>Last update</span></div><ChevronRight /></button>)}</div> : <EmptyState icon={<Inbox />} title="No inquiries yet" body="Ask an agent about a listing and updates will appear here." action="Browse rooms" onAction={() => props.navigate('/listings')} />}{selected && <Drawer title="Inquiry details" close={() => setSelected(null)}><InquiryDetail inquiry={selected} /><a href={`tel:${selected.studentPhone}`} className="btn secondary full"><Phone size={17} />Call {selected.agent}</a></Drawer>}</div>
}

function StudentSaved(props: AppProps) {
  const [filter, setFilter] = useState('All')
  const saved = props.db.listings.filter((l) => l.saved && (filter === 'All' || l.availability === filter))
  return <div className="page"><PageHeader eyebrow="Student workspace" title="Saved rooms" description="Compare prices, availability, and how recently each room was checked." action={<button className="btn primary" onClick={() => props.navigate('/listings')}><Plus size={17} />Find rooms</button>} /><div className="toolbar"><div className="segmented icon-segmented"><button className={filter === 'All' ? 'active' : ''} onClick={() => setFilter('All')}><Bookmark size={15} />All</button><button className={filter === 'Available' ? 'active' : ''} onClick={() => setFilter('Available')}><CheckCircle2 size={15} />Available</button><button className={filter === 'Limited' ? 'active' : ''} onClick={() => setFilter('Limited')}><Clock3 size={15} />Limited</button></div><span className="result-count">{saved.length} saved rooms</span></div>{saved.length ? <ListingGrid listings={saved} {...props} /> : <EmptyState icon={<Bookmark />} title="Nothing saved here" body="Save rooms while browsing to compare them later." action="Browse rooms" onAction={() => props.navigate('/listings')} />}</div>
}

function StudentProfile(props: AppProps) {
  const [profile, setProfile] = useState(props.db.profile)
  return <div className="page narrow-page"><PageHeader eyebrow="Account" title="Profile & notifications" description="Keep your contact details current so agents can follow up." /><form onSubmit={(e) => { e.preventDefault(); props.mutate('Profile saved', (draft) => { draft.profile = profile }) }}><FormSection title="Personal information" description="Used when you send an inquiry."><div className="form-grid"><Field label="Full name"><input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} /></Field><Field label="Email address"><input value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} /></Field><Field label="Phone number"><input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} /></Field><Field label="WhatsApp"><input value={profile.whatsapp} onChange={(e) => setProfile({ ...profile, whatsapp: e.target.value })} /></Field><Field label="Primary campus"><select value={profile.campus} onChange={(e) => setProfile({ ...profile, campus: e.target.value })}><option>KNUST</option><option>University of Ghana</option><option>UCC</option></select></Field></div></FormSection><Preferences db={props.db} mutate={props.mutate} /><div className="form-actions"><button className="btn primary" disabled={props.busy}>{props.busy && <LoaderCircle className="spin" />}Save profile</button></div></form></div>
}

function AgentDashboard(props: AppProps) {
  const currentAgent = props.db.agents[0]
  const owned = props.db.listings.filter((l) => !currentAgent || l.agentId === currentAgent.id)
  const leads = props.db.inquiries.filter((i) => !currentAgent || i.agentId === currentAgent.id)
  const stale = owned.filter((l) => l.freshness === 'Stale' || l.freshness === 'Needs refresh')
  return <div className="page"><PageHeader eyebrow="Agent overview" title={`Today at ${currentAgent?.business ?? 'your agency'}`} description="Keep availability current and reply while student interest is warm." action={<button className="btn primary" onClick={() => props.navigate('/agent/listings/new')}><Plus size={17} />New listing</button>} /><div className="metric-grid four"><Metric label="Active listings" value={String(owned.filter((l) => l.status === 'Published').length)} detail={`Across ${new Set(owned.map((l) => l.area)).size} areas`} /><Metric label="New inquiries" value={String(leads.filter((i) => i.status === 'New').length)} detail="Reply today" tone="warning" /><Metric label="Need refresh" value={String(stale.length)} detail="Affects ranking" tone="danger" /><Metric label="Response rate" value={`${currentAgent?.responseRate ?? 0}%`} detail="Backend trust signal" tone="success" /></div><div className="ops-grid"><section className="surface"><SectionHeading eyebrow="Availability" title="Needs your confirmation" description="One click records a fresh check." action={<button className="text-button" onClick={() => props.navigate('/agent/listings')}>All listings <ChevronRight size={16} /></button>} /><div className="task-list">{stale.map((l) => <div className="task-row" key={l.id}><img src={l.image} alt="" /><div><strong>{l.title}</strong><span>{l.area} · {l.updatedAt}</span></div><Badge tone="warning">{l.freshness}</Badge><button className="btn secondary small" onClick={() => props.mutate(`${l.title} confirmed available`, (draft) => { const item = draft.listings.find((x) => x.id === l.id); if (item) { item.freshness = 'Confirmed today'; item.updatedAt = 'Just now' } })}><RefreshCw size={15} />Confirm</button></div>)}</div></section><section className="surface"><SectionHeading eyebrow="Lead inbox" title="Waiting for a response" description="Newest student requests first." action={<button className="text-button" onClick={() => props.navigate('/agent/inquiries')}>Open inbox <ChevronRight size={16} /></button>} /><div className="lead-list">{leads.slice().reverse().slice(0, 3).map((i) => <button key={i.id} onClick={() => props.navigate('/agent/inquiries')}><span className="avatar-sm">{initials(i.student)}</span><div><strong>{i.student}</strong><span>{i.listing}</span></div><Badge tone={statusTone(i.status)}>{i.status}</Badge><small>{i.updatedAt}</small></button>)}</div></section></div><section className="surface performance"><SectionHeading eyebrow="Last 30 days" title="Listing performance" description="A lightweight view of demand across your current inventory." /><div className="performance-bars">{owned.map((l) => <div key={l.id}><span>{l.title}</span><div><i style={{ width: `${Math.min(100, l.views / 4)}%` }} /></div><strong>{l.views} views</strong></div>)}</div></section></div>
}

function AgentProfile(props: AppProps) {
  const current = props.db.agents[0]
  const [agent, setAgent] = useState(current)
  useEffect(() => { if (current) setAgent(current) }, [current?.id])
  if (!agent) return <EmptyState icon={<UserRound />} title="No agent profile loaded" body="The backend did not return an agent profile for this account." action="Reload data" onAction={() => props.navigate('/agent/dashboard')} />
  return <div className="page"><PageHeader eyebrow="Trust profile" title="Public agent profile" description="This information helps students decide whether to contact you." action={<button className="btn secondary" onClick={() => props.navigate(`/agents/${agent.id}`)}><Eye size={17} />View public page</button>} /><div className="form-preview-grid"><form onSubmit={(e) => { e.preventDefault(); props.mutate('Public profile updated', (draft) => { const index = draft.agents.findIndex((a) => a.id === agent.id); draft.agents[index] = agent }) }}><FormSection title="Identity & contact" description="Use the name students will recognize."><div className="avatar-upload"><div className="profile-avatar">{initials(agent.name)}</div><button type="button" className="btn secondary"><Upload size={16} />Change photo</button></div><div className="form-grid"><Field label="Display name"><input value={agent.name} onChange={(e) => setAgent({ ...agent, name: e.target.value })} /></Field><Field label="Business name"><input value={agent.business} onChange={(e) => setAgent({ ...agent, business: e.target.value })} /></Field><Field label="Phone"><input value={agent.phone} onChange={(e) => setAgent({ ...agent, phone: e.target.value })} /></Field><Field label="WhatsApp"><input value={agent.whatsapp} onChange={(e) => setAgent({ ...agent, whatsapp: e.target.value })} /></Field><Field label="About your work" wide><textarea value={agent.bio} onChange={(e) => setAgent({ ...agent, bio: e.target.value })} rows={5} /></Field><Field label="Operating areas" wide><input value={agent.areas.join(', ')} onChange={(e) => setAgent({ ...agent, areas: e.target.value.split(',').map((x) => x.trim()) })} /></Field></div></FormSection><div className="form-actions"><button className="btn primary">Save changes</button></div></form><aside className="sticky-preview"><span className="eyebrow">Student preview</span><AgentMiniCard agent={agent} navigate={props.navigate} expanded /></aside></div></div>
}

function AgentVerification(props: AppProps) {
  const agent = props.db.agents[0]
  if (!agent) return <EmptyState icon={<ShieldCheck />} title="No verification record loaded" body="The backend did not return an agent profile for this account." />
  return <div className="page narrow-page"><PageHeader eyebrow="Trust & safety" title="Agent verification" description="Verification gives students a clear identity signal on every listing." /><div className="verification-status"><div className="verification-icon"><ShieldCheck /></div><div><Badge tone={agent.verification === 'Verified' ? 'success' : 'warning'}>{agent.verification}</Badge><h2>{agent.verification === 'Verified' ? 'Your identity is verified' : 'Your submission is under review'}</h2><p>{agent.verification === 'Verified' ? 'Your public profile and listings display the verified agent badge.' : 'Most submissions are reviewed within two business days.'}</p></div></div><div className="verification-steps">{['Identity details', 'Contact information', 'Operating areas', 'Evidence upload', 'Platform review'].map((s, i) => <div className={i < 4 ? 'complete' : 'current'} key={s}><span>{i < 4 ? <Check size={16} /> : i + 1}</span><div><strong>{s}</strong><small>{i < 4 ? 'Complete' : agent.verification}</small></div></div>)}</div><FormSection title="Submitted evidence" description="Documents are visible only to authorized reviewers."><div className="document-list">{agent.documents.map((doc) => <div key={doc}><FileCheck2 /><span><strong>{doc}</strong><small>Uploaded · PDF</small></span><Badge tone="success">Received</Badge></div>)}</div><button className="btn secondary"><Upload size={16} />Add another document</button></FormSection></div>
}

function AgentListings(props: AppProps) {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('All statuses')
  const currentAgent = props.db.agents[0]
  const owned = props.db.listings.filter((l) => (!currentAgent || l.agentId === currentAgent.id) && (!query || `${l.title} ${l.area}`.toLowerCase().includes(query.toLowerCase())) && (status === 'All statuses' || l.status === status))
  function archive(listing: Listing) { props.setModal({ type: 'confirm', title: `Archive ${listing.title}?`, body: 'Students will no longer find this listing. You can keep its record for later reference.', danger: true, action: () => props.mutate('Listing archived', (draft) => { const item = draft.listings.find((l) => l.id === listing.id); if (item) item.status = 'Archived' }) }) }
  return <div className="page"><PageHeader eyebrow="Inventory" title="Listings" description="Manage rooms you own and keep availability trustworthy." action={<button className="btn primary" onClick={() => props.navigate('/agent/listings/new')}><Plus size={17} />New listing</button>} /><div className="toolbar"><div className="input-with-icon"><Search size={17} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search your listings" /></div><select value={status} onChange={(e) => setStatus(e.target.value)}><option>All statuses</option><option>Published</option><option>Draft</option><option>Unpublished</option><option>Archived</option></select><span className="result-count">{owned.length} listings</span></div><div className="data-table-wrap"><table className="data-table"><thead><tr><th>Listing</th><th>Status</th><th>Availability</th><th>Freshness</th><th>Performance</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>{owned.map((l) => <tr key={l.id}><td><div className="table-identity"><img src={l.image} alt="" /><span><strong>{l.title}</strong><small>{l.area} · {money.format(l.price)}</small></span></div></td><td><Badge tone={l.status === 'Published' ? 'success' : 'neutral'}>{l.status}</Badge></td><td>{l.availability}</td><td><Badge tone={l.freshness.includes('today') ? 'success' : 'warning'}>{l.freshness}</Badge></td><td><strong>{l.views}</strong> views · {l.inquiries} leads</td><td><div className="row-actions"><button className="icon-btn" title="Refresh availability" onClick={() => props.mutate('Availability confirmed', (draft) => { const item = draft.listings.find((x) => x.id === l.id); if (item) { item.freshness = 'Confirmed today'; item.updatedAt = 'Just now' } })}><RefreshCw /></button><button className="icon-btn" title="Edit listing" onClick={() => props.navigate(`/agent/listings/${l.id}/edit`)}><Pencil /></button><button className="icon-btn danger-text" title="Archive listing" onClick={() => archive(l)}><Archive /></button></div></td></tr>)}</tbody></table></div></div>
}

function ListingFormPage(props: AppProps & { id?: string }) {
  const existing = props.id ? props.db.listings.find((l) => l.id === props.id) : undefined
  const currentAgent = props.db.agents[0]
  const blank: Listing = { id: 'lst-new-draft', title: '', property: '', campus: props.db.locations[0]?.campus ?? 'KNUST', area: props.db.locations[0]?.area ?? '', price: 0, period: 'academic year', occupancy: 'Single room', gender: 'Any gender', availability: 'Available', freshness: 'Confirmed today', status: 'Draft', moderation: 'Pending', agentId: currentAgent?.id ?? '', agentName: currentAgent?.name ?? '', verified: currentAgent?.verification === 'Verified', capacity: 1, slots: 1, description: '', amenities: [], rules: [], image: '/images/room-1.png', saved: false, views: 0, inquiries: 0, updatedAt: 'Just now' }
  const [listing, setListing] = useState(existing ?? blank)
  const [step, setStep] = useState(1)
  const sections = ['Property', 'Room & price', 'Availability', 'Details', 'Review']
  function save(publish: boolean) { props.mutate(publish ? 'Listing sent for review' : 'Draft saved', (draft) => { const item = { ...listing, id: listing.id === 'lst-new-draft' ? `lst-${Date.now()}` : listing.id, status: publish ? 'Published' as const : 'Draft' as const, moderation: publish ? 'Pending' as const : listing.moderation }; const index = draft.listings.findIndex((l) => l.id === item.id); if (index >= 0) draft.listings[index] = item; else draft.listings.unshift(item) }).then(() => props.navigate('/agent/listings')) }
  return <div className="page listing-editor"><button className="back-button" onClick={() => props.navigate('/agent/listings')}><ArrowLeft size={17} />Back to listings</button><PageHeader eyebrow={existing ? 'Edit inventory' : 'Create inventory'} title={existing ? `Edit ${existing.title}` : 'Create a new listing'} description="Structured details make rooms easier to find and compare." /><div className="editor-layout"><aside className="editor-steps">{sections.map((s, i) => <button key={s} className={step === i + 1 ? 'active' : step > i + 1 ? 'complete' : ''} onClick={() => setStep(i + 1)}><span>{step > i + 1 ? <Check size={15} /> : i + 1}</span>{s}</button>)}</aside><section className="form-card editor-card">{step === 1 && <><FormHeading number="01" title="Property basics" description="Name the property and place it near the right campus." /><div className="form-grid"><Field label="Listing title" wide><input required value={listing.title} onChange={(e) => setListing({ ...listing, title: e.target.value })} placeholder="e.g. Furnished single room" /></Field><Field label="Property name"><input value={listing.property} onChange={(e) => setListing({ ...listing, property: e.target.value })} /></Field><Field label="Campus"><select value={listing.campus} onChange={(e) => setListing({ ...listing, campus: e.target.value })}><option>KNUST</option><option>University of Ghana</option><option>UCC</option></select></Field><Field label="Area"><input value={listing.area} onChange={(e) => setListing({ ...listing, area: e.target.value })} /></Field></div></>}{step === 2 && <><FormHeading number="02" title="Room & price" description="Set the searchable room configuration and full rate." /><div className="form-grid"><Field label="Room type"><select value={listing.occupancy} onChange={(e) => setListing({ ...listing, occupancy: e.target.value })}><option>Single room</option><option>2 in room</option><option>3 in room</option><option>4 in room</option><option>Private apartment</option><option>Studio</option></select></Field><Field label="Gender"><select value={listing.gender} onChange={(e) => setListing({ ...listing, gender: e.target.value })}><option>Any gender</option><option>Female only</option><option>Male only</option><option>Mixed</option></select></Field><Field label="Price (GHS)"><input type="number" value={listing.price || ''} onChange={(e) => setListing({ ...listing, price: Number(e.target.value) })} /></Field><Field label="Billing period"><select value={listing.period} onChange={(e) => setListing({ ...listing, period: e.target.value })}><option>academic year</option><option>semester</option><option>month</option><option>year</option></select></Field></div></>}{step === 3 && <><FormHeading number="03" title="Availability" description="Published availability must match capacity." /><div className="form-grid"><Field label="Availability"><select value={listing.availability} onChange={(e) => setListing({ ...listing, availability: e.target.value as Listing['availability'] })}><option>Available</option><option>Limited</option><option>Full</option><option>Unavailable</option></select></Field><Field label="Capacity"><input type="number" min="1" value={listing.capacity} onChange={(e) => setListing({ ...listing, capacity: Number(e.target.value), slots: Math.min(listing.slots, Number(e.target.value)) })} /></Field><Field label="Available slots"><input type="number" min="0" max={listing.capacity} value={listing.slots} onChange={(e) => setListing({ ...listing, slots: Math.min(Number(e.target.value), listing.capacity) })} /></Field></div><div className="info-callout"><Clock3 />Saving confirms that you checked this availability today.</div></>}{step === 4 && <><FormHeading number="04" title="Details & media" description="Give students enough information to decide whether to inquire." /><Field label="Description"><textarea rows={6} value={listing.description} onChange={(e) => setListing({ ...listing, description: e.target.value })} /></Field><Field label="Amenities (comma separated)"><input value={listing.amenities.join(', ')} onChange={(e) => setListing({ ...listing, amenities: e.target.value.split(',').map((x) => x.trim()).filter(Boolean) })} /></Field><div className="upload-zone"><Upload /><strong>Upload room photos</strong><span>PNG or JPG, up to 8 images</span><button type="button" className="btn secondary">Choose files</button></div></>}{step === 5 && <><FormHeading number="05" title="Review & publish" description="Check the student-facing summary before publishing." /><div className="review-list"><Review label="Property" value={`${listing.title || 'Untitled listing'} · ${listing.area || 'No area'}`} /><Review label="Room" value={`${listing.occupancy} · ${listing.gender}`} /><Review label="Price" value={`${money.format(listing.price)} / ${listing.period}`} /><Review label="Availability" value={`${listing.availability} · ${listing.slots} of ${listing.capacity} slots`} /></div><div className="info-callout"><ShieldCheck />New and materially changed listings enter admin review before public ranking.</div></>}<div className="editor-actions"><button className="btn ghost" onClick={() => save(false)}>Save draft</button><div>{step > 1 && <button className="btn secondary" onClick={() => setStep(step - 1)}>Back</button>}{step < 5 ? <button className="btn primary" onClick={() => setStep(step + 1)}>Continue <ChevronRight size={17} /></button> : <button className="btn primary" onClick={() => save(true)}>Publish listing</button>}</div></div></section><aside className="listing-status-card"><span className="eyebrow">Listing status</span><Badge tone={listing.status === 'Published' ? 'success' : 'neutral'}>{listing.status}</Badge><div><span>Moderation</span><strong>{listing.moderation}</strong></div><div><span>Freshness</span><strong>{listing.freshness}</strong></div><div><span>Last confirmed</span><strong>{listing.updatedAt}</strong></div></aside></div></div>
}

function AgentInquiries(props: AppProps) {
  const [selected, setSelected] = useState<Inquiry | null>(null)
  const [filter, setFilter] = useState('Active')
  const currentAgent = props.db.agents[0]
  const rows = props.db.inquiries.filter((i) => (!currentAgent || i.agentId === currentAgent.id) && (filter === 'All' || filter === 'Active' && !i.status.startsWith('Closed') || i.status === filter))
  return <div className="page"><PageHeader eyebrow="Lead management" title="Inquiries" description="Respond, record the next step, and keep your pipeline clear." /><div className="toolbar"><div className="segmented"><button className={filter === 'Active' ? 'active' : ''} onClick={() => setFilter('Active')}>Active</button><button className={filter === 'New' ? 'active' : ''} onClick={() => setFilter('New')}>New</button><button className={filter === 'All' ? 'active' : ''} onClick={() => setFilter('All')}>All</button></div><span className="result-count">{rows.length} inquiries</span></div><div className="data-table-wrap"><table className="data-table"><thead><tr><th>Student</th><th>Listing</th><th>Status</th><th>Received</th><th>Last update</th><th></th></tr></thead><tbody>{rows.map((i) => <tr key={i.id}><td><div className="person-cell"><span className="avatar-sm">{initials(i.student)}</span><span><strong>{i.student}</strong><small>{i.contactMethod}</small></span></div></td><td>{i.listing}</td><td><Badge tone={statusTone(i.status)}>{i.status}</Badge></td><td>{i.createdAt}</td><td>{i.updatedAt}</td><td><button className="btn secondary small" onClick={() => setSelected(i)}>Open</button></td></tr>)}</tbody></table></div>{selected && <Drawer title="Inquiry details" close={() => setSelected(null)}><InquiryDetail inquiry={selected} /><Field label="Lead status"><select value={selected.status} onChange={(e) => { const status = e.target.value as InquiryStatus; setSelected({ ...selected, status }); props.mutate(`Inquiry moved to ${status}`, (draft) => { const item = draft.inquiries.find((i) => i.id === selected.id); if (item) { item.status = status; item.updatedAt = 'Just now' } }) }}>{['New', 'Contacted', 'Viewing Scheduled', 'Negotiating', 'Closed Won', 'Closed Lost'].map((s) => <option key={s}>{s}</option>)}</select></Field><div className="drawer-actions"><a className="btn secondary" href={`tel:${selected.studentPhone}`}><Phone size={16} />Call</a><a className="btn primary" href={`mailto:${selected.studentEmail}`}><Send size={16} />Reply</a></div></Drawer>}</div>
}

function AgentSettings(props: AppProps) {
  return <div className="page narrow-page"><PageHeader eyebrow="Agent account" title="Settings" description="Control operational alerts and account security." /><Preferences db={props.db} mutate={props.mutate} agent /><FormSection title="Security" description="Keep your account protected."><div className="settings-list"><div><span className="settings-icon"><KeyRound /></span><div><strong>Password</strong><span>Last changed 4 months ago</span></div><button className="btn secondary">Change password</button></div><div><span className="settings-icon"><LockKeyhole /></span><div><strong>Two-step verification</strong><span>Add another layer of account security</span></div><button className="btn secondary">Set up</button></div></div></FormSection></div>
}

function AdminDashboard(props: AppProps) {
  const pending = props.db.agents.filter((a) => a.verification === 'Pending').length
  const stale = props.db.listings.filter((l) => l.freshness === 'Stale' || l.freshness === 'Needs refresh').length
  const open = props.db.reports.filter((r) => r.status === 'Open').length
  const highReports = props.db.reports.filter((r) => r.severity === 'High').length
  return <div className="page"><PageHeader eyebrow="Platform operations" title="Trust & moderation overview" description="Queues are ordered by risk and age so the team can act consistently." action={<button className="btn primary" onClick={() => props.navigate('/admin/agents')}><ListFilter size={17} />Review queue</button>} /><div className="metric-grid four"><Metric label="Pending agents" value={String(pending)} detail={`${props.db.agents.length} agents loaded`} tone="warning" /><Metric label="Open reports" value={String(open)} detail={`${highReports} high severity`} tone="danger" /><Metric label="Stale listings" value={String(stale)} detail={`${props.db.listings.length} listings loaded`} tone="warning" /><Metric label="Active inquiries" value={String(props.db.inquiries.length)} detail="Loaded from API" tone="info" /></div><div className="ops-grid admin-ops"><section className="surface"><SectionHeading eyebrow="Priority queue" title="Needs a decision" description="Evidence and age determine queue order." /><div className="queue-list"><Queue icon={<ShieldCheck />} title="Agent verification" value={`${pending} pending`} detail={`${props.db.agents.filter((a) => a.verification === 'Verified').length} verified agents`} tone="warning" onClick={() => props.navigate('/admin/agents')} /><Queue icon={<Flag />} title="Listing reports" value={`${open} open`} detail={`${props.db.reports.length} total reports`} tone="danger" onClick={() => props.navigate('/admin/reports')} /><Queue icon={<Clock3 />} title="Freshness risks" value={`${stale} listings`} detail="Needs availability review" tone="warning" onClick={() => props.navigate('/admin/listings')} /></div></section><section className="surface"><SectionHeading eyebrow="System signal" title="Trust movement" description="Current backend volume by queue." /><div className="chart"><div className="chart-y"><span>80</span><span>40</span><span>0</span></div><div className="chart-bars">{[props.db.agents.length * 12, props.db.listings.length * 8, props.db.reports.length * 18, props.db.inquiries.length * 10, pending * 20, open * 24, stale * 18].map((h, i) => <i key={i} style={{ height: `${Math.min(90, Math.max(10, h))}%` }}><span>{['Ag', 'Li', 'Rp', 'In', 'Pn', 'Op', 'St'][i]}</span></i>)}</div></div><div className="chart-legend"><span><i className="green" />Backend records</span><span><i className="amber" />Open queues</span></div></section></div><section className="surface"><SectionHeading eyebrow="Audit trail" title="Recent platform activity" description="Sensitive changes retain an accountable history." /><div className="activity-feed">{props.db.agents.slice(0, 1).map((agent) => <ActivityItem key={agent.id} icon={<ShieldCheck />} title={`${agent.name} is ${agent.verification.toLowerCase()}`} meta={`${agent.business} · ${agent.joined}`} />)}{props.db.reports.slice(0, 1).map((report) => <ActivityItem key={report.id} icon={<EyeOff />} title={`${report.listing} report is ${report.status.toLowerCase()}`} meta={`${report.reason} · ${report.createdAt}`} />)}{props.db.locations.slice(0, 1).map((location) => <ActivityItem key={location.id} icon={<MapPin />} title={`${location.area} location is ${location.active ? 'active' : 'archived'}`} meta={`${location.campus} · ${location.region}`} />)}</div></section></div>
}

function AdminAgents(props: AppProps) {
  const [filter, setFilter] = useState('All')
  const agents = props.db.agents.filter((a) => filter === 'All' || a.verification === filter)
  return <div className="page"><PageHeader eyebrow="Trust operations" title="Agent verification" description="Review identity, operating areas, and platform history before deciding." /><div className="toolbar"><div className="segmented"><button className={filter === 'All' ? 'active' : ''} onClick={() => setFilter('All')}>All</button><button className={filter === 'Pending' ? 'active' : ''} onClick={() => setFilter('Pending')}>Pending</button><button className={filter === 'Verified' ? 'active' : ''} onClick={() => setFilter('Verified')}>Verified</button><button className={filter === 'Rejected' ? 'active' : ''} onClick={() => setFilter('Rejected')}>Rejected</button></div><span className="result-count">{agents.length} agents</span></div><div className="data-table-wrap"><table className="data-table"><thead><tr><th>Agent</th><th>Verification</th><th>Operating areas</th><th>Listings</th><th>Trust signal</th><th></th></tr></thead><tbody>{agents.map((a) => <tr key={a.id}><td><div className="person-cell"><span className="avatar-sm">{initials(a.name)}</span><span><strong>{a.name}</strong><small>{a.business}</small></span></div></td><td><Badge tone={verificationTone(a.verification)}>{a.verification}</Badge></td><td>{a.areas.slice(0, 2).join(', ')}</td><td>{props.db.listings.filter((l) => l.agentId === a.id).length}</td><td>{a.freshnessScore}% freshness</td><td><button className="btn secondary small" onClick={() => props.navigate(`/admin/agents/${a.id}`)}>Review</button></td></tr>)}</tbody></table></div></div>
}

function AdminAgentDetail(props: AppProps & { id: string }) {
  const agent = props.db.agents.find((a) => a.id === props.id)
  if (!agent) return <EmptyState icon={<UserRound />} title="Agent not found" body="This record is unavailable." action="Back to agents" onAction={() => props.navigate('/admin/agents')} />
  const decide = (verification: Agent['verification']) => props.mutate(`Agent marked ${verification.toLowerCase()}`, (draft) => { const item = draft.agents.find((a) => a.id === agent.id); if (item) item.verification = verification })
  return <div className="page"><button className="back-button" onClick={() => props.navigate('/admin/agents')}><ArrowLeft size={17} />Back to agents</button><div className="review-header"><div className="profile-avatar">{initials(agent.name)}</div><div><Badge tone={verificationTone(agent.verification)}>{agent.verification}</Badge><h1>{agent.name}</h1><p>{agent.business} · Joined {agent.joined}</p></div><div className="decision-actions"><button className="btn secondary danger-text" onClick={() => decide('Rejected')}><X size={17} />Reject</button><button className="btn primary" onClick={() => decide('Verified')}><Check size={17} />Approve agent</button></div></div><div className="review-layout"><div><FormSection title="Identity evidence" description={`${agent.documents.length} documents submitted`}><div className="evidence-grid">{agent.documents.map((d) => <button key={d}><FileCheck2 /><span><strong>{d}</strong><small>PDF · Backend document record</small></span><Eye /></button>)}{!agent.documents.length && <EmptyState icon={<FileCheck2 />} title="No evidence submitted" body="This agent has not started verification." />}</div></FormSection><FormSection title="Account activity" description="Trust indicators from live platform use."><div className="key-facts"><Fact label="Response rate" value={`${agent.responseRate}%`} /><Fact label="Freshness score" value={`${agent.freshnessScore}%`} /><Fact label="Listings" value={String(props.db.listings.filter((l) => l.agentId === agent.id).length)} /><Fact label="Reports" value={String(props.db.reports.filter((r) => props.db.listings.find((l) => l.id === r.listingId)?.agentId === agent.id).length)} /></div></FormSection></div><aside className="decision-panel"><span className="eyebrow">Reviewer checklist</span>{['Identity name matches', 'Contact number confirmed', 'Operating areas plausible', 'Evidence is legible'].map((x) => <label className="check" key={x}><input type="checkbox" defaultChecked={agent.verification === 'Verified'} />{x}</label>)}<Field label="Decision notes"><textarea rows={5} placeholder="Required for rejection or suspension" /></Field><p><CircleAlert size={15} />Every decision is written to the audit log.</p></aside></div></div>
}

function AdminListings(props: AppProps) {
  const [selected, setSelected] = useState<Listing | null>(null)
  const moderate = (listing: Listing, moderation: Listing['moderation'], status?: Listing['status']) => props.mutate(`Listing marked ${moderation.toLowerCase()}`, (draft) => { const item = draft.listings.find((l) => l.id === listing.id); if (item) { item.moderation = moderation; if (status) item.status = status } })
  return <div className="page"><PageHeader eyebrow="Content quality" title="Listing moderation" description="Inspect freshness, reports, and publish state across all agents." /><div className="toolbar"><div className="input-with-icon"><Search size={17} /><input placeholder="Search listing or agent" /></div><select><option>All moderation</option><option>Pending</option><option>Flagged</option><option>Approved</option></select><span className="result-count">{props.db.listings.length} listings</span></div><div className="data-table-wrap"><table className="data-table"><thead><tr><th>Listing</th><th>Agent</th><th>Moderation</th><th>Freshness</th><th>Reports</th><th></th></tr></thead><tbody>{props.db.listings.map((l) => <tr key={l.id}><td><div className="table-identity"><img src={l.image} alt="" /><span><strong>{l.title}</strong><small>{l.area} · {l.campus}</small></span></div></td><td>{l.agentName}</td><td><Badge tone={l.moderation === 'Approved' ? 'success' : l.moderation === 'Flagged' ? 'danger' : 'warning'}>{l.moderation}</Badge></td><td>{l.freshness}</td><td>{props.db.reports.filter((r) => r.listingId === l.id).length}</td><td><button className="btn secondary small" onClick={() => setSelected(l)}>Inspect</button></td></tr>)}</tbody></table></div>{selected && <Drawer title="Moderate listing" close={() => setSelected(null)}><img className="drawer-image" src={selected.image} alt={selected.title} /><div><Badge tone={selected.moderation === 'Approved' ? 'success' : 'warning'}>{selected.moderation}</Badge><h2>{selected.title}</h2><p>{selected.description}</p></div><div className="review-list"><Review label="Agent" value={selected.agentName} /><Review label="Availability" value={`${selected.availability} · ${selected.freshness}`} /><Review label="Price" value={`${money.format(selected.price)} / ${selected.period}`} /></div><Field label="Moderation notes"><textarea rows={4} placeholder="Explain high-impact decisions" /></Field><div className="drawer-actions three"><button className="btn secondary danger-text" onClick={() => moderate(selected, 'Rejected', 'Removed')}><Trash2 size={16} />Remove</button><button className="btn secondary" onClick={() => moderate(selected, 'Flagged', 'Unpublished')}><EyeOff size={16} />Hide</button><button className="btn primary" onClick={() => moderate(selected, 'Approved', 'Published')}><Check size={16} />Approve</button></div></Drawer>}</div>
}

function AdminReports(props: AppProps) {
  const [selected, setSelected] = useState<Report | null>(null)
  const resolve = (status: Report['status']) => selected && props.mutate(`Report ${status.toLowerCase()}`, (draft) => { const item = draft.reports.find((r) => r.id === selected.id); if (item) item.status = status })
  return <div className="page"><PageHeader eyebrow="Trust & safety" title="Reported listings" description="Triage inaccurate, fake, duplicate, or harmful listing content." /><div className="report-queue">{props.db.reports.map((r) => <button className="report-row" key={r.id} onClick={() => setSelected(r)}><span className={`severity ${r.severity.toLowerCase()}`}>{r.severity}</span><div><strong>{r.reason}</strong><p>{r.listing}</p></div><Badge tone={r.status === 'Open' ? 'danger' : r.status === 'Reviewing' ? 'warning' : 'success'}>{r.status}</Badge><span>{r.createdAt}</span><ChevronRight /></button>)}</div>{selected && <Drawer title="Report evidence" close={() => setSelected(null)}><div className="report-summary"><Flag /><div><Badge tone={selected.severity === 'High' ? 'danger' : 'warning'}>{selected.severity} severity</Badge><h2>{selected.reason}</h2><p>{selected.listing}</p></div></div><DetailSection title="Reporter details"><p>{selected.details}</p><small>Reported by {selected.reporter} on {selected.createdAt}</small></DetailSection><Field label="Resolution notes"><textarea rows={5} placeholder="Record what was checked and why" /></Field><div className="drawer-actions"><button className="btn secondary" onClick={() => resolve('Dismissed')}>Dismiss</button><button className="btn primary" onClick={() => resolve('Resolved')}>Resolve report</button></div></Drawer>}</div>
}

function AdminLocations(props: AppProps) {
  return <div className="page"><PageHeader eyebrow="Reference data" title="Campuses & areas" description="Clean location data keeps discovery filters useful." action={<button className="btn primary" onClick={() => props.setModal({ type: 'location' })}><Plus size={17} />Add location</button>} /><div className="data-table-wrap"><table className="data-table"><thead><tr><th>Campus</th><th>Area</th><th>City</th><th>Region</th><th>Status</th><th></th></tr></thead><tbody>{props.db.locations.map((l) => <tr key={l.id}><td><strong>{l.campus}</strong><br /><small>{l.abbreviation}</small></td><td>{l.area}</td><td>{l.city}</td><td>{l.region}</td><td><Badge tone={l.active ? 'success' : 'neutral'}>{l.active ? 'Active' : 'Archived'}</Badge></td><td><div className="row-actions"><button className="icon-btn" onClick={() => props.setModal({ type: 'location', locationId: l.id })}><Pencil /></button><button className="icon-btn" onClick={() => props.mutate(l.active ? 'Location archived' : 'Location restored', (draft) => { const item = draft.locations.find((x) => x.id === l.id); if (item) item.active = !item.active })}>{l.active ? <Archive /> : <RefreshCw />}</button></div></td></tr>)}</tbody></table></div></div>
}

function AdminUsers(props: AppProps) {
  const [selected, setSelected] = useState<Database['users'][number] | null>(null)
  return <div className="page"><PageHeader eyebrow="Accounts" title="Platform users" description="Inspect role, verification, and account state without impersonation." /><div className="toolbar"><div className="input-with-icon"><Search size={17} /><input placeholder="Search name or email" /></div><select><option>All roles</option><option>Student</option><option>Agent</option><option>Admin</option></select><span className="result-count">{props.db.users.length} users</span></div><div className="data-table-wrap"><table className="data-table"><thead><tr><th>User</th><th>Role</th><th>Email</th><th>Status</th><th>Last active</th><th></th></tr></thead><tbody>{props.db.users.map((u) => <tr key={u.id}><td><div className="person-cell"><span className="avatar-sm">{initials(u.name)}</span><strong>{u.name}</strong></div></td><td>{u.role}</td><td>{u.verified ? <span className="verified"><CheckCircle2 size={14} />Verified</span> : <Badge tone="warning">Unverified</Badge>}</td><td><Badge tone={u.status === 'Active' ? 'success' : 'danger'}>{u.status}</Badge></td><td>{u.lastActive}</td><td><button className="btn secondary small" onClick={() => setSelected(u)}>View</button></td></tr>)}</tbody></table></div>{selected && <Drawer title="Account details" close={() => setSelected(null)}><div className="account-profile"><span className="profile-avatar">{initials(selected.name)}</span><div><h2>{selected.name}</h2><p>{selected.email}</p><Badge tone={selected.status === 'Active' ? 'success' : 'danger'}>{selected.status}</Badge></div></div><div className="review-list"><Review label="Role" value={selected.role} /><Review label="Email verification" value={selected.verified ? 'Verified' : 'Pending'} /><Review label="Last active" value={selected.lastActive} /></div><div className="info-callout"><LockKeyhole />Impersonation is intentionally unavailable in the MVP.</div><button className="btn secondary danger-text full" onClick={() => props.mutate(selected.status === 'Active' ? 'Account suspended' : 'Account reactivated', (draft) => { const item = draft.users.find((u) => u.id === selected.id); if (item) item.status = item.status === 'Active' ? 'Suspended' : 'Active' })}>{selected.status === 'Active' ? 'Suspend account' : 'Reactivate account'}</button></Drawer>}</div>
}

function Modal({ modal, db, mutate, close, busy }: { modal: Exclude<ModalState, null>; db: Database; mutate: AppProps['mutate']; close: () => void; busy: boolean }) {
  const [message, setMessage] = useState('Hi, is this room still available? I would like to arrange a viewing.')
  const [reason, setReason] = useState('Stale availability')
  const location = modal.type === 'location' && modal.locationId ? db.locations.find((l) => l.id === modal.locationId) : undefined
  const [locationForm, setLocationForm] = useState(location ?? { id: 'loc-new', campus: '', abbreviation: '', city: '', area: '', region: '', active: true })
  function submitInquiry(e: FormEvent) { e.preventDefault(); if (modal.type !== 'inquiry') return; mutate('Inquiry sent to the agent', (draft) => { draft.inquiries.unshift({ id: `inq-${Date.now()}`, listingId: modal.listing.id, listing: modal.listing.title, student: draft.profile.name, studentEmail: draft.profile.email, studentPhone: draft.profile.phone, agentId: modal.listing.agentId, agent: modal.listing.agentName, status: 'New', message, contactMethod: 'WhatsApp', updatedAt: 'Just now', createdAt: 'Aug 5, 2026' }); const listing = draft.listings.find((l) => l.id === modal.listing.id); if (listing) listing.inquiries += 1 }) }
  function submitReport(e: FormEvent) { e.preventDefault(); if (modal.type !== 'report') return; mutate('Report submitted for review', (draft) => { draft.reports.unshift({ id: `rep-${Date.now()}`, listingId: modal.listing.id, listing: modal.listing.title, reason, details: message, severity: reason === 'Fake listing' ? 'High' : 'Medium', status: 'Open', reporter: draft.profile.name, createdAt: 'Aug 5, 2026' }) }) }
  function submitLocation(e: FormEvent) { e.preventDefault(); mutate(location ? 'Location updated' : 'Location added', (draft) => { const item = { ...locationForm, id: locationForm.id === 'loc-new' ? `loc-${Date.now()}` : locationForm.id }; const index = draft.locations.findIndex((l) => l.id === item.id); if (index >= 0) draft.locations[index] = item; else draft.locations.push(item) }) }
  return <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && close()}><div className="modal" role="dialog" aria-modal="true"><div className="modal-header"><div><span className="eyebrow">{modal.type === 'inquiry' ? 'Contact agent' : modal.type === 'report' ? 'Trust & safety' : modal.type === 'location' ? 'Reference data' : 'Please confirm'}</span><h2>{modal.type === 'inquiry' ? `Ask about ${modal.listing.title}` : modal.type === 'report' ? 'Report this listing' : modal.type === 'location' ? location ? 'Edit location' : 'Add a location' : modal.title}</h2></div><button className="icon-btn" onClick={close}><X /></button></div>{modal.type === 'confirm' && <><p>{modal.body}</p><div className="modal-actions"><button className="btn ghost" onClick={close}>Cancel</button><button className={`btn ${modal.danger ? 'danger' : 'primary'}`} onClick={modal.action}>Confirm</button></div></>}{modal.type === 'inquiry' && <form onSubmit={submitInquiry}><div className="modal-listing"><img src={modal.listing.image} alt="" /><div><strong>{modal.listing.title}</strong><span>{money.format(modal.listing.price)} · {modal.listing.agentName}</span></div></div><Field label="Preferred contact"><select><option>WhatsApp</option><option>Phone</option><option>Email</option></select></Field><Field label="Message"><textarea rows={5} value={message} onChange={(e) => setMessage(e.target.value)} /></Field><p className="privacy-note"><ShieldCheck size={15} />Your contact details are shared only with this listing's agent.</p><div className="modal-actions"><button className="btn ghost" type="button" onClick={close}>Cancel</button><button className="btn primary" disabled={busy}><Send size={17} />Send inquiry</button></div></form>}{modal.type === 'report' && <form onSubmit={submitReport}><Field label="What is wrong?"><select value={reason} onChange={(e) => setReason(e.target.value)}><option>Stale availability</option><option>Wrong price</option><option>Wrong location</option><option>Fake listing</option><option>Duplicate listing</option><option>Other</option></select></Field><Field label="What happened?"><textarea required rows={5} value={message} onChange={(e) => setMessage(e.target.value)} /></Field><div className="modal-actions"><button className="btn ghost" type="button" onClick={close}>Cancel</button><button className="btn danger" disabled={busy}><Flag size={17} />Submit report</button></div></form>}{modal.type === 'location' && <form onSubmit={submitLocation}><div className="form-grid"><Field label="Campus"><input required value={locationForm.campus} onChange={(e) => setLocationForm({ ...locationForm, campus: e.target.value })} /></Field><Field label="Abbreviation"><input required value={locationForm.abbreviation} onChange={(e) => setLocationForm({ ...locationForm, abbreviation: e.target.value })} /></Field><Field label="Area"><input required value={locationForm.area} onChange={(e) => setLocationForm({ ...locationForm, area: e.target.value })} /></Field><Field label="City"><input required value={locationForm.city} onChange={(e) => setLocationForm({ ...locationForm, city: e.target.value })} /></Field><Field label="Region" wide><input required value={locationForm.region} onChange={(e) => setLocationForm({ ...locationForm, region: e.target.value })} /></Field></div><div className="modal-actions"><button className="btn ghost" type="button" onClick={close}>Cancel</button><button className="btn primary">Save location</button></div></form>}</div></div>
}

function Drawer({ title, close, children }: { title: string; close: () => void; children: ReactNode }) { return <div className="drawer-backdrop" onMouseDown={(e) => e.target === e.currentTarget && close()}><aside className="drawer"><div className="drawer-header"><div><span className="eyebrow">Details</span><h2>{title}</h2></div><button className="icon-btn" onClick={close}><X /></button></div><div className="drawer-body">{children}</div></aside></div> }
function PageHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: ReactNode }) { return <div className="page-header"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>{action}</div> }
function SectionHeading({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: ReactNode }) { return <div className="section-heading"><div><span className="eyebrow">{eyebrow}</span><h2>{title}</h2><p>{description}</p></div>{action}</div> }
function FormHeading({ number, title, description }: { number: string; title: string; description: string }) { return <div className="form-heading"><span>{number}</span><div><h2>{title}</h2><p>{description}</p></div></div> }
function Field({ label, children, wide }: { label: string; children: ReactNode; wide?: boolean }) { return <label className={`field ${wide ? 'wide' : ''}`}><span>{label}</span>{children}</label> }
function FilterGroup({ label, children }: { label: string; children: ReactNode }) { return <div className="filter-group"><strong>{label}</strong>{children}</div> }
function FormSection({ title, description, children }: { title: string; description: string; children: ReactNode }) { return <section className="form-section"><div className="form-section-heading"><h2>{title}</h2><p>{description}</p></div><div>{children}</div></section> }
function DetailSection({ title, children }: { title: string; children: ReactNode }) { return <section className="detail-section"><h2>{title}</h2>{children}</section> }
function Badge({ tone = 'neutral', children }: { tone?: Tone; children: ReactNode }) { return <span className={`badge ${tone}`}>{children}</span> }
type SignalKind = 'availability' | 'freshness' | 'verified'

function SignalTag({ kind, value, active, explain = true, floating }: { kind: SignalKind; value: string; active?: boolean; explain?: boolean; floating?: boolean }) {
  const normalized = value.toLowerCase().replace(/\s+/g, '-')
  const Icon = kind === 'verified' ? ShieldCheck : value === 'Available' ? CheckCircle2 : value === 'Limited' || value === 'Confirmed this week' ? Clock3 : value === 'Full' || value === 'Stale' ? CircleAlert : value === 'Confirmed today' ? CheckCircle2 : RefreshCw
  return <span className={`signal-tag icon-only ${explain ? 'has-tip' : ''} ${kind} ${normalized} ${floating ? 'floating' : ''} ${active ? 'tip-active' : ''}`} data-tip={explain ? value : undefined} aria-label={value} tabIndex={explain ? 0 : -1}><Icon size={14} /></span>
}
function Fact({ label, value, icon }: { label: string; value: string; icon?: ReactNode }) { return <div className={`fact ${icon ? 'with-icon' : ''}`}>{icon && <i>{icon}</i>}<span>{label}</span><strong>{value}</strong></div> }
function Metric({ label, value, detail, tone = 'neutral', icon }: { label: string; value: string; detail: string; tone?: Tone; icon?: ReactNode }) { return <div className={`metric ${tone}`}>{icon && <i className="metric-icon">{icon}</i>}<span>{label}</span><strong>{value}</strong><small>{detail}</small></div> }
function Review({ label, value }: { label: string; value: string }) { return <div><span>{label}</span><strong>{value}</strong></div> }
function Queue({ icon, title, value, detail, tone, onClick }: { icon: ReactNode; title: string; value: string; detail: string; tone: Tone; onClick: () => void }) { return <button onClick={onClick}><span className={`queue-icon ${tone}`}>{icon}</span><div><strong>{title}</strong><small>{detail}</small></div><Badge tone={tone}>{value}</Badge><ChevronRight /></button> }
function ActivityItem({ icon, title, meta }: { icon: ReactNode; title: string; meta: string }) { return <div><span>{icon}</span><div><strong>{title}</strong><small>{meta}</small></div></div> }
function EmptyState({ icon, title, body, action, onAction }: { icon: ReactNode; title: string; body: string; action?: string; onAction?: () => void }) { return <div className="empty-state"><span>{icon}</span><h2>{title}</h2><p>{body}</p>{action && <button className="btn primary" onClick={onAction}>{action}</button>}</div> }

function AgentMiniCard({ agent, navigate, expanded }: { agent: Agent; navigate: (p: string) => void; expanded?: boolean }) { return <div className={`agent-mini ${expanded ? 'expanded' : ''}`}><div className="agent-mini-head"><span className="avatar-sm large">{initials(agent.name)}</span><div><strong>{agent.name}</strong><span>{agent.business}</span></div><ShieldCheck className="verified-shield" /></div>{expanded && <p>{agent.bio}</p>}<div className="agent-metrics"><span><strong>{agent.responseRate}%</strong> response</span><span><strong>{agent.freshnessScore}%</strong> fresh</span></div><button className="text-button" onClick={() => navigate(`/agents/${agent.id}`)}>View public profile <ChevronRight size={15} /></button></div> }
function InquiryDetail({ inquiry }: { inquiry: Inquiry }) { return <><div className="inquiry-person"><span className="profile-avatar small-avatar">{initials(inquiry.student)}</span><div><h2>{inquiry.student}</h2><p>{inquiry.studentEmail}<br />{inquiry.studentPhone}</p></div></div><Badge tone={statusTone(inquiry.status)}>{inquiry.status}</Badge><DetailSection title={inquiry.listing}><blockquote>“{inquiry.message}”</blockquote><small>Received {inquiry.createdAt} via {inquiry.contactMethod}</small></DetailSection><div className="review-list"><Review label="Last update" value={inquiry.updatedAt} /><Review label="Preferred contact" value={inquiry.contactMethod} /></div></> }
function Preferences({ db, mutate, agent }: { db: Database; mutate: AppProps['mutate']; agent?: boolean }) { const items = agent ? [['staleReminders', 'Stale listing reminders', 'Tell me when availability needs a new check'], ['inquiryUpdates', 'New inquiry alerts', 'Send an alert as soon as a student asks']] : [['inquiryUpdates', 'Inquiry updates', 'Agent responses and viewing changes'], ['savedChanges', 'Saved room changes', 'Availability or freshness changes'], ['emailDigest', 'Weekly email digest', 'A compact summary of saved rooms']]; return <FormSection title="Notification preferences" description="Choose the updates that matter to you."><div className="toggle-list">{items.map(([key, title, desc]) => <label key={key}><div><strong>{title}</strong><span>{desc}</span></div><input type="checkbox" checked={Boolean(db.preferences[key as keyof Database['preferences']])} onChange={() => mutate('Notification preference updated', (draft) => { const k = key as keyof Database['preferences']; draft.preferences[k] = !draft.preferences[k] })} /><i /></label>)}</div></FormSection> }

function freshnessRank(value: Listing['freshness']) { return ['Confirmed today', 'Confirmed this week', 'Needs refresh', 'Stale'].indexOf(value) }
function firstByValue<T extends { id: string }>(items: T[], getValue: (item: T) => string) { return items.reduce<Record<string, string>>((seen, item) => { const value = getValue(item); if (!seen[value]) seen[value] = item.id; return seen }, {}) }
function initials(name: string) { return name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase() }
function statusTone(status: InquiryStatus): Tone { return status === 'New' ? 'warning' : status === 'Contacted' ? 'info' : status === 'Viewing Scheduled' ? 'success' : status === 'Negotiating' ? 'warning' : status === 'Closed Won' ? 'success' : 'neutral' }
function verificationTone(status: Agent['verification']): Tone { return status === 'Verified' ? 'success' : status === 'Pending' ? 'warning' : status === 'Suspended' || status === 'Rejected' ? 'danger' : 'neutral' }

export default App
