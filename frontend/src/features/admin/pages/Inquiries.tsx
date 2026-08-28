import { useMemo, useState } from 'react'
import { MessageSquareText, Search } from 'lucide-react'
import type { Inquiry } from '../../../api/mockApi'
import type { AppProps } from '../../../app/types'
import { Badge, DetailSection, Drawer, PageHeader, Review } from '../../../components/shared/Primitives'
import '../AdminPages.css'

export function AdminInquiries(props: AppProps) {
  const [selected, setSelected] = useState<Inquiry | null>(null)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const inquiries = useMemo(() => {
    const term = query.trim().toLowerCase()
    return props.db.inquiries.filter((inquiry) => {
      const matchesQuery = !term || `${inquiry.listing} ${inquiry.student} ${inquiry.studentEmail} ${inquiry.agent}`.toLowerCase().includes(term)
      return matchesQuery && (statusFilter === 'All' || inquiry.status === statusFilter)
    })
  }, [props.db.inquiries, query, statusFilter])

  return (
    <div className="page">
      <PageHeader eyebrow="Service oversight" title="Listing inquiries" description="Inspect the student-to-agent follow-up flow without impersonating either account." />
      <div className="toolbar">
        <div className="input-with-icon"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search student, listing, or agent" /></div>
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option>All</option><option>New</option><option>Contacted</option><option>Viewing Scheduled</option><option>Negotiating</option><option>Closed Won</option><option>Closed Lost</option></select>
        <span className="result-count">{inquiries.length} inquiries</span>
      </div>
      <div className="data-table-wrap"><table className="data-table"><thead><tr><th>Listing</th><th>Student</th><th>Agent</th><th>Contact</th><th>Status</th><th></th></tr></thead><tbody>{inquiries.map((inquiry) => <tr key={inquiry.id}><td><strong>{inquiry.listing}</strong><br /><small>{inquiry.createdAt}</small></td><td>{inquiry.student}<br /><small>{inquiry.studentEmail}</small></td><td>{inquiry.agent}</td><td>{inquiry.contactMethod}</td><td><Badge tone={inquiry.status === 'Closed Won' ? 'success' : inquiry.status === 'Closed Lost' ? 'danger' : inquiry.status === 'New' ? 'warning' : 'info'}>{inquiry.status}</Badge></td><td><button className="btn secondary small" onClick={() => setSelected(inquiry)}>Inspect</button></td></tr>)}</tbody></table></div>
      {selected && <Drawer title="Inquiry details" close={() => setSelected(null)}>
        <div className="report-summary"><MessageSquareText /><div><Badge tone="info">{selected.status}</Badge><h2>{selected.listing}</h2><p>{selected.student} to {selected.agent}</p></div></div>
        <DetailSection title="Student message"><p>{selected.message}</p></DetailSection>
        <div className="review-list"><Review label="Student email" value={selected.studentEmail} /><Review label="Student phone" value={selected.studentPhone} /><Review label="Preferred contact" value={selected.contactMethod} /><Review label="Last updated" value={selected.updatedAt} /></div>
      </Drawer>}
    </div>
  )
}
