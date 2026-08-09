export type Role = 'public' | 'student' | 'agent' | 'admin'
export type Tone = 'success' | 'warning' | 'danger' | 'info' | 'neutral'
export type InquiryStatus = 'New' | 'Contacted' | 'Viewing Scheduled' | 'Negotiating' | 'Closed Won' | 'Closed Lost'

export type Listing = {
  id: string
  title: string
  property: string
  propertyId?: string
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
  verification: 'Unsubmitted' | 'Pending' | 'Verified' | 'Rejected' | 'Suspended'
  responseRate: number
  freshnessScore: number
  joined: string
  documents: string[]
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
  createdAt: string
}

export type Location = {
  id: string
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

export type Database = {
  listings: Listing[]
  inquiries: Inquiry[]
  agents: Agent[]
  reports: Report[]
  locations: Location[]
  users: User[]
  notifications: Notification[]
  profile: { name: string; email: string; phone: string; whatsapp: string; campus: string }
  preferences: { inquiryUpdates: boolean; savedChanges: boolean; emailDigest: boolean; staleReminders: boolean }
}

const images = ['/images/room-1.png', '/images/room-2.png', '/images/room-3.png', '/images/room-4.png', '/images/room-5.jpeg', '/images/room-6.jpeg']

const seed: Database = {
  listings: [
    ['lst-1', 'Sunlit single room', 'Unity Court', 'KNUST', 'Ayeduase', 4200, 'academic year', 'Single room', 'Any gender', 'Available', 'Confirmed today', 'Published', 'Approved', 'agt-1', 'Ama Mensah', true, 1, 1, 'A quiet, furnished single room with reliable water and a short walk to the KNUST commercial area.', ['Wi-Fi', 'Study desk', 'Water tank', 'Security'], ['No smoking', 'Visitors until 9 PM'], 0, 286, 18, 'Today, 08:40'],
    ['lst-2', 'Two-in-a-room at Kotei', 'North Gate Hostel', 'KNUST', 'Kotei', 2850, 'academic year', '2 in room', 'Female only', 'Limited', 'Confirmed this week', 'Published', 'Approved', 'agt-2', 'Kojo Rooms', true, 2, 1, 'Bright shared room with private washroom, kitchen access and regular shuttle service to campus.', ['Private bath', 'Shuttle', 'Kitchen', 'Backup power'], ['Female residents only', 'No pets'], 1, 174, 11, 'Yesterday, 16:20'],
    ['lst-3', 'Chamber and hall', 'Bomso Residences', 'KNUST', 'Bomso', 6900, 'year', 'Private apartment', 'Any gender', 'Available', 'Needs refresh', 'Published', 'Flagged', 'agt-3', 'Nana Lets', false, 2, 2, 'Self-contained chamber and hall for students who want more space and privacy.', ['Kitchen', 'Parking', 'Water tank'], ['One-year agreement'], 0, 93, 4, '9 days ago'],
    ['lst-4', 'Affordable shared room', 'Pentagon Annex', 'University of Ghana', 'East Legon', 5100, 'academic year', '4 in room', 'Mixed', 'Available', 'Confirmed today', 'Published', 'Approved', 'agt-1', 'Ama Mensah', true, 4, 2, 'Modern shared student room close to the UG shuttle route with shared study lounge.', ['Wi-Fi', 'Air conditioning', 'Study lounge', 'Laundry'], ['Student ID required'], 1, 412, 29, 'Today, 09:15'],
    ['lst-5', 'Private studio near UCC', 'Cape Coast Studio', 'UCC', 'Amamoma', 4800, 'academic year', 'Studio', 'Any gender', 'Full', 'Confirmed this week', 'Published', 'Approved', 'agt-2', 'Kojo Rooms', true, 1, 0, 'Compact self-contained studio with kitchenette and easy transport to UCC Science Gate.', ['Kitchenette', 'Private bath', 'Water tank'], ['Quiet hours after 10 PM'], 0, 207, 14, '3 days ago'],
    ['lst-6', 'Three-in-a-room at Boadi', 'Green Court', 'KNUST', 'Boadi', 2400, 'academic year', '3 in room', 'Male only', 'Available', 'Stale', 'Unpublished', 'Pending', 'agt-1', 'Ama Mensah', true, 3, 3, 'Budget shared room in a gated compound with a direct car route to KNUST.', ['Security', 'Water tank', 'Parking'], ['Male residents only'], 0, 61, 2, '16 days ago'],
  ].map((x, i) => ({
    id: x[0], title: x[1], property: x[2], campus: x[3], area: x[4], price: x[5], period: x[6], occupancy: x[7], gender: x[8], availability: x[9], freshness: x[10], status: x[11], moderation: x[12], agentId: x[13], agentName: x[14], verified: x[15], capacity: x[16], slots: x[17], description: x[18], amenities: x[19], rules: x[20], image: images[i], saved: Boolean(x[21]), views: x[22], inquiries: x[23], updatedAt: x[24],
  })) as Listing[],
  inquiries: [
    { id: 'inq-1', listingId: 'lst-1', listing: 'Sunlit single room', student: 'Esi Boateng', studentEmail: 'esi@knust.edu.gh', studentPhone: '+233 24 555 0182', agentId: 'agt-1', agent: 'Ama Mensah', status: 'Contacted', message: 'Is the room still available? I would like to visit this week.', contactMethod: 'WhatsApp', updatedAt: 'Today, 09:32', createdAt: 'Aug 3, 2026' },
    { id: 'inq-2', listingId: 'lst-4', listing: 'Affordable shared room', student: 'Esi Boateng', studentEmail: 'esi@knust.edu.gh', studentPhone: '+233 24 555 0182', agentId: 'agt-1', agent: 'Ama Mensah', status: 'Viewing Scheduled', message: 'Can I see the room on Wednesday morning?', contactMethod: 'Phone', updatedAt: 'Tomorrow, 10:00', createdAt: 'Aug 2, 2026' },
    { id: 'inq-3', listingId: 'lst-3', listing: 'Chamber and hall', student: 'Kwame Adu', studentEmail: 'kwame@st.knust.edu.gh', studentPhone: '+233 55 901 1182', agentId: 'agt-3', agent: 'Nana Lets', status: 'Negotiating', message: 'Is the annual price negotiable if I pay at once?', contactMethod: 'WhatsApp', updatedAt: '2 hours ago', createdAt: 'Aug 1, 2026' },
    { id: 'inq-4', listingId: 'lst-1', listing: 'Sunlit single room', student: 'Akua Owusu', studentEmail: 'akua@knust.edu.gh', studentPhone: '+233 20 440 1290', agentId: 'agt-1', agent: 'Ama Mensah', status: 'New', message: 'Please send the exact location and viewing times.', contactMethod: 'Email', updatedAt: '18 minutes ago', createdAt: 'Aug 5, 2026' },
  ],
  agents: [
    { id: 'agt-1', name: 'Ama Mensah', business: 'CampusKey Rooms', email: 'ama@campuskey.com', phone: '+233 24 402 7188', whatsapp: '+233 24 402 7188', bio: 'Student accommodation agent serving KNUST and UG with current, personally checked room options.', areas: ['Ayeduase', 'Kotei', 'Boadi', 'East Legon'], verification: 'Verified', responseRate: 92, freshnessScore: 88, joined: 'Jan 2025', documents: ['Ghana Card', 'Business registration', 'Proof of address'] },
    { id: 'agt-2', name: 'Kojo Asare', business: 'Kojo Rooms', email: 'hello@kojorooms.com', phone: '+233 55 231 9094', whatsapp: '+233 55 231 9094', bio: 'Room finder working around KNUST and UCC.', areas: ['Kotei', 'Amamoma'], verification: 'Pending', responseRate: 81, freshnessScore: 74, joined: 'Mar 2026', documents: ['Ghana Card', 'Proof of address'] },
    { id: 'agt-3', name: 'Nana Osei', business: 'Nana Lets', email: 'nana@lets.gh', phone: '+233 20 664 2281', whatsapp: '+233 20 664 2281', bio: 'Independent accommodation agent in Kumasi.', areas: ['Bomso', 'Ayigya'], verification: 'Unsubmitted', responseRate: 67, freshnessScore: 43, joined: 'Jun 2026', documents: [] },
    { id: 'agt-4', name: 'Adwoa Frimpong', business: 'HallLink Ghana', email: 'adwoa@halllink.gh', phone: '+233 27 114 3390', whatsapp: '+233 27 114 3390', bio: 'Verified hostel sourcing around Legon.', areas: ['Legon', 'Madina'], verification: 'Rejected', responseRate: 76, freshnessScore: 70, joined: 'May 2026', documents: ['Ghana Card'] },
  ],
  reports: [
    { id: 'rep-1', listingId: 'lst-3', listing: 'Chamber and hall', reason: 'Wrong price', details: 'Agent quoted GHS 8,000 after the listing showed GHS 6,900.', severity: 'High', status: 'Open', reporter: 'K. Adu', createdAt: 'Aug 4, 2026' },
    { id: 'rep-2', listingId: 'lst-6', listing: 'Three-in-a-room at Boadi', reason: 'Stale availability', details: 'Caretaker says all rooms were taken last month.', severity: 'Medium', status: 'Reviewing', reporter: 'Anonymous', createdAt: 'Aug 2, 2026' },
  ],
  locations: [
    { id: 'loc-1', campus: 'KNUST', abbreviation: 'KNUST', city: 'Kumasi', area: 'Ayeduase', region: 'Ashanti', active: true },
    { id: 'loc-2', campus: 'KNUST', abbreviation: 'KNUST', city: 'Kumasi', area: 'Kotei', region: 'Ashanti', active: true },
    { id: 'loc-3', campus: 'KNUST', abbreviation: 'KNUST', city: 'Kumasi', area: 'Bomso', region: 'Ashanti', active: true },
    { id: 'loc-4', campus: 'University of Ghana', abbreviation: 'UG', city: 'Accra', area: 'East Legon', region: 'Greater Accra', active: true },
    { id: 'loc-5', campus: 'University of Cape Coast', abbreviation: 'UCC', city: 'Cape Coast', area: 'Amamoma', region: 'Central', active: true },
  ],
  users: [
    { id: 'usr-1', name: 'Esi Boateng', email: 'esi@knust.edu.gh', role: 'Student', verified: true, status: 'Active', lastActive: 'Today, 09:34' },
    { id: 'usr-2', name: 'Ama Mensah', email: 'ama@campuskey.com', role: 'Agent', verified: true, status: 'Active', lastActive: 'Today, 08:51' },
    { id: 'usr-3', name: 'Kojo Asare', email: 'hello@kojorooms.com', role: 'Agent', verified: true, status: 'Active', lastActive: 'Yesterday' },
    { id: 'usr-4', name: 'Yaw Addai', email: 'yaw@ug.edu.gh', role: 'Student', verified: false, status: 'Active', lastActive: 'Jul 28, 2026' },
    { id: 'usr-5', name: 'Nana Osei', email: 'nana@lets.gh', role: 'Agent', verified: true, status: 'Suspended', lastActive: 'Aug 1, 2026' },
  ],
  notifications: [
    { id: 'n-1', title: 'Viewing scheduled', body: 'Ama scheduled a viewing for Affordable shared room.', time: '12 min', read: false, tone: 'info', audience: 'student' },
    { id: 'n-2', title: 'Listing refreshed', body: 'Sunlit single room was confirmed available today.', time: '1 hr', read: false, tone: 'success', audience: 'student' },
    { id: 'n-3', title: 'New inquiry', body: 'Akua asked about Sunlit single room.', time: '18 min', read: false, tone: 'warning', audience: 'agent' },
    { id: 'n-4', title: 'Availability due', body: 'Three listings need a freshness check.', time: '2 hrs', read: false, tone: 'danger', audience: 'agent' },
    { id: 'n-5', title: 'High priority report', body: 'A pricing report needs moderation.', time: '36 min', read: false, tone: 'danger', audience: 'admin' },
  ],
  profile: { name: 'Esi Boateng', email: 'esi@knust.edu.gh', phone: '+233 24 555 0182', whatsapp: '+233 24 555 0182', campus: 'KNUST' },
  preferences: { inquiryUpdates: true, savedChanges: true, emailDigest: false, staleReminders: true },
}

const STORAGE_KEY = 'agentms-mvp-db-v2'

export function loadDatabase(): Database {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? { ...structuredClone(seed), ...JSON.parse(stored) } : structuredClone(seed)
  } catch {
    return structuredClone(seed)
  }
}

export function persistDatabase(database: Database) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(database))
}

export function resetDatabase() {
  localStorage.removeItem(STORAGE_KEY)
  return structuredClone(seed)
}

export const mockApi = {
  async request<T>(operation: () => T): Promise<T> {
    await new Promise((resolve) => window.setTimeout(resolve, 240))
    return operation()
  },
}
