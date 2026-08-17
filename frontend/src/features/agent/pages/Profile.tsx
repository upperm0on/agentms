import { useEffect, useState } from 'react'
import { Eye, Upload, UserRound } from 'lucide-react'
import type { AppProps } from '../../../app/types'
import { AgentMiniCard } from '../../../components/listings/AgentMiniCard'
import { EmptyState, Field, FormSection } from '../../../components/shared/Primitives'
import { initials } from '../../../lib/uiHelpers'
import '../AgentPages.css'

export function AgentProfile(props: AppProps) {
  const current = props.db.agents[0]
  const [agent, setAgent] = useState(current)
  useEffect(() => { if (current) setAgent(current) }, [current?.id])
  if (!agent) return <EmptyState icon={<UserRound />} title="No agent profile loaded" body="The backend did not return an agent profile for this account." action="Reload data" onAction={() => props.navigate('/agent/dashboard')} />

  return (
    <div className="page">
      <div className="profile-actions"><button className="btn secondary" onClick={() => props.navigate(`/agents/${agent.id}`)}><Eye size={17} />View public page</button></div>
      <div className="form-preview-grid">
        <form onSubmit={(e) => { e.preventDefault(); props.mutate('Public profile updated', (draft) => { const index = draft.agents.findIndex((a) => a.id === agent.id); draft.agents[index] = agent }) }}>
          <FormSection title="" description="">
            <div className="avatar-upload"><div className="profile-avatar">{initials(agent.name)}</div><button type="button" className="btn secondary"><Upload size={16} />Change photo</button></div>
            <div className="form-grid">
              <Field label="Display name"><input value={agent.name} onChange={(e) => setAgent({ ...agent, name: e.target.value })} /></Field>
              <Field label="Business name"><input value={agent.business} onChange={(e) => setAgent({ ...agent, business: e.target.value })} /></Field>
              <Field label="Phone"><input value={agent.phone} onChange={(e) => setAgent({ ...agent, phone: e.target.value })} /></Field>
              <Field label="WhatsApp"><input value={agent.whatsapp} onChange={(e) => setAgent({ ...agent, whatsapp: e.target.value })} /></Field>
              <Field label="About your work" wide><textarea value={agent.bio} onChange={(e) => setAgent({ ...agent, bio: e.target.value })} rows={5} /></Field>
              <Field label="Operating areas" wide><input value={agent.areas.join(', ')} onChange={(e) => setAgent({ ...agent, areas: e.target.value.split(',').map((x) => x.trim()) })} /></Field>
            </div>
          </FormSection>
          <div className="form-actions"><button className="btn primary">Save changes</button></div>
        </form>
        <aside className="sticky-preview"><span className="eyebrow">Student preview</span><AgentMiniCard agent={agent} navigate={props.navigate} expanded /></aside>
      </div>
    </div>
  )
}
