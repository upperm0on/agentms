export type AppId = 'consumer' | 'agent' | 'admin'
export type StatusTone = 'fresh' | 'warning' | 'danger' | 'info' | 'neutral'

export type RouteSpec = {
  route: string
  title: string
  goal: string
  components: string[]
}

export type AppSurface = {
  id: AppId
  name: string
  shortName: string
  audience: string
  headline: string
  description: string
  boundary: string
  primaryAction: string
  routes: RouteSpec[]
}

export type Listing = {
  id: string
  name: string
  campus: string
  area: string
  price: string
  occupancy: string
  gender: string
  status: string
  freshness: string
  agent: string
  tone: StatusTone
}

export type Inquiry = {
  id: string
  listing: string
  student: string
  agent: string
  state: string
  nextUpdate: string
  tone: StatusTone
}

export type Metric = {
  label: string
  value: string
  detail: string
  tone: StatusTone
}

export type QueueItem = {
  id: string
  queue: string
  volume: string
  signal: string
  action: string
  tone: StatusTone
}

export const appSurfaces: AppSurface[] = [
  {
    id: 'consumer',
    name: 'AgentMS Student',
    shortName: 'Student',
    audience: 'Students and public visitors',
    headline: 'Find current rooms without learning an operations tool',
    description:
      'A focused student-facing app for search, listing detail, saved rooms, inquiry tracking, and account basics.',
    boundary:
      'Students never see admin queues, agent verification operations, listing moderation, or internal platform controls.',
    primaryAction: 'Search rooms',
    routes: [
      {
        route: '/',
        title: 'Home search',
        goal: 'Start campus or area search and explain that listings are agent-sourced and freshness-aware.',
        components: ['Public nav', 'Campus search', 'Fresh listing strip', 'Trust summary'],
      },
      {
        route: '/listings',
        title: 'Listings',
        goal: 'Compare rooms by campus, price, gender, occupancy, availability, freshness, and agent verification.',
        components: ['Search toolbar', 'Filter sheet', 'Listing cards', 'Sort', 'Empty states'],
      },
      {
        route: '/listings/:id',
        title: 'Listing detail',
        goal: 'Inspect room detail, freshness, agent summary, rules, media, and inquiry action.',
        components: ['Gallery', 'Room detail', 'Agent card', 'Inquiry action', 'Report action'],
      },
      {
        route: '/agents/:id',
        title: 'Agent profile',
        goal: 'Review public agent credibility, operating areas, trust metrics, and active listings.',
        components: ['Profile header', 'Verification badge', 'Trust metrics', 'Listing grid'],
      },
      {
        route: '/student/dashboard',
        title: 'My dashboard',
        goal: 'Resume active inquiries, monitor saved listings, and return to search quickly.',
        components: ['Summary cards', 'Inquiry list', 'Saved listing preview'],
      },
      {
        route: '/student/inquiries',
        title: 'My inquiries',
        goal: 'Track inquiry states and next contact actions.',
        components: ['Inquiry list', 'State badges', 'Listing summary', 'Agent summary'],
      },
      {
        route: '/student/saved',
        title: 'Saved listings',
        goal: 'Compare saved listings and notice freshness or availability changes.',
        components: ['Listing cards', 'Freshness badges', 'Filters', 'Empty state'],
      },
      {
        route: '/login',
        title: 'Login',
        goal: 'Authenticate students without exposing staff operations.',
        components: ['Auth form', 'Validation', 'Password reset link'],
      },
    ],
  },
  {
    id: 'agent',
    name: 'AgentMS Agent Console',
    shortName: 'Agent',
    audience: 'Accommodation agents',
    headline: 'Keep listings fresh and respond to student demand',
    description:
      'A separate operational console for agents to manage profile trust, verification, listings, availability, and inquiries.',
    boundary:
      'Agents do not access admin moderation decisions, global users, platform-wide reports, or another agent’s listings.',
    primaryAction: 'New listing',
    routes: [
      {
        route: '/agent/dashboard',
        title: 'Dashboard',
        goal: 'Show today’s operational priorities: stale listings, new inquiries, verification, and listing health.',
        components: ['Task cards', 'Freshness queue', 'Inquiry queue', 'Stats'],
      },
      {
        route: '/agent/profile',
        title: 'Profile',
        goal: 'Maintain public agent identity and contact channels.',
        components: ['Profile form', 'Operating areas', 'Public preview'],
      },
      {
        route: '/agent/verification',
        title: 'Verification',
        goal: 'Submit and track verification evidence.',
        components: ['Stepper', 'Document checklist', 'Status panel'],
      },
      {
        route: '/agent/listings',
        title: 'Listings',
        goal: 'Manage owned listings and availability freshness.',
        components: ['Listing table', 'Filters', 'Publish controls', 'Refresh action'],
      },
      {
        route: '/agent/listings/new',
        title: 'New listing',
        goal: 'Create structured room listing data.',
        components: ['Multi-section form', 'Media upload', 'Room type editor'],
      },
      {
        route: '/agent/inquiries',
        title: 'Inquiries',
        goal: 'Follow up students and update lead status.',
        components: ['Inquiry table', 'Status picker', 'Detail drawer'],
      },
    ],
  },
  {
    id: 'admin',
    name: 'AgentMS Admin Operations',
    shortName: 'Admin',
    audience: 'Platform operators',
    headline: 'Review trust, moderate listings, and maintain platform data',
    description:
      'A separate internal app for verification, moderation, reports, locations, users, and baseline platform oversight.',
    boundary:
      'Admin operations are not part of the consumer or agent apps. No impersonation, payments, or raw database editing in MVP.',
    primaryAction: 'Review queue',
    routes: [
      {
        route: '/admin/dashboard',
        title: 'Dashboard',
        goal: 'Monitor trust, listing freshness, moderation, and platform activity.',
        components: ['KPI cards', 'Queues', 'Compact charts'],
      },
      {
        route: '/admin/agents',
        title: 'Agents',
        goal: 'Review agent verification and account states.',
        components: ['Data table', 'Filters', 'Status actions'],
      },
      {
        route: '/admin/agents/:id',
        title: 'Agent review',
        goal: 'Inspect evidence, activity, listings, reports, and decision history.',
        components: ['Evidence list', 'Decision controls', 'Audit timeline'],
      },
      {
        route: '/admin/listings',
        title: 'Listing moderation',
        goal: 'Moderate published and flagged listings.',
        components: ['Data table', 'Status filters', 'Hide/remove actions'],
      },
      {
        route: '/admin/reports',
        title: 'Reports',
        goal: 'Triage stale, fake, duplicate, or misleading listing reports.',
        components: ['Report queue', 'Severity badges', 'Evidence drawer'],
      },
      {
        route: '/admin/locations',
        title: 'Locations',
        goal: 'Manage campus and area reference data.',
        components: ['Location table', 'Create/edit modal', 'Archive state'],
      },
      {
        route: '/admin/users',
        title: 'Users',
        goal: 'Inspect user accounts and role/status state without impersonation.',
        components: ['User table', 'Filters', 'Account drawer'],
      },
    ],
  },
]

