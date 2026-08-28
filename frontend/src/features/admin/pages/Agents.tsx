import { useState } from 'react'
import type { AppProps } from '../../../app/types'
import { Badge, PageHeader } from '../../../components/shared/Primitives'
import { initials, verificationTone } from '../../../lib/uiHelpers'
import '../AdminPages.css'

export function AdminAgents(props: AppProps) {
  const [filter, setFilter] = useState('All')
  const agents = props.db.agents.filter((a) => filter === 'All' || a.verification === filter)
  return <div className="page"><PageHeader eyebrow="Trust operations" title="Agent verification" description="Review identity, operating areas, and platform history before deciding." /><div className="toolbar"><div className="segmented">{['All', 'Unsubmitted', 'Pending', 'Verified', 'Rejected', 'Suspended'].map((status) => <button key={status} className={filter === status ? 'active' : ''} onClick={() => setFilter(status)}>{status}</button>)}</div><span className="result-count">{agents.length} agents</span></div><div className="data-table-wrap"><table className="data-table"><thead><tr><th>Agent</th><th>Verification</th><th>Operating areas</th><th>Listings</th><th>Trust signal</th><th></th></tr></thead><tbody>{agents.map((a) => <tr key={a.id}><td><div className="person-cell"><span className="avatar-sm">{initials(a.name)}</span><span><strong>{a.name}</strong><small>{a.business}</small></span></div></td><td><Badge tone={verificationTone(a.verification)}>{a.verification}</Badge></td><td>{a.areas.slice(0, 2).join(', ') || 'No areas set'}</td><td>{props.db.listings.filter((l) => l.agentId === a.id).length}</td><td>{a.freshnessScore}% freshness</td><td><button className="btn secondary small" onClick={() => props.navigate(`/admin/agents/${a.id}`)}>Review</button></td></tr>)}</tbody></table></div></div>
}
