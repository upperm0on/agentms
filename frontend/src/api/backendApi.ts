import {
  loadDatabase,
  type Agent,
  type Database,
  type Inquiry,
  type InquiryStatus,
  type Listing,
  type Location,
  type Notification,
  type Report,
  type Role,
  type Tone,
  type User,
} from './mockApi'

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api'
const roomImages = ['/images/room-1.png', '/images/room-2.png', '/images/room-3.png', '/images/room-4.png', '/images/room-5.jpeg', '/images/room-6.jpeg']

const devCredentials: Partial<Record<Role, { email: string; password: string }>> = {
  student: { email: 'esi@knust.edu.gh', password: 'password123' },
  agent: { email: 'ama@campuskey.com', password: 'password123' },
  admin: { email: 'admin@agentms.local', password: 'password123' },
}

type Paginated<T> = { results: T[] }

type ApiUser = {
  id: string
  email: string
  first_name: string
  last_name: string
  name: string
  phone: string
  role: 'student' | 'agent' | 'admin'
  is_email_verified: boolean
  status: 'active' | 'suspended'
  last_active_at: string | null
}

type ApiArea = {
  id: string
  campus_name: string
  campus_abbreviation: string
  city: string
  region_name: string
  name: string
  is_active: boolean
}

type ApiAgent = {
  id: string
  user_detail: ApiUser
  display_name: string
  business_name: string
  bio: string
  phone: string
  whatsapp_number: string
  verification_status: string
  operating_area_details: ApiArea[]
  response_rate: string
  listing_freshness_score: string
  documents: { title: string }[]
  created_at: string
}

type ApiListing = {
  id: string
  agent: string
  agent_detail: ApiAgent
  property: string
  property_detail: {
    id: string
    name: string
    area_detail: ApiArea
  }
  title: string
  description: string
  status: string
  availability_status: string
  moderation_status: string
  room_type: string
  gender_restriction: string
  capacity: number
  available_slots: number
  price_amount: string
  price_period: string
  amenities_detail: { name: string }[]
  rules: { text: string }[]
  cover_image: string
  saved: boolean
  view_count: number
  inquiry_count: number
  last_confirmed_at: string | null
  created_at: string
  updated_at: string
}

type ApiInquiry = {
  id: string
  student_detail: ApiUser
  listing: string
  listing_detail: ApiListing
  agent: string
  agent_detail: ApiAgent
  message: string
  student_phone: string
  preferred_contact_method: string
  status: string
  created_at: string
  updated_at: string
}

type ApiReport = {
  id: string
  listing: string
  listing_detail: ApiListing
  reported_by_detail: ApiUser | null
  reason: string
  details: string
  severity: string
  status: string
  created_at: string
}

type ApiNotification = {
  id: string
  title: string
  body: string
  tone: Tone
  audience: 'student' | 'agent' | 'admin'
  is_read: boolean
  created_at: string
}

function authHeader(role: Role) {
  const credentials = devCredentials[role]
  return credentials ? { Authorization: `Basic ${btoa(`${credentials.email}:${credentials.password}`)}` } : {}
}

async function apiFetch<T>(path: string, role: Role, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers)
  headers.set('Accept', 'application/json')
  if (init.body) headers.set('Content-Type', 'application/json')
  Object.entries(authHeader(role)).forEach(([key, value]) => headers.set(key, value))

  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
  })
  if (!response.ok) {
    throw new Error(`${init.method ?? 'GET'} ${path} failed with ${response.status}`)
  }
  if (response.status === 204) return undefined as T
  return response.json()
}

async function apiList<T>(path: string, role: Role): Promise<T[]> {
  const data = await apiFetch<Paginated<T> | T[]>(path, role)
  return Array.isArray(data) ? data : data.results
}

function label(value: string) {
  return value.split('_').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ')
}

