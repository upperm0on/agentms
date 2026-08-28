import { useMemo, useState } from 'react'
import { ChevronRight, Flag } from 'lucide-react'
import type { Report } from '../../../api/mockApi'
import type { AppProps } from '../../../app/types'
import { Badge, DetailSection, Drawer, Field, PageHeader } from '../../../components/shared/Primitives'
import '../AdminPages.css'

export function AdminReports(props: AppProps) {
  const [selected, setSelected] = useState<Report | null>(null)
  const [filter, setFilter] = useState('Active')
  const [notes, setNotes] = useState('')
  const reports = useMemo(() => props.db.reports.filter((report) => {
    if (filter === 'Active') return report.status === 'Open' || report.status === 'Reviewing'
    return filter === 'All' || report.status === filter
  }), [filter, props.db.reports])

  function inspect(report: Report) {
    setSelected(report)
    setNotes(report.resolutionNotes)
  }

  async function updateStatus(nextStatus: Report['status']) {
    if (!selected) return
    await props.mutate(`Report ${nextStatus.toLowerCase()}`, (draft) => {
      const item = draft.reports.find((report) => report.id === selected.id)
      if (item) {
        item.status = nextStatus
        item.resolutionNotes = notes.trim()
      }
    }, { note: notes.trim() })
    setSelected(null)
  }

  return (
    <div className="page">
      <PageHeader eyebrow="Trust & safety" title="Reported listings" description="Triage inaccurate, fake, duplicate, or harmful listing content." />
      <div className="toolbar"><div className="segmented">{['Active', 'Open', 'Reviewing', 'Resolved', 'Dismissed', 'All'].map((item) => <button key={item} className={filter === item ? 'active' : ''} onClick={() => setFilter(item)}>{item}</button>)}</div><span className="result-count">{reports.length} reports</span></div>
      <div className="report-queue">{reports.map((report) => <button className="report-row" key={report.id} onClick={() => inspect(report)}><span className={`severity ${report.severity.toLowerCase()}`}>{report.severity}</span><div><strong>{report.reason}</strong><p>{report.listing}</p></div><Badge tone={report.status === 'Open' ? 'danger' : report.status === 'Reviewing' ? 'warning' : 'success'}>{report.status}</Badge><span>{report.createdAt}</span><ChevronRight /></button>)}</div>
      {selected && <Drawer title="Report evidence" close={() => setSelected(null)}>
        <div className="report-summary"><Flag /><div><Badge tone={selected.severity === 'High' ? 'danger' : 'warning'}>{selected.severity} severity</Badge><h2>{selected.reason}</h2><p>{selected.listing}</p></div></div>
        <DetailSection title="Reporter details"><p>{selected.details}</p><small>Reported by {selected.reporter} on {selected.createdAt}</small></DetailSection>
        <Field label="Resolution notes"><textarea rows={5} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Record what was checked and why" /></Field>
        <div className="drawer-actions three">
          {selected.status === 'Open' && <button className="btn secondary" disabled={props.busy} onClick={() => updateStatus('Reviewing')}>Start review</button>}
          <button className="btn secondary" disabled={props.busy || !notes.trim()} onClick={() => updateStatus('Dismissed')}>Dismiss</button>
          <button className="btn primary" disabled={props.busy || !notes.trim()} onClick={() => updateStatus('Resolved')}>Resolve report</button>
        </div>
      </Drawer>}
    </div>
  )
}
