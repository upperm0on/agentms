import { useState } from 'react'
import { Archive, ChevronRight, Inbox, MessageSquareText, Phone } from 'lucide-react'
import type { Inquiry } from '../../../api/mockApi'
import type { AppProps } from '../../../app/types'
import { InquiryDetail } from '../../../components/inquiries/InquiryDetail'
import { Badge, Drawer, EmptyState, PageHeader } from '../../../components/shared/Primitives'
import { statusTone } from '../../../lib/uiHelpers'
import '../StudentPages.css'

export function StudentInquiries(props: AppProps) {
  const [selected, setSelected] = useState<Inquiry | null>(null)
  const rows = props.db.inquiries.filter((i) => !props.db.profile.name || i.student === props.db.profile.name)
  const activeRows = rows.filter((i) => !i.status.startsWith('Closed'))
  const closedRows = rows.filter((i) => i.status.startsWith('Closed'))

  return (
    <div className="page">
      <PageHeader eyebrow="Student workspace" title="My inquiries" description="See where each conversation stands and what happens next." />
      <div className="tabs icon-tabs">
        <button className="active"><MessageSquareText size={16} />Active <span>{activeRows.length}</span></button>
        <button><Archive size={16} />Closed <span>{closedRows.length}</span></button>
      </div>
      {rows.length ? (
        <div className="record-list">
          {rows.map((i) => (
            <button className="record-row" key={i.id} onClick={() => setSelected(i)}>
              <span className={`record-icon ${statusTone(i.status)}`}><MessageSquareText /></span>
              <div className="record-main"><strong>{i.listing}</strong><span>{i.agent}</span></div>
              <Badge tone={statusTone(i.status)}>{i.status}</Badge>
              <div className="record-date"><strong>{i.updatedAt}</strong><span>Last update</span></div>
              <ChevronRight />
            </button>
          ))}
        </div>
      ) : (
        <EmptyState icon={<Inbox />} title="No inquiries yet" body="Ask an agent about a listing and updates will appear here." action="Browse rooms" onAction={() => props.navigate('/listings')} />
      )}
      {selected && (
        <Drawer title="Inquiry details" close={() => setSelected(null)}>
          <InquiryDetail inquiry={selected} />
          <a href={`tel:${selected.studentPhone}`} className="btn secondary full"><Phone size={17} />Call {selected.agent}</a>
        </Drawer>
      )}
    </div>
  )
}
