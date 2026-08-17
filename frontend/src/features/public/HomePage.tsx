import { useMemo, useState } from 'react'
import { Building2, ChevronRight, Clock3, Flag, MapPin, Search, ShieldCheck } from 'lucide-react'
import type { Listing } from '../../api/mockApi'
import type { AppProps } from '../../app/types'
import { money } from '../../lib/uiHelpers'
import { Badge, SectionHeading } from '../../components/shared/Primitives'
import { ListingGrid } from '../../components/listings/ListingGrid'
import './PublicPages.css'

function freshnessRank(value: Listing['freshness']) { return ['Confirmed today', 'Confirmed this week', 'Needs refresh', 'Stale'].indexOf(value) }
function calculatePopularPlaces(listings: Listing[]) {
  const places = listings
    .filter((listing) => listing.availability === 'Available' || listing.availability === 'Limited')
    .reduce<Record<string, { area: string; spaces: number; listings: number }>>((totals, listing) => {
      const spaces = listing.slots > 0 ? listing.slots : listing.capacity
      const current = totals[listing.area] ?? { area: listing.area, spaces: 0, listings: 0 }
      current.spaces += spaces
      current.listings += 1
      totals[listing.area] = current
      return totals
    }, {})
  return Object.values(places)
    .filter((place) => place.spaces > 0)
    .sort((a, b) => b.spaces - a.spaces || b.listings - a.listings || a.area.localeCompare(b.area))
    .slice(0, 3)
}

export function HomePage(props: AppProps) {
  const [query, setQuery] = useState('')
  const publicListings = props.db.listings.filter((l) => l.status === 'Published' && l.moderation === 'Approved')
  const fresh = publicListings
    .filter((l) => l.availability !== 'Full' && l.availability !== 'Unavailable')
    .slice()
    .sort((a, b) => freshnessRank(a.freshness) - freshnessRank(b.freshness))
    .slice(0, 3)
  const popularPlaces = useMemo(() => calculatePopularPlaces(publicListings), [publicListings])
  const featured = fresh[0] ?? publicListings[0]
  const searchPlaceholder = props.db.locations.length ? `Search ${props.db.locations.slice(0, 3).map((location) => location.area || location.campus).join(', ')}...` : 'Search campus, area, or property...'
  return (
    <>
      <section className="home-hero">
        <div className="hero-copy"><h1>Know what is available before you make the trip.</h1><p>Search student rooms around Ghana's campuses, see when availability was last confirmed, and speak directly with a trusted agent.</p>
          <form className="hero-search" onSubmit={(e) => { e.preventDefault(); props.navigate(`/listings${query ? `?q=${encodeURIComponent(query)}` : ''}`) }}><MapPin size={20} /><input aria-label="Campus or area" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={searchPlaceholder} /><button className="btn primary" type="submit"><Search size={18} />Find a room</button></form>
          {popularPlaces.length > 0 && <div className="popular"><span>Popular:</span>{popularPlaces.map((place) => <button key={place.area} onClick={() => props.navigate(`/listings?q=${encodeURIComponent(place.area)}`)}>{place.area}</button>)}</div>}
        </div>
        <div className="hero-property">{featured?.image ? <img src={featured.image} alt={featured.title} loading="eager" decoding="async" fetchPriority="high" /> : <div className="image-placeholder"><Building2 /></div>}<div className="hero-property-label"><div><Badge tone="success">{featured?.freshness ?? 'Backend data'}</Badge><strong>{featured ? `${featured.area} · ${featured.campus}` : 'Backend listings'}</strong><span>{featured ? `From ${money.format(featured.price)} / ${featured.period}` : 'No listings loaded yet'}</span></div><button className="icon-btn light" onClick={() => props.navigate('/listings')} aria-label="Browse rooms"><ChevronRight /></button></div></div>
      </section>
      <section className="content-section"><SectionHeading eyebrow="" title="Available hostels near campus" description="A short preview of current hostel listings from the backend." action={<button className="text-button" onClick={() => props.navigate('/listings')}>View all rooms <ChevronRight size={16} /></button>} /><ListingGrid listings={fresh} {...props} /></section>
      <section className="trust-band"><div><ShieldCheck /><strong>Verified identity</strong><span>Know who you are dealing with.</span></div><div><Clock3 /><strong>Freshness first</strong><span>Every listing shows its last check.</span></div><div><Flag /><strong>Accountable listings</strong><span>Report details that do not match.</span></div></section>
    </>
  )
}
