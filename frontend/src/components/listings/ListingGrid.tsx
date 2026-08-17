import { useMemo, useState } from 'react'
import { Building2, Heart, MapPin } from 'lucide-react'
import type { Listing } from '../../api/mockApi'
import type { AppProps } from '../../app/types'
import { money, firstByValue } from '../../lib/uiHelpers'
import { SignalTag } from '../shared/Primitives'
import './ListingGrid.css'

export function ListingGrid({ listings, navigate, mutate }: { listings: Listing[] } & AppProps) {
  const [activeHintId, setActiveHintId] = useState<string | null>(null)
  const firstAvailability = useMemo(() => firstByValue(listings, (listing) => listing.availability), [listings])
  const firstFreshness = useMemo(() => firstByValue(listings, (listing) => listing.freshness), [listings])
  const firstVerified = listings.find((listing) => listing.verified)?.id
  return <div className="listing-grid">{listings.map((listing) => <ListingCard key={listing.id} listing={listing} navigate={navigate} mutate={mutate} activeHint={activeHintId === listing.id} showAvailabilityHint={firstAvailability[listing.availability] === listing.id} showFreshnessHint={firstFreshness[listing.freshness] === listing.id} showVerifiedHint={firstVerified === listing.id} activateHint={() => setActiveHintId(listing.id)} clearHint={() => setActiveHintId((current) => current === listing.id ? null : current)} />)}</div>
}

function ListingCard({ listing, navigate, mutate, activeHint, showAvailabilityHint, showFreshnessHint, showVerifiedHint, activateHint, clearHint }: { listing: Listing; navigate: (p: string) => void; mutate: AppProps['mutate']; activeHint: boolean; showAvailabilityHint: boolean; showFreshnessHint: boolean; showVerifiedHint: boolean; activateHint: () => void; clearHint: () => void }) {
  return (
    <article className="listing-card" onMouseEnter={activateHint} onMouseLeave={clearHint} onFocusCapture={activateHint} onBlur={clearHint} onWheel={activateHint} onTouchStart={activateHint}><button className="listing-image" onClick={() => navigate(`/listings/${listing.id}`)}>{listing.image ? <img src={listing.image} alt={listing.title} decoding="async" /> : <span className="image-placeholder"><Building2 /></span>}</button><button className={`save-button ${listing.saved ? 'saved' : ''}`} aria-label={listing.saved ? 'Remove from saved' : 'Save listing'} onClick={() => mutate(listing.saved ? 'Removed from saved rooms' : 'Saved for later', (draft) => { const item = draft.listings.find((l) => l.id === listing.id); if (item) item.saved = !item.saved })}>{listing.saved ? <Heart fill="currentColor" /> : <Heart />}</button><div className="listing-content"><button className="listing-title" onClick={() => navigate(`/listings/${listing.id}`)}><strong>{listing.title}</strong><span>{listing.property}</span></button><div className="location"><MapPin size={15} />{listing.area} · {listing.campus}</div><div className="listing-bottom"><div><strong>{money.format(listing.price)}</strong><span> / {listing.period}</span></div><span>{listing.occupancy}</span></div><div className="listing-signals"><SignalTag kind="availability" value={listing.availability} active={activeHint && showAvailabilityHint} explain={showAvailabilityHint} /><SignalTag kind="freshness" value={listing.freshness} active={activeHint && showFreshnessHint} explain={showFreshnessHint} /><span className="signal-slot">{listing.verified && <SignalTag kind="verified" value="Verified agent" active={activeHint && showVerifiedHint} explain={showVerifiedHint} />}</span></div></div></article>
  )
}
