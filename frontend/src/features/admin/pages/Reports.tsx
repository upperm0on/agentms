import { useState } from 'react'
import { ChevronRight, Flag } from 'lucide-react'
import type { Report } from '../../../api/mockApi'
import type { AppProps } from '../../../app/types'
import { Badge, DetailSection, Drawer, Field, PageHeader } from '../../../components/shared/Primitives'
import '../AdminPages.css'

export function AdminReports(props: AppProps) {
  const [selected, setSelected] = useState<Report | null>(null)
  const resolve = (status: Report['status']) => selected && props.mutate(`Report ${status.toLowerCase()}`, (draft) => { const item = draft.reports.find((r) => r.id === selected.id); if (item) item.status = status })
  return <div className="page"><PageHeader eyebrow="Trust & safety" title="Reported listings" description="Triage inaccurate, fake, duplicate, or harmful listing content." /><div className="report-queue">{props.db.reports.map((r) => <button className="report-row" key={r.id} onClick={() => setSelected(r)}><span className={`severity ${r.severity.toLowerCase()}`}>{r.severity}</span><div><strong>{r.reason}</strong><p>{r.listing}</p></div><Badge tone={r.status === 'Open' ? 'danger' : r.status === 'Reviewing' ? 'warning' : 'success'}>{r.status}</Badge><span>{r.createdAt}</span><ChevronRight /></button>)}</div>{selected && <Drawer title="Report evidence" close={() => setSelected(null)}><div className="report-summary"><Flag /><div><Badge tone={selected.severity === 'High' ? 'danger' : 'warning'}>{selected.severity} severity</Badge><h2>{selected.reason}</h2><p>{selected.listing}</p></div></div><DetailSection title="Reporter details"><p>{selected.details}</p><small>Reported by {selected.reporter} on {selected.createdAt}</small></DetailSection><Field label="Resolution notes"><textarea rows={5} placeholder="Record what was checked and why" /></Field><div className="drawer-actions"><button className="btn secondary" onClick={() => resolve('Dismissed')}>Dismiss</button><button className="btn primary" onClick={() => resolve('Resolved')}>Resolve report</button></div></Drawer>}</div>
}