function dateLabel(value: string | null) {
  if (!value) return 'Not recorded'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

function freshness(value: string | null): Listing['freshness'] {
  if (!value) return 'Stale'
  const days = (Date.now() - new Date(value).getTime()) / 86_400_000
  if (days <= 1) return 'Confirmed today'
  if (days <= 7) return 'Confirmed this week'
  if (days <= 14) return 'Needs refresh'
  return 'Stale'
}

function apiModeration(status: Listing['moderation']) {
  return status.toLowerCase()
}

function apiInquiryStatus(status: InquiryStatus) {
  return status.toLowerCase().replaceAll(' ', '_')
}

function apiReportStatus(status: Report['status']) {
  return status.toLowerCase()
}

function apiVerification(status: Agent['verification']) {
  return status.toLowerCase()
}

function mapUser(user: ApiUser): User {
  return {
    id: user.id,
    name: user.name || `${user.first_name} ${user.last_name}`.trim() || user.email,
    email: user.email,
    role: label(user.role) as User['role'],
    verified: user.is_email_verified,
    status: label(user.status) as User['status'],
    lastActive: dateLabel(user.last_active_at),
  }
}

function mapArea(area: ApiArea): Location {
  return {
    id: area.id,
    campus: area.campus_name,
    abbreviation: area.campus_abbreviation,
    city: area.city,
    area: area.name,
    region: area.region_name,
    active: area.is_active,
  }
}

function mapAgent(agent: ApiAgent): Agent {
  return {
    id: agent.id,
    name: agent.display_name,
    business: agent.business_name,
    email: agent.user_detail.email,
    phone: agent.phone,
    whatsapp: agent.whatsapp_number || agent.phone,
    bio: agent.bio,
    areas: agent.operating_area_details.map((area) => area.name),
    verification: label(agent.verification_status) as Agent['verification'],
    responseRate: Number(agent.response_rate),
    freshnessScore: Number(agent.listing_freshness_score),
    joined: dateLabel(agent.created_at),
    documents: agent.documents.map((document) => document.title),
  }
}

function mapListing(listing: ApiListing, index = 0): Listing {
  const area = listing.property_detail.area_detail
  return {
    id: listing.id,
    title: listing.title,
    property: listing.property_detail.name,
    propertyId: listing.property,
    campus: area.campus_name,
    area: area.name,
    price: Number(listing.price_amount),
    period: label(listing.price_period).toLowerCase(),
    occupancy: label(listing.room_type),
    gender: label(listing.gender_restriction),
    availability: label(listing.availability_status) as Listing['availability'],
    freshness: freshness(listing.last_confirmed_at),
    status: label(listing.status) as Listing['status'],
    moderation: label(listing.moderation_status) as Listing['moderation'],
    agentId: listing.agent,
    agentName: listing.agent_detail.display_name,
    verified: listing.agent_detail.verification_status === 'verified',
    capacity: listing.capacity,
    slots: listing.available_slots,
    description: listing.description,
    amenities: listing.amenities_detail.map((amenity) => amenity.name),
    rules: listing.rules.map((rule) => rule.text),
    image: roomImages[index % roomImages.length],
    saved: listing.saved,
    views: listing.view_count,
    inquiries: listing.inquiry_count,
    updatedAt: dateLabel(listing.updated_at),
  }
}

function mapInquiry(inquiry: ApiInquiry): Inquiry {
  return {
    id: inquiry.id,
    listingId: inquiry.listing,
    listing: inquiry.listing_detail.title,
    student: inquiry.student_detail.name,
    studentEmail: inquiry.student_detail.email,
    studentPhone: inquiry.student_phone,
    agentId: inquiry.agent,
    agent: inquiry.agent_detail.display_name,
    status: label(inquiry.status) as InquiryStatus,
    message: inquiry.message,
    contactMethod: label(inquiry.preferred_contact_method) as Inquiry['contactMethod'],
    updatedAt: dateLabel(inquiry.updated_at),
    createdAt: dateLabel(inquiry.created_at),
  }
}

function mapReport(report: ApiReport): Report {
  return {
    id: report.id,
    listingId: report.listing,
    listing: report.listing_detail.title,
    reason: label(report.reason),
    details: report.details,
    severity: label(report.severity) as Report['severity'],
    status: label(report.status) as Report['status'],
    reporter: report.reported_by_detail?.name ?? 'Anonymous',
    createdAt: dateLabel(report.created_at),
  }
}

function mapNotification(notification: ApiNotification): Notification {
  return {
    id: notification.id,
    title: notification.title,
    body: notification.body,
    time: dateLabel(notification.created_at),
    read: notification.is_read,
    tone: notification.tone,
    audience: notification.audience,
  }
}

async function fetchCurrentUser(role: Role) {
  if (role === 'public') return null
  try {
    return await apiFetch<ApiUser>('/auth/me/', role)
  } catch {
    return null
  }
}

export async function loadBackendDatabase(role: Role): Promise<Database> {
  const fallback = loadDatabase()
  const apiRole = role === 'public' ? 'public' : role
  const [listingsApi, areasApi, meApi] = await Promise.all([
    apiList<ApiListing>(role === 'admin' ? '/admin/listings/' : '/listings/', apiRole),
    apiList<ApiArea>('/locations/areas/', 'public'),
    fetchCurrentUser(apiRole),
  ])

  const listings = listingsApi.map(mapListing)
  const agentMap = new Map<string, Agent>()
  listingsApi.forEach((listing) => agentMap.set(listing.agent_detail.id, mapAgent(listing.agent_detail)))

  const [adminAgents, adminReports, inquiriesApi, notificationsApi, savedApi] = await Promise.all([
    role === 'admin' ? apiList<ApiAgent>('/admin/agents/', role).catch(() => []) : Promise.resolve([]),
    role === 'admin' ? apiList<ApiReport>('/admin/reports/', role).catch(() => []) : Promise.resolve([]),
    role === 'agent' ? apiList<ApiInquiry>('/inquiries/agent/', role).catch(() => []) : role === 'student' ? apiList<ApiInquiry>('/inquiries/student/', role).catch(() => []) : Promise.resolve([]),
    role !== 'public' ? apiList<ApiNotification>('/notifications/', role).catch(() => []) : Promise.resolve([]),
    role === 'student' ? apiList<{ listing: string }>('/listings/saved/', role).catch(() => []) : Promise.resolve([]),
  ])
  const adminUsers = role === 'admin' ? await apiList<ApiUser>('/admin/users/', role).catch(() => []) : []

  adminAgents.forEach((agent) => agentMap.set(agent.id, mapAgent(agent)))
  const savedIds = new Set(savedApi.map((saved) => saved.listing))
  const mappedListings = listings.map((listing) => ({ ...listing, saved: listing.saved || savedIds.has(listing.id) }))
  const users = role === 'admin' ? adminUsers.map(mapUser) : meApi ? [mapUser(meApi)] : []

  return {
    ...fallback,
    listings: mappedListings,
    inquiries: inquiriesApi.map(mapInquiry),
    agents: Array.from(agentMap.values()),
    reports: role === 'admin' ? adminReports.map(mapReport) : [],
    locations: areasApi.map(mapArea),
    users,
    notifications: notificationsApi.map(mapNotification),
    profile: meApi ? {
      name: meApi.name,
      email: meApi.email,
      phone: meApi.phone,
      whatsapp: meApi.phone,
      campus: fallback.profile.campus,
    } : fallback.profile,
  }
}

export async function persistBackendMutation(before: Database, after: Database, role: Role) {
  const createdInquiry = after.inquiries.find((item) => !before.inquiries.some((existing) => existing.id === item.id))
  if (createdInquiry) {
    await apiFetch(`/inquiries/listings/${createdInquiry.listingId}/`, 'student', {
      method: 'POST',
      body: JSON.stringify({
        message: createdInquiry.message,
        student_phone: createdInquiry.studentPhone,
        preferred_contact_method: createdInquiry.contactMethod.toLowerCase(),
      }),
    })
    return
  }

  const createdReport = after.reports.find((item) => !before.reports.some((existing) => existing.id === item.id))
  if (createdReport) {
    await apiFetch(`/moderation/listings/${createdReport.listingId}/reports/`, 'student', {
      method: 'POST',
      body: JSON.stringify({
        reason: createdReport.reason.toLowerCase().replaceAll(' ', '_'),
        details: createdReport.details,
        severity: createdReport.severity.toLowerCase(),
      }),
    })
    return
  }

  for (const listing of after.listings) {
    const previous = before.listings.find((item) => item.id === listing.id)
    if (!previous) continue
    if (previous.saved !== listing.saved && listing.saved) {
      await apiFetch('/listings/saved/', 'student', {
        method: 'POST',
        body: JSON.stringify({ listing: listing.id }),
      })
      return
    }
    if (previous.freshness !== listing.freshness || previous.slots !== listing.slots || previous.availability !== listing.availability) {
      await apiFetch(`/listings/${listing.id}/refresh-availability/`, 'agent', {
        method: 'POST',
        body: JSON.stringify({
          availability_status: listing.availability.toLowerCase(),
          available_slots: listing.slots,
        }),
      })
      return
    }
    if (previous.status !== listing.status && listing.status === 'Published') {
      await apiFetch(`/listings/${listing.id}/publish/`, 'agent', { method: 'POST' })
      return
    }
    if (previous.status !== listing.status && listing.status === 'Unpublished') {
      await apiFetch(`/listings/${listing.id}/unpublish/`, 'agent', { method: 'POST' })
      return
    }
    if ((previous.moderation !== listing.moderation || previous.status !== listing.status) && role === 'admin') {
      await apiFetch(`/admin/listings/${listing.id}/moderation/`, 'admin', {
        method: 'PATCH',
        body: JSON.stringify({
          moderation_status: apiModeration(listing.moderation),
          note: 'Updated from AgentMS frontend prototype.',
        }),
      })
      return
    }
  }

  for (const inquiry of after.inquiries) {
    const previous = before.inquiries.find((item) => item.id === inquiry.id)
    if (previous && previous.status !== inquiry.status) {
      await apiFetch(`/inquiries/agent/${inquiry.id}/`, 'agent', {
        method: 'PATCH',
        body: JSON.stringify({
          status: apiInquiryStatus(inquiry.status),
          agent_notes: 'Updated from AgentMS frontend prototype.',
        }),
      })
      return
    }
  }

  for (const agent of after.agents) {
    const previous = before.agents.find((item) => item.id === agent.id)
    if (previous && previous.verification !== agent.verification) {
      await apiFetch(`/admin/agents/${agent.id}/verification/`, 'admin', {
        method: 'PATCH',
        body: JSON.stringify({
          verification_status: apiVerification(agent.verification),
          verification_notes: 'Updated from AgentMS frontend prototype.',
        }),
      })
      return
    }
  }

  for (const report of after.reports) {
    const previous = before.reports.find((item) => item.id === report.id)
    if (previous && previous.status !== report.status) {
      await apiFetch(`/admin/reports/${report.id}/`, 'admin', {
        method: 'PATCH',
        body: JSON.stringify({
          status: apiReportStatus(report.status),
          resolution_notes: 'Updated from AgentMS frontend prototype.',
        }),
      })
      return
    }
  }
}
