import {
  createEmptyDatabase,
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

const RAW_API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api'
export const API_BASE = RAW_API_BASE.replace(/\/$/, '')
const API_ORIGIN = /^https?:\/\//.test(API_BASE) ? new URL(API_BASE).origin : window.location.origin
const DEMO_AUTH_ENABLED = import.meta.env.VITE_USE_DEMO_AUTH !== 'false'
const BACKEND_RETRY_MS = 10_000
const FRONTEND_DATABASE_CACHE_MS = 60_000
const FRONTEND_LISTINGS_CACHE_MS = 300_000
let backendUnavailableUntil = 0
const backendDatabaseCache = new Map<string, { expiresAt: number; data: Database }>()
const backendListingsCache = new Map<string, { expiresAt: number; data: ApiListing[] }>()
const backendListingPageCache = new Map<string, { expiresAt: number; data: ListingPagePayload }>()
let backendLocationsCache: { expiresAt: number; data: Location[] } | null = null
const apiGetInflight = new Map<string, Promise<unknown>>()

const devCredentials: Partial<Record<Role, { email: string; password: string }>> = {
  student: { email: 'esi@knust.edu.gh', password: 'password123' },
  agent: { email: 'ama@campuskey.com', password: 'password123' },
  admin: { email: 'admin@agentms.local', password: 'password123' },
}

type Paginated<T> = { count?: number; results: T[]; next?: string | null }

export type ListingFilters = {
  q?: string
  campus?: string
  availability?: string
  roomTypes?: string[]
  minPrice?: string
  maxPrice?: string
  sort?: string
}

export type ListingDetailPayload = {
  listing: Listing
  agent: Agent
}

export type ListingPagePayload = {
  database: Database
  next: string | null
  count: number | null
}

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
  user_detail?: ApiUser
  display_name: string
  business_name: string
  bio: string
  phone: string
  whatsapp_number: string
  verification_status: string
  operating_area_details?: ApiArea[]
  response_rate: string
  listing_freshness_score: string
  documents?: { title: string }[]
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
  images: { image: string; caption: string; sort_order: number; is_cover: boolean }[]
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
  if (!DEMO_AUTH_ENABLED) return {}
  const credentials = devCredentials[role]
  return credentials ? { Authorization: `Basic ${btoa(`${credentials.email}:${credentials.password}`)}` } : {}
}

