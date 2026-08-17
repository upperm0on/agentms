import type { ReactNode } from 'react'
import type { Database, Listing, Role } from '../api/mockApi'

export type ModalState =
  | { type: 'inquiry'; listing: Listing }
  | { type: 'report'; listing: Listing }
  | { type: 'location'; locationId?: string }
  | { type: 'confirm'; title: string; body: string; action: () => void; danger?: boolean }
  | null

export type AppPageProps = {
  db: Database
  path: string
  navigate: (path: string) => void
  mutate: (message: string, update: (draft: Database) => void) => Promise<void>
  setModal: (modal: ModalState) => void
  busy: boolean
}

export type NavigationProps = {
  path: string
  navigate: (path: string) => void
}

export type IconContentProps = { children: ReactNode }
export type WorkspaceRole = Exclude<Role, 'public'>
