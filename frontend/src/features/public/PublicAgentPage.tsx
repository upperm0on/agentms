import { ArrowLeft, MapPin, Phone, ShieldCheck, UserRound } from 'lucide-react'
import type { AppProps } from '../../app/types'
import { initials } from '../../lib/uiHelpers'
import { Badge, DetailSection, EmptyState, Metric, SectionHeading } from '../../components/shared/Primitives'
import { ListingGrid } from '../../components/listings/ListingGrid'
import './PublicPages.css'

export function PublicAgentPage(props: AppProps & { id: string }) {
  const agent = props.db.agents.find((a) => a.id === props.id)
  if (!agent) return <EmptyState icon={<UserRound />} title="Agent not found" body="This public profile is unavailable." action="Browse listings" onAction={() => props.navigate('/listings')} />
  const agentListings = props.db.listings.filter((l) => l.agentId === agent.id && l.status === 'Published')
  return <div className="content-section agent-public"><button className="back-button" onClick={() => props.navigate('/listings')}><ArrowLeft size={17} />Back to rooms</button><div className="profile-hero"><div className="profile-avatar">{initials(agent.name)}</div><div><Badge tone={agent.verification === 'Verified' ? 'success' : 'warning'}><ShieldCheck size={13} />{agent.verification}</Badge><h1>{agent.name}</h1><p>{agent.business}</p><span><MapPin size={15} />{agent.areas.join(', ')}</span></div><a className="btn primary" href={`tel:${agent.phone}`}><Phone size={17} />Call agent</a></div><div className="metric-grid"><Metric label="Response rate" value={`${agent.responseRate}%`} detail="Past 90 days" /><Metric label="Freshness score" value={`${agent.freshnessScore}%`} detail="Current listings" /><Metric label="Active rooms" value={String(agentListings.length)} detail="Published now" /></div><DetailSection title="About"><p>{agent.bio}</p></DetailSection><SectionHeading eyebrow="Current inventory" title={`Rooms from ${agent.business}`} description={`${agentListings.length} active listings`} /><ListingGrid listings={agentListings} {...props} /></div>
}
