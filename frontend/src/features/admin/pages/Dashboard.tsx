import { Clock3, Flag, ListFilter, ShieldCheck } from 'lucide-react'
import type { AppProps } from '../../../app/types'
import { ActivityItem, Metric, PageHeader, Queue, SectionHeading } from '../../../components/shared/Primitives'
import '../AdminPages.css'

export function AdminDashboard(props: AppProps) {
  const pending = props.db.agents.filter((agent) => agent.verification === 'Pending').length
  const stale = props.db.listings.filter((listing) => listing.freshness === 'Stale' || listing.freshness === 'Needs refresh').length
  const open = props.db.reports.filter((report) => report.status === 'Open').length
  const highReports = props.db.reports.filter((report) => report.severity === 'High').length
  const chartValues = [props.db.agents.length * 12, props.db.listings.length * 8, props.db.reports.length * 18, props.db.inquiries.length * 10, pending * 20, open * 24, stale * 18]

  return (
    <div className="page">
      <PageHeader eyebrow="Platform operations" title="Trust & moderation overview" description="Queues are ordered by risk and age so the team can act consistently." action={<button className="btn primary" onClick={() => props.navigate('/admin/agents')}><ListFilter size={17} />Review queue</button>} />
      <div className="metric-grid four">
        <Metric label="Pending agents" value={String(pending)} detail={`${props.db.agents.length} agents loaded`} tone="warning" />
        <Metric label="Open reports" value={String(open)} detail={`${highReports} high severity`} tone="danger" />
        <Metric label="Stale listings" value={String(stale)} detail={`${props.db.listings.length} listings loaded`} tone="warning" />
        <Metric label="Active inquiries" value={String(props.db.inquiries.length)} detail="Loaded from API" tone="info" />
      </div>
      <div className="ops-grid admin-ops">
        <section className="surface">
          <SectionHeading eyebrow="Priority queue" title="Needs a decision" description="Evidence and age determine queue order." />
          <div className="queue-list">
            <Queue icon={<ShieldCheck />} title="Agent verification" value={`${pending} pending`} detail={`${props.db.agents.filter((agent) => agent.verification === 'Verified').length} verified agents`} tone="warning" onClick={() => props.navigate('/admin/agents')} />
            <Queue icon={<Flag />} title="Listing reports" value={`${open} open`} detail={`${props.db.reports.length} total reports`} tone="danger" onClick={() => props.navigate('/admin/reports')} />
            <Queue icon={<Clock3 />} title="Freshness risks" value={`${stale} listings`} detail="Needs availability review" tone="warning" onClick={() => props.navigate('/admin/listings')} />
          </div>
        </section>
        <section className="surface">
          <SectionHeading eyebrow="System signal" title="Trust movement" description="Current backend volume by queue." />
          <div className="chart"><div className="chart-y"><span>80</span><span>40</span><span>0</span></div><div className="chart-bars">{chartValues.map((height, index) => <i key={index} style={{ height: `${Math.min(90, Math.max(10, height))}%` }}><span>{['Ag', 'Li', 'Rp', 'In', 'Pn', 'Op', 'St'][index]}</span></i>)}</div></div>
          <div className="chart-legend"><span><i className="green" />Backend records</span><span><i className="amber" />Open queues</span></div>
        </section>
      </div>
      <section className="surface">
        <SectionHeading eyebrow="Audit trail" title="Recent platform activity" description="Sensitive changes retain an accountable history." />
        <div className="activity-feed">
          {props.db.adminActivity.map((activity) => <ActivityItem key={activity.id} icon={<ShieldCheck />} title={activity.title} meta={activity.meta} />)}
          {!props.db.adminActivity.length && <p className="empty-copy">No administrative changes have been recorded yet.</p>}
        </div>
      </section>
    </div>
  )
}