function cookieValue(name: string) {
  return document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${name}=`))
    ?.split('=')[1] ?? ''
}

function databaseCacheKey(role: Role, filters: ListingFilters) {
  return JSON.stringify({ role, filters })
}

function hasListingFilters(filters: ListingFilters) {
  return Boolean(
    filters.q?.trim()
    || (filters.campus && filters.campus !== 'All campuses')
    || (filters.availability && filters.availability !== 'Any availability')
    || filters.roomTypes?.length
    || filters.minPrice?.trim()
    || filters.maxPrice?.trim()
    || (filters.sort && filters.sort !== 'Freshest')
  )
}

function readDatabaseCache(role: Role, filters: ListingFilters) {
  const cached = backendDatabaseCache.get(databaseCacheKey(role, filters))
  if (cached && cached.expiresAt > Date.now()) return structuredClone(cached.data)

  if (shouldFilterListingsLocally(role) && hasListingFilters(filters)) {
    const base = backendDatabaseCache.get(databaseCacheKey(role, {}))
    if (base && base.expiresAt > Date.now()) {
      const database = structuredClone(base.data)
      database.listings = applyLocalListingFilters(database.listings, filters)
      return database
    }
  }

  return null
}

function writeDatabaseCache(role: Role, filters: ListingFilters, data: Database) {
  backendDatabaseCache.set(databaseCacheKey(role, filters), {
    expiresAt: Date.now() + FRONTEND_DATABASE_CACHE_MS,
    data: structuredClone(data),
  })
}

function invalidateBackendDatabaseCache() {
  backendDatabaseCache.clear()
  backendListingsCache.clear()
  backendListingPageCache.clear()
}

function listingCacheKey(role: Role) {
  return `listings:${role}`
}

function shouldFilterListingsLocally(role: Role) {
  return role === 'public' || role === 'student'
}

function readListingsCache(role: Role) {
  const cached = backendListingsCache.get(listingCacheKey(role))
  if (!cached || cached.expiresAt <= Date.now()) return null
  return structuredClone(cached.data)
}

function writeListingsCache(role: Role, data: ApiListing[]) {
  backendListingsCache.set(listingCacheKey(role), {
    expiresAt: Date.now() + FRONTEND_LISTINGS_CACHE_MS,
    data: structuredClone(data),
  })
}

function listingPageCacheKey(role: Role, filters: ListingFilters, next?: string | null) {
  return JSON.stringify({ role, filters, next: next ?? null })
}

function readListingPageCache(role: Role, filters: ListingFilters, next?: string | null) {
  const cached = backendListingPageCache.get(listingPageCacheKey(role, filters, next))
  if (!cached || cached.expiresAt <= Date.now()) return null
  return structuredClone(cached.data)
}

function writeListingPageCache(role: Role, filters: ListingFilters, next: string | null | undefined, data: ListingPagePayload) {
  backendListingPageCache.set(listingPageCacheKey(role, filters, next), {
    expiresAt: Date.now() + FRONTEND_LISTINGS_CACHE_MS,
    data: structuredClone(data),
  })
}

async function apiListings(path: string, role: Role, cacheRole?: Role): Promise<ApiListing[]> {
  if (cacheRole) {
    const cached = readListingsCache(cacheRole)
    if (cached) return cached
  }

  const listings = await apiList<ApiListing>(path, role)
  if (cacheRole) writeListingsCache(cacheRole, listings)
  return listings
}

function apiPathFromUrl(value: string) {
  const nextUrl = new URL(value, window.location.origin)
  const nextPath = nextUrl.pathname.startsWith('/api/') ? nextUrl.pathname.slice(4) : nextUrl.pathname
  return `${nextPath}${nextUrl.search}`
}

export function apiUrl(path: string) {
  return `${API_BASE}${path}`
}

async function apiFetch<T>(path: string, role: Role, init: RequestInit = {}): Promise<T> {
  const method = init.method ?? 'GET'
  const inflightKey = method === 'GET' && !init.body ? `${role}:${path}` : ''
  if (inflightKey && apiGetInflight.has(inflightKey)) return apiGetInflight.get(inflightKey) as Promise<T>

  const headers = new Headers(init.headers)
  headers.set('Accept', 'application/json')
  if (init.body) headers.set('Content-Type', 'application/json')
  if (!['GET', 'HEAD', 'OPTIONS', 'TRACE'].includes(method.toUpperCase())) {
    const csrfToken = cookieValue('csrftoken')
    if (csrfToken) headers.set('X-CSRFToken', decodeURIComponent(csrfToken))
  }
  Object.entries(authHeader(role)).forEach(([key, value]) => headers.set(key, value))

  const request = fetch(apiUrl(path), {
    ...init,
    credentials: 'include',
    headers,
  }).then(async (response) => {
    if (!response.ok) {
      let detail = `${method} ${path} failed with ${response.status}`
      try {
        const data = await response.clone().json()
        if (typeof data?.detail === 'string') detail = data.detail
      } catch {
        detail = `${method} ${path} failed with ${response.status}`
      }
      throw new Error(detail)
    }
    if (response.status === 204) return undefined as T
    return response.json() as Promise<T>
  }).finally(() => {
    if (inflightKey) apiGetInflight.delete(inflightKey)
  })

  if (inflightKey) apiGetInflight.set(inflightKey, request)
  return request
}

export type BackendAuthUser = ReturnType<typeof mapUser>

export async function loginBackend(email: string, password: string) {
  const user = await apiFetch<ApiUser>('/auth/login/', 'public', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  invalidateBackendDatabaseCache()
  return mapUser(user)
}

export async function registerBackend(payload: {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
  role: 'student' | 'agent'
}) {
  const user = await apiFetch<ApiUser>('/auth/register/', 'public', {
    method: 'POST',
    body: JSON.stringify({
      email: payload.email,
      password: payload.password,
      first_name: payload.firstName,
      last_name: payload.lastName,
      phone: payload.phone ?? '',
      role: payload.role,
    }),
  })
  invalidateBackendDatabaseCache()
  return mapUser(user)
}

export async function loginWithGoogleBackend(credential: string, role: 'student' | 'agent') {
  const user = await apiFetch<ApiUser>('/auth/google/', 'public', {
    method: 'POST',
    body: JSON.stringify({ credential, role }),
  })
  invalidateBackendDatabaseCache()
  return mapUser(user)
}

export async function logoutBackend() {
  await apiFetch<void>('/auth/logout/', 'public', { method: 'POST' })
  invalidateBackendDatabaseCache()
}

async function apiList<T>(path: string, role: Role): Promise<T[]> {
  const data = await apiFetch<Paginated<T> | T[]>(path, role)
  if (Array.isArray(data)) return data
  const results = [...data.results]
  let next = data.next
  while (next) {
    const nextPage = await apiFetch<Paginated<T>>(apiPathFromUrl(next), role)
    results.push(...nextPage.results)
    next = nextPage.next
  }
  return results
}

async function apiPage<T>(path: string, role: Role): Promise<Paginated<T>> {
  const data = await apiFetch<Paginated<T> | T[]>(path, role)
  return Array.isArray(data) ? { results: data, next: null, count: data.length } : data
}

function listingQuery(filters: ListingFilters = {}) {
  const params = new URLSearchParams()
  if (filters.q?.trim()) params.set('q', filters.q.trim())
  if (filters.campus && filters.campus !== 'All campuses') params.set('campus', filters.campus)
  if (filters.availability && filters.availability !== 'Any availability') params.set('availability', filters.availability.toLowerCase())
  if (filters.roomTypes?.length) params.set('room_type', filters.roomTypes.join(','))
  if (filters.minPrice?.trim()) params.set('min_price', filters.minPrice.trim())
  if (filters.maxPrice?.trim()) params.set('max_price', filters.maxPrice.trim())
  if (filters.sort === 'Lowest price') params.set('ordering', 'price')
  if (filters.sort === 'Highest price') params.set('ordering', '-price')
  if (filters.sort === 'Popular') params.set('ordering', 'popular')
  const query = params.toString()
  return query ? `?${query}` : ''
}

function listingPath(filters: ListingFilters = {}, next?: string | null) {
  return next ? apiPathFromUrl(next) : `/listings/${listingQuery(filters)}`
}

function freshnessRank(value: Listing['freshness']) {
  return ['Confirmed today', 'Confirmed this week', 'Needs refresh', 'Stale'].indexOf(value)
}

function roomTypeValue(value: string) {
  const normalized = value.toLowerCase()
  if (normalized.includes('single')) return 'single'
  if (normalized.includes('shared') || normalized.includes(' in room')) return 'shared'
  if (normalized.includes('studio')) return 'studio'
  if (normalized.includes('apartment')) return 'apartment'
  return normalized.replaceAll(' ', '_')
}

function applyLocalListingFilters(listings: Listing[], filters: ListingFilters = {}) {
  const term = filters.q?.trim().toLowerCase()
  const roomTypes = new Set(filters.roomTypes ?? [])
  const minPrice = filters.minPrice?.trim() ? Number(filters.minPrice) : null
  const maxPrice = filters.maxPrice?.trim() ? Number(filters.maxPrice) : null
  return listings
    .filter((listing) => listing.status === 'Published' && listing.moderation !== 'Rejected')
    .filter((listing) => !term || `${listing.title} ${listing.property} ${listing.campus} ${listing.area} ${listing.description}`.toLowerCase().includes(term))
    .filter((listing) => !filters.campus || filters.campus === 'All campuses' || listing.campus === filters.campus)
    .filter((listing) => !filters.availability || filters.availability === 'Any availability' || listing.availability === filters.availability)
    .filter((listing) => roomTypes.size === 0 || roomTypes.has(roomTypeValue(listing.occupancy)))
    .filter((listing) => minPrice === null || Number.isNaN(minPrice) || listing.price >= minPrice)
    .filter((listing) => maxPrice === null || Number.isNaN(maxPrice) || listing.price <= maxPrice)
    .sort((a, b) => {
      if (filters.sort === 'Lowest price') return a.price - b.price
      if (filters.sort === 'Highest price') return b.price - a.price
      if (filters.sort === 'Popular') return (b.inquiries * 5 + b.views) - (a.inquiries * 5 + a.views)
      return freshnessRank(a.freshness) - freshnessRank(b.freshness)
    })
}

function localDatabase(role: Role, filters: ListingFilters = {}) {
  const fallback = createEmptyDatabase()
  return {
    ...fallback,
    listings: role === 'admin' ? fallback.listings : applyLocalListingFilters(fallback.listings, filters),
  }
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

function mediaUrl(value: string) {
  if (!value) return ''
  if (/^https?:\/\//.test(value)) return value
  return new URL(value.startsWith('/') ? value : `/${value}`, API_ORIGIN).toString()
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
    email: agent.user_detail?.email ?? '',
    phone: agent.phone,
    whatsapp: agent.whatsapp_number || agent.phone,
    bio: agent.bio,
    areas: agent.operating_area_details?.map((area) => area.name) ?? [],
    verification: label(agent.verification_status) as Agent['verification'],
    responseRate: Number(agent.response_rate),
    freshnessScore: Number(agent.listing_freshness_score),
    joined: dateLabel(agent.created_at),
    documents: agent.documents?.map((document) => document.title) ?? [],
  }
}

function mapListing(listing: ApiListing): Listing {
  const area = listing.property_detail.area_detail
  const images = listing.images
    .slice()
    .sort((a, b) => Number(b.is_cover) - Number(a.is_cover) || a.sort_order - b.sort_order)
    .map((image) => mediaUrl(image.image))
    .filter(Boolean)
  const coverImage = mediaUrl(listing.cover_image) || images[0] || ''
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
    image: coverImage,
    images: images.length ? images : coverImage ? [coverImage] : [],
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

export async function loadBackendDatabase(role: Role, filters: ListingFilters = {}): Promise<Database> {
  const cached = readDatabaseCache(role, filters)
  if (cached) return cached

  if (Date.now() < backendUnavailableUntil) return localDatabase(role, filters)

  const fallback = createEmptyDatabase()
  const apiRole = role === 'public' ? 'public' : role
  const useLocalListingFilters = shouldFilterListingsLocally(role)
  const listingsPath = role === 'admin' ? '/admin/listings/' : `/listings/${useLocalListingFilters ? '' : listingQuery(filters)}`
  let listingsApi: ApiListing[]
  let areasApi: ApiArea[]
  let meApi: ApiUser | null
  let agentMeApi: ApiAgent | null = null
  try {
    ;[listingsApi, areasApi, meApi, agentMeApi] = await Promise.all([
      apiListings(listingsPath, apiRole, useLocalListingFilters ? role : undefined),
      apiList<ApiArea>('/locations/areas/', 'public'),
      fetchCurrentUser(apiRole),
      role === 'agent' ? apiFetch<ApiAgent>('/agents/me/', role).catch(() => null) : Promise.resolve(null),
    ])
  } catch (error) {
    backendUnavailableUntil = Date.now() + BACKEND_RETRY_MS
    console.warn('Backend API unavailable; using local filtered data until retry window expires.', error)
    return localDatabase(role, filters)
  }

  const listings = listingsApi.map(mapListing)
  const agentMap = new Map<string, Agent>()
  listingsApi.forEach((listing) => agentMap.set(listing.agent_detail.id, mapAgent(listing.agent_detail)))
  if (agentMeApi) agentMap.set(agentMeApi.id, mapAgent(agentMeApi))

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
  const savedListings = listings.map((listing) => ({ ...listing, saved: listing.saved || savedIds.has(listing.id) }))
  const mappedListings = useLocalListingFilters ? applyLocalListingFilters(savedListings, filters) : savedListings
  const users = role === 'admin' ? adminUsers.map(mapUser) : meApi ? [mapUser(meApi)] : []

  const database = {
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
      campus: areasApi[0]?.campus_name ?? '',
    } : fallback.profile,
  }
  if (useLocalListingFilters) {
    writeDatabaseCache(role, {}, { ...database, listings: savedListings })
  }
  writeDatabaseCache(role, filters, database)
  return database
}

export async function loadBackendLocations(): Promise<Location[]> {
  if (backendLocationsCache && backendLocationsCache.expiresAt > Date.now()) {
    return structuredClone(backendLocationsCache.data)
  }
  const locations = (await apiList<ApiArea>('/locations/areas/', 'public')).map(mapArea)
  backendLocationsCache = {
    expiresAt: Date.now() + FRONTEND_LISTINGS_CACHE_MS,
    data: structuredClone(locations),
  }
  return locations
}

export async function loadBackendListingsPage(role: Role = 'public', filters: ListingFilters = {}, next: string | null = null): Promise<ListingPagePayload> {
  const cached = readListingPageCache(role, filters, next)
  if (cached) return cached

  if (Date.now() < backendUnavailableUntil) {
    return { database: localDatabase(role, filters), next: null, count: null }
  }

  const fallback = createEmptyDatabase()
  const apiRole = role === 'public' ? 'public' : role
  const path = listingPath(filters, next)
  try {
    const [page, meApi, notificationsApi, savedApi] = await Promise.all([
      apiPage<ApiListing>(path, apiRole),
      next ? Promise.resolve(null) : fetchCurrentUser(apiRole),
      !next && role !== 'public' ? apiList<ApiNotification>('/notifications/', role).catch(() => []) : Promise.resolve([]),
      role === 'student' ? apiList<{ listing: string }>('/listings/saved/', role).catch(() => []) : Promise.resolve([]),
    ])

    const savedIds = new Set(savedApi.map((saved) => saved.listing))
    const listings = page.results
      .map(mapListing)
      .map((listing) => ({ ...listing, saved: listing.saved || savedIds.has(listing.id) }))
    const agentMap = new Map<string, Agent>()
    page.results.forEach((listing) => agentMap.set(listing.agent_detail.id, mapAgent(listing.agent_detail)))

    const database = {
      ...fallback,
      listings,
      agents: Array.from(agentMap.values()),
      locations: fallback.locations,
      users: meApi ? [mapUser(meApi)] : [],
      notifications: notificationsApi.map(mapNotification),
      profile: meApi ? {
        name: meApi.name,
        email: meApi.email,
        phone: meApi.phone,
        whatsapp: meApi.phone,
        campus: '',
      } : fallback.profile,
    }
    const payload = { database, next: page.next ?? null, count: page.count ?? null }
    writeListingPageCache(role, filters, next, payload)
    return payload
  } catch (error) {
    backendUnavailableUntil = Date.now() + BACKEND_RETRY_MS
    console.warn('Backend listing page unavailable; using local filtered data until retry window expires.', error)
    return { database: localDatabase(role, filters), next: null, count: null }
  }
}

export async function loadBackendListingDetail(id: string, role: Role = 'public'): Promise<ListingDetailPayload> {
  const apiRole = role === 'public' ? 'public' : role
  const listingApi = await apiFetch<ApiListing>(`/listings/${id}/`, apiRole)
  return {
    listing: mapListing(listingApi),
    agent: mapAgent(listingApi.agent_detail),
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
    invalidateBackendDatabaseCache()
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
    invalidateBackendDatabaseCache()
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
      invalidateBackendDatabaseCache()
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
      invalidateBackendDatabaseCache()
      return
    }
    if (previous.status !== listing.status && listing.status === 'Published') {
      await apiFetch(`/listings/${listing.id}/publish/`, 'agent', { method: 'POST' })
      invalidateBackendDatabaseCache()
      return
    }
    if (previous.status !== listing.status && listing.status === 'Unpublished') {
      await apiFetch(`/listings/${listing.id}/unpublish/`, 'agent', { method: 'POST' })
      invalidateBackendDatabaseCache()
      return
    }
    if ((previous.moderation !== listing.moderation || previous.status !== listing.status) && role === 'admin') {
      await apiFetch(`/admin/listings/${listing.id}/moderation/`, 'admin', {
        method: 'PATCH',
        body: JSON.stringify({
          moderation_status: apiModeration(listing.moderation),
          note: 'Updated from AgentMS frontend.',
        }),
      })
      invalidateBackendDatabaseCache()
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
          agent_notes: 'Updated from AgentMS frontend.',
        }),
      })
      invalidateBackendDatabaseCache()
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
          verification_notes: 'Updated from AgentMS frontend.',
        }),
      })
      invalidateBackendDatabaseCache()
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
          resolution_notes: 'Updated from AgentMS frontend.',
        }),
      })
      invalidateBackendDatabaseCache()
      return
    }
  }
}
