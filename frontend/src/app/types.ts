import type { ReactNode } from 'react'
import type { Listing, Database, Role } from '../api/mockApi'
import type { ListingFilters } from '../api/backendApi'

export type ModalState =
  | { type: 'inquiry'; listing: Listing }
  | { type: 'report'; listing: Listing }
  | { type: 'location'; locationId?: string }
  | { type: 'confirm'; title: string; body: string; action: () => void; danger?: boolean }
  | null

export type AppProps = {
  db: Database
  path: string
  navigate: (path: string) => void
  mutate: (message: string, update: (draft: Database) => void, options?: { note?: string }) => Promise<void>
  setModal: (modal: ModalState) => void
  busy: boolean
  refreshFromBackend: (role?: Role, filters?: ListingFilters) => Promise<Database | null>
  loadListingPage: (role?: Role, filters?: ListingFilters) => Promise<Database | null>
  loadMoreListings: (role?: Role, filters?: ListingFilters) => Promise<Database | null>
  loadLocations: () => Promise<unknown>
  loginWithPassword: (email: string, password: string) => Promise<void>
  registerWithPassword: (payload: { email: string; password: string; firstName: string; lastName: string; role: 'student' | 'agent' }) => Promise<void>
  loginWithGoogle: (credential: string, role: 'student' | 'agent') => Promise<void>
  listingNextPage: string | null
  listingTotal: number | null
}

export type AppPageProps = AppProps

export type NavigationProps = {
  path: string
  navigate: (path: string) => void
}

export type IconContentProps = { children: ReactNode }
export type WorkspaceRole = Exclude<Role, 'public'>
