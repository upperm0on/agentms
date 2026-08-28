import { useState } from 'react'
import { ArrowLeft, Ban, Check, CircleAlert, Eye, FileCheck2, UserRound, X } from 'lucide-react'
import type { Agent } from '../../../api/mockApi'
import type { AppProps } from '../../../app/types'
import { Badge, EmptyState, Fact, Field, FormSection } from '../../../components/shared/Primitives'
import { initials, verificationTone } from '../../../lib/uiHelpers'
import '../AdminPages.css'

const reviewChecks = ['Identity name matches', 'Contact number confirmed', 'Operating areas plausible', 'Evidence is legible']

export function AdminAgentDetail(props: AppProps & { id: string }) {
  const agent = props.db.agents.find((item) => item.id === props.id)
  const [notes, setNotes] = useState(agent?.verificationNotes ?? '')
  const [checks, setChecks] = useState<Record<string, boolean>>(() => Object.fromEntries(reviewChecks.map((item) => [item, agent?.verification === 'Verified'])))

  if (!agent) return <EmptyState icon={<UserRound />} title="Agent not found" body="This record is unavailable." action="Back to agents" onAction={() => props.navigate('/admin/agents')} />

  const agentId = agent.id
  const allChecked = reviewChecks.every((item) => checks[item])
  async function decide(verification: Agent['verification']) {
    await props.mutate(`Agent marked ${verification.toLowerCase()}`, (draft) => {
      const item = draft.agents.find((candidate) => candidate.id === agentId)
      if (item) {
        item.verification = verification
        item.verificationNotes = notes.trim()
      }
    }, { note: notes.trim() })
  }

  return (
    <div className="page">
      <button className="back-button" onClick={() => props.navigate('/admin/agents')}><ArrowLeft size={17} />Back to agents</button>
      <div className="review-header">
        <div className="profile-avatar">{initials(agent.name)}</div>
        <div><Badge tone={verificationTone(agent.verification)}>{agent.verification}</Badge><h1>{agent.name}</h1><p>{agent.business} · Joined {agent.joined}</p></div>
        <div className="decision-actions">
          <button className="btn secondary danger-text" disabled={props.busy || !notes.trim()} onClick={() => decide('Rejected')}><X size={17} />Reject</button>
          {agent.verification === 'Verified' && <button className="btn secondary danger-text" disabled={props.busy || !notes.trim()} onClick={() => decide('Suspended')}><Ban size={17} />Suspend</button>}
          <button className="btn primary" disabled={props.busy || !allChecked} onClick={() => decide('Verified')}><Check size={17} />Approve agent</button>
        </div>
      </div>
      <div className="review-layout">
        <div>
          <FormSection title="Identity evidence" description={`${agent.documents.length} documents submitted`}>
            <div className="evidence-grid">
              {agent.documents.map((document) => (
                <a key={document.id} href={document.file} target="_blank" rel="noreferrer">
                  <FileCheck2 /><span><strong>{document.title}</strong><small>Open submitted document</small></span><Eye />
                </a>
              ))}
              {!agent.documents.length && <EmptyState icon={<FileCheck2 />} title="No evidence submitted" body="This agent has not started verification." />}
            </div>
          </FormSection>
          <FormSection title="Account activity" description="Trust indicators from live platform use.">
            <div className="key-facts">
              <Fact label="Response rate" value={`${agent.responseRate}%`} />
              <Fact label="Freshness score" value={`${agent.freshnessScore}%`} />
              <Fact label="Listings" value={String(props.db.listings.filter((listing) => listing.agentId === agent.id).length)} />
              <Fact label="Reports" value={String(props.db.reports.filter((report) => props.db.listings.find((listing) => listing.id === report.listingId)?.agentId === agent.id).length)} />
            </div>
          </FormSection>
        </div>
        <aside className="decision-panel">
          <span className="eyebrow">Reviewer checklist</span>
          {reviewChecks.map((item) => <label className="check" key={item}><input type="checkbox" checked={Boolean(checks[item])} onChange={(event) => setChecks({ ...checks, [item]: event.target.checked })} />{item}</label>)}
          <Field label="Decision notes"><textarea rows={5} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Required for rejection" /></Field>
          <p><CircleAlert size={15} />The decision and notes are written to the audit log.</p>
        </aside>
      </div>
    </div>
  )
}
