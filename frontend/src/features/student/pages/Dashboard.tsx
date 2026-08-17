import { Bookmark } from 'lucide-react'
import type { AppProps } from '../../../app/types'
import { ListingGrid } from '../../../components/listings/ListingGrid'
import { EmptyState, Metric } from '../../../components/shared/Primitives'
import { StudentActionStrip } from '../components/StudentActionStrip'
import '../StudentPages.css'

export function StudentDashboard(props: AppProps) {
  const studentName = props.db.profile.name
  const firstName = studentName.split(' ')[0] || 'there'
  const active = props.db.inquiries.filter((i) => !i.status.startsWith('Closed') && (!studentName || i.student === studentName))
  const saved = props.db.listings.filter((l) => l.saved)
  const campusMatches = props.db.listings.filter((l) => l.status === 'Published' && l.moderation === 'Approved' && l.campus === props.db.profile.campus)
  const freshMatches = campusMatches.filter((l) => l.freshness === 'Confirmed today' || l.freshness === 'Confirmed this week').length

  return (
    <div className="page student-page">
      <div className="dashboard-greeting"><div><h1>Good morning, {firstName}.</h1></div></div>
      <StudentActionStrip savedCount={saved.length} activeInquiryCount={active.length} navigate={props.navigate} />
      <div className="metric-grid">
        <Metric label="Active inquiries" value={String(active.length)} detail="" tone="info" />
        <Metric label="Saved rooms" value={String(saved.length)} detail="" />
        <Metric label="Fresh matches" value={String(freshMatches)} detail="" tone="success" />
      </div>
      {saved.length ? (
        <ListingGrid listings={saved.slice(0, 3)} {...props} />
      ) : (
        <EmptyState icon={<Bookmark />} title="No saved rooms" body="Save rooms while browsing to compare them here." action="Browse rooms" onAction={() => props.navigate('/listings')} />
      )}
    </div>
  )
}
