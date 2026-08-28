import type { AppProps } from '../app/types'
import { MapPin } from 'lucide-react'
import { EmptyState } from '../components/shared/Primitives'
import { HomePage } from '../features/public/HomePage'
import { ListingsPage } from '../features/public/ListingsPage'
import { ListingDetailPage } from '../features/public/ListingDetailPage'
import { PublicAgentPage } from '../features/public/PublicAgentPage'
import { AuthPage } from '../features/auth/AuthPage'
import { StudentDashboard, StudentInquiries, StudentProfile, StudentSaved } from '../features/student'
import { AgentDashboard, AgentListings, AgentProfile, AgentSettings, AgentVerification, ListingFormPage } from '../features/agent'
import { AdminAgentDetail, AdminAgents, AdminDashboard, AdminInquiries, AdminListings, AdminLocations, AdminReports, AdminUsers } from '../features/admin'

export function Router(props: AppProps) {
  const { path } = props
  if (path === '/') return <HomePage {...props} />
  if (path === '/listings') return <ListingsPage {...props} />
  if (/^\/listings\/[^/]+$/.test(path)) return <ListingDetailPage {...props} id={path.split('/')[2]} />
  if (/^\/agents\/[^/]+$/.test(path)) return <PublicAgentPage {...props} id={path.split('/')[2]} />
  if (path === '/login' || path === '/signup' || path === '/forgot-password' || path === '/reset-password' || path.startsWith('/verify-email')) return <AuthPage key={path} {...props} />
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
  if (path === '/agent/settings') return <AgentSettings {...props} />
  if (path === '/admin/dashboard') return <AdminDashboard {...props} />
  if (path === '/admin/agents') return <AdminAgents {...props} />
  if (/^\/admin\/agents\/[^/]+$/.test(path)) return <AdminAgentDetail {...props} id={path.split('/')[3]} />
  if (path === '/admin/listings') return <AdminListings {...props} />
  if (path === '/admin/inquiries') return <AdminInquiries {...props} />
  if (path === '/admin/reports') return <AdminReports {...props} />
  if (path === '/admin/locations') return <AdminLocations {...props} />
  if (path === '/admin/users') return <AdminUsers {...props} />
  return <EmptyState icon={<MapPin />} title="Page not found" body="That route is not part of the AgentMS MVP." action="Return home" onAction={() => props.navigate('/')} />
}
