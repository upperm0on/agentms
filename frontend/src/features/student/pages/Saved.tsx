import { useState } from 'react'
import { Bookmark, CheckCircle2, Clock3, Plus } from 'lucide-react'
import type { AppProps } from '../../../app/types'
import { ListingGrid } from '../../../components/listings/ListingGrid'
import { EmptyState, PageHeader } from '../../../components/shared/Primitives'
import '../StudentPages.css'

export function StudentSaved(props: AppProps) {
  const [filter, setFilter] = useState('All')
  const saved = props.db.listings.filter((l) => l.saved && (filter === 'All' || l.availability === filter))

  return (
    <div className="page">
      <PageHeader eyebrow="Student workspace" title="Saved rooms" description="Compare prices, availability, and how recently each room was checked." action={<button className="btn primary" onClick={() => props.navigate('/listings')}><Plus size={17} />Find rooms</button>} />
      <div className="toolbar">
        <div className="segmented icon-segmented">
          <button className={filter === 'All' ? 'active' : ''} onClick={() => setFilter('All')}><Bookmark size={15} />All</button>
          <button className={filter === 'Available' ? 'active' : ''} onClick={() => setFilter('Available')}><CheckCircle2 size={15} />Available</button>
          <button className={filter === 'Limited' ? 'active' : ''} onClick={() => setFilter('Limited')}><Clock3 size={15} />Limited</button>
        </div>
        <span className="result-count">{saved.length} saved rooms</span>
      </div>
      {saved.length ? (
        <ListingGrid listings={saved} {...props} />
      ) : (
        <EmptyState icon={<Bookmark />} title="Nothing saved here" body="Save rooms while browsing to compare them later." action="Browse rooms" onAction={() => props.navigate('/listings')} />
      )}
    </div>
  )
}
