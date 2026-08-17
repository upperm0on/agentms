import { Building2, Globe2, MousePointerClick, Plus } from 'lucide-react'
import type { Listing } from '../../../api/mockApi'
import type { AppProps } from '../../../app/types'
import { PageHeader } from '../../../components/shared/Primitives'
import { currentDateLabel, money } from '../../../lib/uiHelpers'
import { ListingAvailabilityActions } from '../components/ListingAvailabilityActions'
import '../AgentPages.css'

export function AgentListings(props: AppProps) {
  const currentAgent = props.db.agents[0]
  const owned = props.db.listings.filter((l) => !currentAgent || l.agentId === currentAgent.id)
  function archive(listing: Listing) { props.setModal({ type: 'confirm', title: `Archive ${listing.title}?`, body: 'Students will no longer find this listing. You can keep its record for later reference.', danger: true, action: () => props.mutate('Listing archived', (draft) => { const item = draft.listings.find((l) => l.id === listing.id); if (item) item.status = 'Archived' }) }) }
  function confirmAvailability(listing: Listing) { props.mutate('Availability confirmed', (draft) => { const item = draft.listings.find((x) => x.id === listing.id); if (item) { item.freshness = 'Confirmed today'; item.updatedAt = currentDateLabel() } }) }
  function toggleAvailability(listing: Listing) {
    const makeAvailable = listing.availability === 'Unavailable'
    props.mutate(makeAvailable ? 'Room made available' : 'Room hidden from browsing', (draft) => {
      const item = draft.listings.find((l) => l.id === listing.id)
      if (item) {
        item.availability = makeAvailable ? 'Available' : 'Unavailable'
        item.slots = makeAvailable ? Math.max(1, item.slots || item.capacity || 1) : 0
        item.freshness = 'Confirmed today'
        item.updatedAt = currentDateLabel()
      }
    })
  }

  return <div className="page"><PageHeader eyebrow="" title="Listings" description="Manage rooms you own and keep availability trustworthy." action={<button className="btn primary" onClick={() => props.navigate('/agent/listings/new')}><Plus size={17} />New listing</button>} /><div className="data-table-wrap"><table className="data-table agent-listings-table"><thead><tr><th>Listing</th><th>Performance</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>{owned.map((l) => <tr key={l.id}><td><div className="table-identity">{l.image ? <img src={l.image} alt="" /> : <span className="image-placeholder"><Building2 /></span>}<span><strong>{l.title}</strong><small>{l.area} · {money.format(l.price)}</small></span></div></td><td><div className="performance-metrics"><span title="Views"><Globe2 size={15} />{l.views}</span><span title="Contact taps"><MousePointerClick size={15} />{l.inquiries}</span></div></td><td><ListingAvailabilityActions listing={l} archive={archive} confirmAvailability={confirmAvailability} toggleAvailability={toggleAvailability} navigate={props.navigate} /></td></tr>)}</tbody></table></div></div>
}