export const listings: Listing[] = [
  {
    id: 'lst_ayeduase_single',
    name: 'Ayeduase single room',
    campus: 'KNUST',
    area: 'Ayeduase',
    price: 'GHS 1,250',
    occupancy: 'Single',
    gender: 'Any gender',
    status: 'Available',
    freshness: 'Confirmed today',
    agent: 'Ama Mensah',
    tone: 'fresh',
  },
  {
    id: 'lst_kotei_shared',
    name: 'Kotei shared room',
    campus: 'KNUST',
    area: 'Kotei',
    price: 'GHS 900',
    occupancy: '2 in room',
    gender: 'Female only',
    status: 'Limited',
    freshness: 'Confirmed this week',
    agent: 'Kojo Rooms',
    tone: 'warning',
  },
  {
    id: 'lst_bomso_chamber',
    name: 'Bomso chamber and hall',
    campus: 'KNUST',
    area: 'Bomso',
    price: 'GHS 2,800',
    occupancy: 'Private',
    gender: 'Any gender',
    status: 'Needs refresh',
    freshness: 'Stale',
    agent: 'Nana Lets',
    tone: 'danger',
  },
]

export const studentMetrics: Metric[] = [
  { label: 'Active inquiries', value: '3', detail: '1 viewing scheduled', tone: 'fresh' },
  { label: 'Saved listings', value: '8', detail: '2 refreshed today', tone: 'info' },
  { label: 'Fresh matches', value: '12', detail: 'Near KNUST', tone: 'fresh' },
]

export const agentMetrics: Metric[] = [
  { label: 'New inquiries', value: '8', detail: 'Needs response', tone: 'warning' },
  { label: 'Needs refresh', value: '5', detail: 'Availability stale', tone: 'danger' },
  { label: 'Verification', value: 'Pending', detail: 'Submitted 2 days ago', tone: 'warning' },
]

export const adminMetrics: Metric[] = [
  { label: 'Pending agents', value: '14', detail: 'Verification queue', tone: 'warning' },
  { label: 'Open reports', value: '6', detail: '2 high severity', tone: 'danger' },
  { label: 'Stale listings', value: '42', detail: 'Reminder due', tone: 'warning' },
]

export const inquiries: Inquiry[] = [
  {
    id: 'inq_ayeduase_1',
    listing: 'Ayeduase single room',
    student: 'Esi Boateng',
    agent: 'Ama Mensah',
    state: 'Contacted',
    nextUpdate: 'Updated today',
    tone: 'fresh',
  },
  {
    id: 'inq_kotei_1',
    listing: 'Kotei shared room',
    student: 'Akua Owusu',
    agent: 'Kojo Rooms',
    state: 'Viewing Scheduled',
    nextUpdate: 'Tomorrow, 10:00',
    tone: 'info',
  },
  {
    id: 'inq_bomso_1',
    listing: 'Bomso chamber and hall',
    student: 'Kwame Adu',
    agent: 'Nana Lets',
    state: 'Negotiating',
    nextUpdate: '2 hours ago',
    tone: 'warning',
  },
]

export const adminQueues: QueueItem[] = [
  {
    id: 'queue_verification',
    queue: 'Agent verification',
    volume: '14 pending',
    signal: 'Oldest: 3 days',
    action: 'Review',
    tone: 'warning',
  },
  {
    id: 'queue_reports',
    queue: 'Reported listings',
    volume: '6 open',
    signal: '2 high severity',
    action: 'Triage',
    tone: 'danger',
  },
  {
    id: 'queue_freshness',
    queue: 'Stale listings',
    volume: '42 need action',
    signal: 'Reminder due',
    action: 'Notify',
    tone: 'warning',
  },
]

export const mockApiMap = {
  apps: 'GET /api/ecosystem/apps',
  listings: 'GET /api/listings',
  inquiries: 'GET /api/inquiries',
  agentMetrics: 'GET /api/agent/metrics',
  adminQueues: 'GET /api/admin/queues',
}
