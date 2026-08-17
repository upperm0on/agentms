import { Archive, Pencil, Plus, RefreshCw } from 'lucide-react'
import type { AppProps } from '../../../app/types'
import { Badge, PageHeader } from '../../../components/shared/Primitives'
import '../AdminPages.css'

export function AdminLocations(props: AppProps) {
  return <div className="page"><PageHeader eyebrow="Reference data" title="Campuses & areas" description="Clean location data keeps discovery filters useful." action={<button className="btn primary" onClick={() => props.setModal({ type: 'location' })}><Plus size={17} />Add location</button>} /><div className="data-table-wrap"><table className="data-table"><thead><tr><th>Campus</th><th>Area</th><th>City</th><th>Region</th><th>Status</th><th></th></tr></thead><tbody>{props.db.locations.map((l) => <tr key={l.id}><td><strong>{l.campus}</strong><br /><small>{l.abbreviation}</small></td><td>{l.area}</td><td>{l.city}</td><td>{l.region}</td><td><Badge tone={l.active ? 'success' : 'neutral'}>{l.active ? 'Active' : 'Archived'}</Badge></td><td><div className="row-actions"><button className="icon-btn" onClick={() => props.setModal({ type: 'location', locationId: l.id })}><Pencil /></button><button className="icon-btn" onClick={() => props.mutate(l.active ? 'Location archived' : 'Location restored', (draft) => { const item = draft.locations.find((x) => x.id === l.id); if (item) item.active = !item.active })}>{l.active ? <Archive /> : <RefreshCw />}</button></div></td></tr>)}</tbody></table></div></div>
}
