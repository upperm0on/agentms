import type { Inquiry } from '../../api/mockApi'
import { initials, statusTone } from '../../lib/uiHelpers'
import { Badge, DetailSection, Review } from '../shared/Primitives'

export function InquiryDetail({ inquiry }: { inquiry: Inquiry }) { return <><div className="inquiry-person"><span className="profile-avatar small-avatar">{initials(inquiry.student)}</span><div><h2>{inquiry.student}</h2><p>{inquiry.studentEmail}<br />{inquiry.studentPhone}</p></div></div><Badge tone={statusTone(inquiry.status)}>{inquiry.status}</Badge><DetailSection title={inquiry.listing}><blockquote>“{inquiry.message}”</blockquote><small>Received {inquiry.createdAt} via {inquiry.contactMethod}</small></DetailSection><div className="review-list"><Review label="Last update" value={inquiry.updatedAt} /><Review label="Preferred contact" value={inquiry.contactMethod} /></div></> }
