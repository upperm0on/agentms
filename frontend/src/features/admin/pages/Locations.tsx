import { Archive, Pencil, Plus, RefreshCw } from 'lucide-react'
import type { AppProps } from '../../../app/types'
import { Badge, PageHeader } from '../../../components/shared/Primitives'
import '../AdminPages.css'

export function AdminLocations(props: AppProps) {
  return (
    <div className="page">
      <PageHeader eyebrow="Reference data" title="Campuses & areas" description="Clean location data keeps discovery filters useful." action={<button className="btn primary" onClick={() => props.setModal({ type: 'location' })}><Plus size={17} />Add location</button>} />
      <div className="data-table-wrap">
        <table className="data-table">
          <thead><tr><th>Campus</th><th>Area</th><th>City</th><th>Region</th><th>Status</th><th></th></tr></thead>
          <tbody>{props.db.locations.map((location) => <tr key={location.id}>
            <td><strong>{location.campus}</strong><br /><small>{location.abbreviation}</small></td>
            <td>{location.area}</td><td>{location.city}</td><td>{location.region}</td>
            <td><Badge tone={location.active ? 'success' : 'neutral'}>{location.active ? 'Active' : 'Archived'}</Badge></td>
            <td><div className="row-actions">
              <button className="icon-btn" title="Edit location" aria-label="Edit location" onClick={() => props.setModal({ type: 'location', locationId: location.id })}><Pencil /></button>
              <button className="icon-btn" title={location.active ? 'Archive location' : 'Restore location'} aria-label={location.active ? 'Archive location' : 'Restore location'} disabled={props.busy} onClick={() => props.mutate(location.active ? 'Location archived' : 'Location restored', (draft) => { const item = draft.locations.find((candidate) => candidate.id === location.id); if (item) item.active = !item.active })}>{location.active ? <Archive /> : <RefreshCw />}</button>
            </div></td>
          </tr>)}</tbody>
        </table>
      </div>
    </div>
  )
}
