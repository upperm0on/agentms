import { Eye, EyeOff, Pencil } from 'lucide-react'
import type { AppProps } from '../../../app/types'
import { Metric, Queue, SectionHeading } from '../../../components/shared/Primitives'
import '../AgentPages.css'

export function AgentDashboard(props: AppProps) {
  const currentAgent = props.db.agents[0]
  const owned = props.db.listings.filter((l) => !currentAgent || l.agentId === currentAgent.id)
  const publicRooms = owned.filter((l) => l.status === 'Published' && l.availability !== 'Unavailable')
  const availableRooms = publicRooms.filter((l) => l.availability === 'Available' || l.availability === 'Limited')
  const hiddenRooms = owned.filter((l) => l.availability === 'Unavailable' || l.status === 'Archived' || l.status === 'Unpublished')
  const drafts = owned.filter((l) => l.status === 'Draft')
  const mostEngaged = owned.slice().sort((a, b) => (b.views + b.inquiries * 12) - (a.views + a.inquiries * 12)).slice(0, 6)

  return (
    <div className="page agent-overview">
      <div className="metric-grid four">
        <Metric label="Public rooms" value={String(publicRooms.length)} detail={`Across ${new Set(publicRooms.map((l) => l.area)).size} areas`} />
        <Metric label="Available now" value={String(availableRooms.length)} detail={`${hiddenRooms.length} hidden`} tone="success" />
        <Metric label="Drafts" value={String(drafts.length)} detail="Not public yet" tone="warning" />
        <Metric label="Response rate" value={`${currentAgent?.responseRate ?? 0}%`} detail="Profile trust signal" tone="success" />
      </div>
      <div className="ops-grid agent-panels">
        <section className="surface quick-access-panel">
          <SectionHeading title="Quick access" description="" />
          <div className="queue-list">
            <Queue icon={<Eye />} title="Visible rooms" value={`${publicRooms.length} rooms`} detail="Published and browseable" tone="success" onClick={() => props.navigate('/agent/listings')} />
            <Queue icon={<EyeOff />} title="Hidden rooms" value={`${hiddenRooms.length} rooms`} detail="Unavailable, unpublished, or archived" tone="warning" onClick={() => props.navigate('/agent/listings')} />
            <Queue icon={<Pencil />} title="Draft rooms" value={`${drafts.length} drafts`} detail="Finish before publishing" tone="info" onClick={() => props.navigate('/agent/listings')} />
          </div>
        </section>
        <section className="surface engagement-panel">
          <SectionHeading title="Engagement" description="" />
          <div className="performance-bars">
            {mostEngaged.map((l) => (
              <button key={l.id} onClick={() => props.navigate(`/listings/${l.id}`)}>
                <span>{l.title}</span><div><i style={{ width: `${Math.min(100, (l.views + l.inquiries * 12) / 5)}%` }} /></div><strong>{l.views} views</strong>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
