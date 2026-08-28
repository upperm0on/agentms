import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { CheckCircle2, LoaderCircle } from 'lucide-react'
import { createEmptyDatabase, type Database, type Role } from '../api/mockApi'
import { getCurrentBackendUser, loadBackendDatabase, loadBackendListingDetail, loadBackendListingsPage, loadBackendLocations, loginBackend, loginWithGoogleBackend, logoutBackend, persistBackendMutation, registerBackend, type BackendAuthUser, type ListingFilters } from '../api/backendApi'
import { usePath } from './navigation'
import type { ModalState } from './types'
import { Router } from '../routes/Router'
import { AppShellHeader, PublicHeader, Sidebar } from '../components/layout/AppShell'
import { Modal } from '../components/overlays/Modal'
import '../styles/app.css'

const Workscape = lazy(() => import('../workscape/Workscape').then((module) => ({ default: module.Workscape })))

export function AppRoot() {
  const { path, navigate } = usePath()
  const [db, setDb] = useState(createEmptyDatabase)
  const [modal, setModal] = useState<ModalState>(null)
  const [toast, setToast] = useState('')
  const [busy, setBusy] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [listingNextPage, setListingNextPage] = useState<string | null>(null)
  const [listingTotal, setListingTotal] = useState<number | null>(null)
  const [currentUser, setCurrentUser] = useState<BackendAuthUser | null>(null)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const refreshRequestId = useRef(0)

  const role: Role = path.startsWith('/agent') ? 'agent' : path.startsWith('/admin') ? 'admin' : path.startsWith('/student') ? 'student' : 'public'
  const workspaceRole = role === 'student' || role === 'agent' || role === 'admin' ? role : null
  const authPage = path === '/login' || path === '/signup'

  function dashboardPath(nextRole: Role) {
    return nextRole === 'agent' ? '/agent/dashboard' : nextRole === 'admin' ? '/admin/dashboard' : '/student/dashboard'
  }

  async function refreshFromBackend(nextRole = role, filters: ListingFilters = {}) {
    const requestId = ++refreshRequestId.current
    try {
      const remote = await loadBackendDatabase(nextRole, filters)
      if (requestId === refreshRequestId.current) setDb(remote)
      return remote
    } catch (error) {
      console.error('Backend refresh failed', error)
      setToast('Backend API unavailable; no fallback data loaded')
      window.setTimeout(() => setToast(''), 3200)
      return null
    }
  }

  async function refreshListingDetail(id: string) {
    try {
      const detail = await loadBackendListingDetail(id, role)
      setDb((current) => {
        const listings = current.listings.some((listing) => listing.id === detail.listing.id)
          ? current.listings.map((listing) => listing.id === detail.listing.id ? detail.listing : listing)
          : [detail.listing, ...current.listings]
        const agents = current.agents.some((agent) => agent.id === detail.agent.id)
          ? current.agents.map((agent) => agent.id === detail.agent.id ? detail.agent : agent)
          : [detail.agent, ...current.agents]
        return { ...current, listings, agents }
      })
    } catch (error) {
      console.error('Listing detail refresh failed', error)
    }
  }

  async function loadListingPage(nextRole: Role = role, filters: ListingFilters = {}) {
    const requestId = ++refreshRequestId.current
    const page = await loadBackendListingsPage(nextRole, filters)
    if (requestId === refreshRequestId.current) {
      setDb(page.database)
      setListingNextPage(page.next)
      setListingTotal(page.count)
    }
    return page.database
  }

  async function loadMoreListings(nextRole: Role = role, filters: ListingFilters = {}) {
    if (!listingNextPage) return null
    const page = await loadBackendListingsPage(nextRole, filters, listingNextPage)
    setDb((current) => {
      const listingIds = new Set(current.listings.map((listing) => listing.id))
      const agentIds = new Set(current.agents.map((agent) => agent.id))
      return {
        ...current,
        listings: [...current.listings, ...page.database.listings.filter((listing) => !listingIds.has(listing.id))],
        agents: [...current.agents, ...page.database.agents.filter((agent) => !agentIds.has(agent.id))],
      }
    })
    setListingNextPage(page.next)
    setListingTotal(page.count)
    return page.database
  }

  async function loadLocations() {
    const locations = await loadBackendLocations()
    setDb((current) => ({ ...current, locations }))
    return locations
  }

  function go(next: string) {
    setMenuOpen(false)
    setNotificationsOpen(false)
    navigate(next)
  }

  async function openWorkspaceForUser(user: BackendAuthUser) {
    const nextRole = user.role.toLowerCase() as Role
    setCurrentUser(user)
    go(dashboardPath(nextRole))
    await refreshFromBackend(nextRole)
  }

  async function loginWithPassword(email: string, password: string) {
    setBusy(true)
    try {
      await openWorkspaceForUser(await loginBackend(email, password))
    } finally {
      setBusy(false)
    }
  }

  async function registerWithPassword(payload: { email: string; password: string; firstName: string; lastName: string; role: 'student' | 'agent' }) {
    setBusy(true)
    try {
      await openWorkspaceForUser(await registerBackend(payload))
    } finally {
      setBusy(false)
    }
  }

  async function loginWithGoogle(credential: string, nextRole: 'student' | 'agent') {
    setBusy(true)
    try {
      await openWorkspaceForUser(await loginWithGoogleBackend(credential, nextRole))
    } finally {
      setBusy(false)
    }
  }

  async function logout() {
    setBusy(true)
    try {
      await logoutBackend()
    } catch (error) {
      console.error('Logout failed', error)
    } finally {
      setCurrentUser(null)
      setDb(createEmptyDatabase())
      setBusy(false)
      go('/login')
    }
  }

  useEffect(() => {
    let active = true
    async function loadRoute() {
      if (workspaceRole) {
        setCheckingAuth(true)
        try {
          const user = await getCurrentBackendUser()
          if (!active) return
          const actualRole = user.role.toLowerCase() as Role
          setCurrentUser(user)
          if (actualRole !== workspaceRole) {
            go(dashboardPath(actualRole))
            return
          }
          await refreshFromBackend(actualRole)
        } catch {
          if (!active) return
          setCurrentUser(null)
          go('/login')
        } finally {
          if (active) setCheckingAuth(false)
        }
        return
      }

      if (authPage) {
        setCheckingAuth(true)
        try {
          const user = await getCurrentBackendUser()
          if (!active) return
          setCurrentUser(user)
          go(dashboardPath(user.role.toLowerCase() as Role))
        } catch {
          if (!active) return
          setCurrentUser(null)
        } finally {
          if (active) setCheckingAuth(false)
        }
        return
      }

      setCheckingAuth(false)
      getCurrentBackendUser()
        .then((user) => {
          if (active) setCurrentUser(user)
        })
        .catch(() => {
          if (active) setCurrentUser(null)
        })
      if (path === '/') {
        loadListingPage('public')
        return
      }
      if (path === '/listings') return
      if (path === '/workscape') return
      if (path === '/login' || path === '/signup' || path === '/forgot-password' || path === '/reset-password' || path.startsWith('/verify-email')) return

      const listingDetailMatch = path.match(/^\/listings\/([^/]+)$/)
      if (listingDetailMatch) {
        refreshListingDetail(listingDetailMatch[1])
        return
      }
      refreshFromBackend(role)
    }
    loadRoute()
    return () => {
      active = false
    }
  }, [authPage, role, workspaceRole, path])

  async function mutate(message: string, update: (draft: Database) => void, options: { note?: string } = {}) {
    setBusy(true)
    const before = structuredClone(db)
    const draft = structuredClone(db)
    update(draft)
    setDb(draft)
    try {
      await persistBackendMutation(before, draft, role, options)
      await refreshFromBackend(role)
      setToast(message)
    } catch (error) {
      console.error('Backend mutation failed', error)
      setDb(before)
      setToast(error instanceof Error ? error.message : 'Backend update failed; changes were not applied')
    } finally {
      setBusy(false)
      setModal(null)
      window.setTimeout(() => setToast(''), 3200)
    }
  }

  const app = { db, path, navigate: go, mutate, setModal, busy, refreshFromBackend, loadListingPage, loadMoreListings, loadLocations, loginWithPassword, registerWithPassword, loginWithGoogle, listingNextPage, listingTotal }

  if (path === '/workscape') return <Suspense fallback={<div className="page"><LoaderCircle /></div>}><Workscape navigate={go} /></Suspense>
  if (workspaceRole && checkingAuth && !currentUser) return <div className="page"><LoaderCircle className="spin" /></div>

  return (
    <div className={`app role-${role}`}>
      {role === 'public' ? (
        <PublicHeader path={path} navigate={go} db={db} notificationsOpen={notificationsOpen} setNotificationsOpen={setNotificationsOpen} currentUser={currentUser} onLogout={logout} />
      ) : (
        <AppShellHeader role={role} path={path} navigate={go} db={db} menuOpen={menuOpen} setMenuOpen={setMenuOpen} notificationsOpen={notificationsOpen} setNotificationsOpen={setNotificationsOpen} onLogout={logout} />
      )}
      <main className={role === 'agent' || role === 'admin' ? 'with-sidebar' : ''}>
        {(role === 'agent' || role === 'admin') && <Sidebar role={role} path={path} navigate={navigate} open={menuOpen} onLogout={logout} />}
        <div className={role === 'agent' || role === 'admin' ? 'workspace' : ''}>
          <Router {...app} />
        </div>
      </main>
      {modal && <Modal modal={modal} db={db} mutate={mutate} close={() => setModal(null)} busy={busy} />}
      {toast && <div className="toast" role="status"><CheckCircle2 size={18} />{toast}</div>}
    </div>
  )
}
