export type Role = 'public' | 'student' | 'agent' | 'admin'
export type Tone = 'success' | 'warning' | 'danger' | 'info' | 'neutral'
export type InquiryStatus = 'New' | 'Contacted' | 'Viewing Scheduled' | 'Negotiating' | 'Closed Won' | 'Closed Lost'

export type Listing = {
  id: string
  title: string
  property: string
  propertyId?: string
  campusId?: string
  areaId?: string
  campus: string
  area: string
  price: number
  period: string
  occupancy: string
  gender: string
  availability: 'Available' | 'Limited' | 'Full' | 'Unavailable'
  freshness: 'Confirmed today' | 'Confirmed this week' | 'Needs refresh' | 'Stale'
  status: 'Draft' | 'Published' | 'Unpublished' | 'Archived' | 'Removed'
  moderation: 'Approved' | 'Pending' | 'Flagged' | 'Rejected'
  agentId: string
  agentName: string
  verified: boolean
  capacity: number
  slots: number
  description: string
  amenities: string[]
  rules: string[]
  image: string
  images: string[]
  saved: boolean
  views: number
  inquiries: number
  updatedAt: string
}

export type Inquiry = {
  id: string
  listingId: string
  listing: string
  student: string
  studentEmail: string
  studentPhone: string
  agentId: string
  agent: string
  status: InquiryStatus
  message: string
  contactMethod: 'WhatsApp' | 'Phone' | 'Email'
  updatedAt: string
  createdAt: string
}

export type Agent = {
  id: string
  name: string
  business: string
  email: string
  phone: string
  whatsapp: string
  bio: string
  areas: string[]
  areaIds: string[]
  verification: 'Unsubmitted' | 'Pending' | 'Verified' | 'Rejected' | 'Suspended'
  responseRate: number
  freshnessScore: number
  joined: string
  verificationNotes: string
  documents: { id: string; title: string; file: string }[]
}

export type Report = {
  id: string
  listingId: string
  listing: string
  reason: string
  details: string
  severity: 'Low' | 'Medium' | 'High'
  status: 'Open' | 'Reviewing' | 'Resolved' | 'Dismissed'
  reporter: string
  resolutionNotes: string
  createdAt: string
}

export type Location = {
  id: string
  campusId?: string
  campus: string
  abbreviation: string
  city: string
  area: string
  region: string
  active: boolean
}

export type User = {
  id: string
  name: string
  email: string
  role: 'Student' | 'Agent' | 'Admin'
  verified: boolean
  status: 'Active' | 'Suspended'
  lastActive: string
}

export type Notification = {
  id: string
  title: string
  body: string
  time: string
  read: boolean
  tone: Tone
  audience: 'student' | 'agent' | 'admin'
}

export type AdminActivity = {
  id: string
  title: string
  meta: string
  entityType: string
}

export type Database = {
  listings: Listing[]
  inquiries: Inquiry[]
  agents: Agent[]
  reports: Report[]
  locations: Location[]
  users: User[]
  notifications: Notification[]
  adminActivity: AdminActivity[]
  profile: { name: string; email: string; phone: string; whatsapp: string; campus: string; campusId: string }
  preferences: { inquiryUpdates: boolean; savedChanges: boolean; emailDigest: boolean; staleReminders: boolean }
}

export function createEmptyDatabase(): Database {
  return {
    listings: [],
    inquiries: [],
    agents: [],
    reports: [],
    locations: [],
    users: [],
    notifications: [],
    adminActivity: [],
    profile: { name: '', email: '', phone: '', whatsapp: '', campus: '', campusId: '' },
    preferences: { inquiryUpdates: false, savedChanges: false, emailDigest: false, staleReminders: false },
  }
}
