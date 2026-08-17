import { Check, FileCheck2, ShieldCheck, Upload } from 'lucide-react'
import type { AppProps } from '../../../app/types'
import { Badge, EmptyState, FormSection } from '../../../components/shared/Primitives'
import '../AgentPages.css'

export function AgentVerification(props: AppProps) {
  const agent = props.db.agents[0]
  if (!agent) return <EmptyState icon={<ShieldCheck />} title="No verification record loaded" body="The backend did not return an agent profile for this account." />

  return (
    <div className="page narrow-page">
      <div className="verification-status"><div className="verification-icon"><ShieldCheck /></div><div><Badge tone={agent.verification === 'Verified' ? 'success' : 'warning'}>{agent.verification}</Badge><h2>{agent.verification === 'Verified' ? 'Your identity is verified' : 'Your submission is under review'}</h2><p>{agent.verification === 'Verified' ? 'Your public profile and listings display the verified agent badge.' : 'Most submissions are reviewed within two business days.'}</p></div></div>
      <div className="verification-steps">{['Identity details', 'Contact information', 'Operating areas', 'Evidence upload', 'Platform review'].map((s, i) => <div className={i < 4 ? 'complete' : 'current'} key={s}><span>{i < 4 ? <Check size={16} /> : i + 1}</span><div><strong>{s}</strong><small>{i < 4 ? 'Complete' : agent.verification}</small></div></div>)}</div>
      <FormSection title="Submitted evidence" description="Documents are visible only to authorized reviewers."><div className="document-list">{agent.documents.map((doc) => <div key={doc}><FileCheck2 /><span><strong>{doc}</strong><small>Uploaded · PDF</small></span><Badge tone="success">Received</Badge></div>)}</div><button className="btn secondary"><Upload size={16} />Add another document</button></FormSection>
    </div>
  )
}
