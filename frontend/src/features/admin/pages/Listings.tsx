import { useMemo, useState } from 'react'
import { Building2, Check, EyeOff, Search, Trash2 } from 'lucide-react'
import type { Listing } from '../../../api/mockApi'
import type { AppProps } from '../../../app/types'
import { Badge, Drawer, Field, PageHeader, Review } from '../../../components/shared/Primitives'
import { money } from '../../../lib/uiHelpers'
import '../AdminPages.css'

export function AdminListings(props: AppProps) {
  const [selected, setSelected] = useState<Listing | null>(null)
  const [query, setQuery] = useState('')
  const [moderationFilter, setModerationFilter] = useState('All')
  const [notes, setNotes] = useState('')
  const listings = useMemo(() => {
    const term = query.trim().toLowerCase()
    return props.db.listings.filter((listing) => {
      const matchesQuery = !term || `${listing.title} ${listing.agentName} ${listing.campus} ${listing.area}`.toLowerCase().includes(term)
      const matchesModeration = moderationFilter === 'All' || listing.moderation === moderationFilter
      return matchesQuery && matchesModeration
    })
  }, [moderationFilter, props.db.listings, query])

  function inspect(listing: Listing) {
    setSelected(listing)
    setNotes('')
  }

  async function moderate(listing: Listing, moderation: Listing['moderation'], status: Listing['status']) {
    await props.mutate(`Listing marked ${moderation.toLowerCase()}`, (draft) => {
      const item = draft.listings.find((candidate) => candidate.id === listing.id)
      if (item) {
        item.moderation = moderation
        item.status = status
      }
    }, { note: notes.trim() })
    setSelected(null)
  }

  return (
    <div className="page">
      <PageHeader eyebrow="Content quality" title="Listing moderation" description="Inspect freshness, reports, and publish state across all agents." />
      <div className="toolbar">
        <div className="input-with-icon"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search listing or agent" /></div>
        <select value={moderationFilter} onChange={(event) => setModerationFilter(event.target.value)}><option value="All">All moderation</option><option>Pending</option><option>Flagged</option><option>Approved</option><option>Rejected</option></select>
        <span className="result-count">{listings.length} listings</span>
      </div>
      <div className="data-table-wrap"><table className="data-table"><thead><tr><th>Listing</th><th>Agent</th><th>Moderation</th><th>Freshness</th><th>Reports</th><th></th></tr></thead><tbody>{listings.map((listing) => <tr key={listing.id}><td><div className="table-identity">{listing.image ? <img src={listing.image} alt="" /> : <span className="image-placeholder"><Building2 /></span>}<span><strong>{listing.title}</strong><small>{listing.area} · {listing.campus}</small></span></div></td><td>{listing.agentName}</td><td><Badge tone={listing.moderation === 'Approved' ? 'success' : listing.moderation === 'Flagged' || listing.moderation === 'Rejected' ? 'danger' : 'warning'}>{listing.moderation}</Badge></td><td>{listing.freshness}</td><td>{props.db.reports.filter((report) => report.listingId === listing.id).length}</td><td><button className="btn secondary small" onClick={() => inspect(listing)}>Inspect</button></td></tr>)}</tbody></table></div>
      {selected && <Drawer title="Moderate listing" close={() => setSelected(null)}>
        {selected.image ? <img className="drawer-image" src={selected.image} alt={selected.title} /> : <div className="drawer-image image-placeholder"><Building2 /></div>}
        <div><Badge tone={selected.moderation === 'Approved' ? 'success' : selected.moderation === 'Flagged' || selected.moderation === 'Rejected' ? 'danger' : 'warning'}>{selected.moderation}</Badge><h2>{selected.title}</h2><p>{selected.description}</p></div>
        <div className="review-list"><Review label="Agent" value={selected.agentName} /><Review label="Availability" value={`${selected.availability} · ${selected.freshness}`} /><Review label="Price" value={`${money.format(selected.price)} / ${selected.period}`} /></div>
        <Field label="Moderation notes"><textarea rows={4} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Required when hiding or removing a listing" /></Field>
        <div className="drawer-actions three">
          <button className="btn secondary danger-text" disabled={props.busy || !notes.trim()} onClick={() => moderate(selected, 'Rejected', 'Removed')}><Trash2 size={16} />Remove</button>
          <button className="btn secondary" disabled={props.busy || !notes.trim()} onClick={() => moderate(selected, 'Flagged', 'Unpublished')}><EyeOff size={16} />Hide</button>
          <button className="btn primary" disabled={props.busy} onClick={() => moderate(selected, 'Approved', 'Published')}><Check size={16} />Approve</button>
        </div>
      </Drawer>}
    </div>
  )
}
