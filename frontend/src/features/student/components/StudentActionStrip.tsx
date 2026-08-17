import { Bookmark, MessageSquareText, Search, UserRound } from 'lucide-react'

type StudentActionStripProps = {
  savedCount: number
  activeInquiryCount: number
  navigate: (path: string) => void
}

export function StudentActionStrip({ savedCount, activeInquiryCount, navigate }: StudentActionStripProps) {
  return (
    <div className="student-action-strip">
      <button className="has-tip tip-top" data-tip="Browse rooms" aria-label="Browse rooms" onClick={() => navigate('/listings')}>
        <Search size={18} /><span>Browse</span>
      </button>
      <button className="has-tip tip-top" data-tip="Saved rooms" aria-label="Saved rooms" onClick={() => navigate('/student/saved')}>
        <Bookmark size={18} /><span>{savedCount}</span>
      </button>
      <button className="has-tip tip-top" data-tip="Inquiries" aria-label="Inquiries" onClick={() => navigate('/student/inquiries')}>
        <MessageSquareText size={18} /><span>{activeInquiryCount}</span>
      </button>
      <button className="has-tip tip-top" data-tip="Profile preferences" aria-label="Profile preferences" onClick={() => navigate('/student/profile')}>
        <UserRound size={18} /><span>Profile</span>
      </button>
    </div>
  )
}
