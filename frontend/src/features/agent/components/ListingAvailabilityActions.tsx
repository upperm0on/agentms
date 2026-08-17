import { Archive, Eye, EyeOff, Pencil, RefreshCw } from 'lucide-react'
import type { Listing } from '../../../api/mockApi'

type ListingAvailabilityActionsProps = {
  listing: Listing
  archive: (listing: Listing) => void
  confirmAvailability: (listing: Listing) => void
  toggleAvailability: (listing: Listing) => void
  navigate: (path: string) => void
}

export function ListingAvailabilityActions({ listing, archive, confirmAvailability, toggleAvailability, navigate }: ListingAvailabilityActionsProps) {
  return (
    <div className="row-actions">
      <button className={`icon-btn availability-icon ${listing.availability !== 'Unavailable' ? 'active' : ''}`} aria-pressed={listing.availability !== 'Unavailable'} aria-label={listing.availability === 'Unavailable' ? 'Make room available' : 'Hide room from browsing'} title={listing.availability === 'Unavailable' ? 'Make available' : 'Hide from browsing'} onClick={() => toggleAvailability(listing)}>
        {listing.availability === 'Unavailable' ? <EyeOff /> : <Eye />}
      </button>
      <button className="icon-btn" title="Refresh availability" onClick={() => confirmAvailability(listing)}><RefreshCw /></button>
      <button className="icon-btn" title="Edit listing" onClick={() => navigate(`/agent/listings/${listing.id}/edit`)}><Pencil /></button>
      <button className="icon-btn danger-text" title="Archive listing" onClick={() => archive(listing)}><Archive /></button>
    </div>
  )
}
