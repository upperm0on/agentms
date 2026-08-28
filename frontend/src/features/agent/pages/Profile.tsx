import { useState } from 'react'
import { Eye, Upload, UserRound } from 'lucide-react'
import type { Agent } from '../../../api/mockApi'
import type { AppProps } from '../../../app/types'
import { AgentMiniCard } from '../../../components/listings/AgentMiniCard'
import { EmptyState, Field, FormSection } from '../../../components/shared/Primitives'
import { initials } from '../../../lib/uiHelpers'
import '../AgentPages.css'

function AgentProfileForm({ current, props }: { current: Agent; props: AppProps }) {
  const [agent, setAgent] = useState(current)
  return (
    <div className="page">
      <div className="profile-actions"><button className="btn secondary" onClick={() => props.navigate(`/agents/${agent.id}`)}><Eye size={17} />View public page</button></div>
      <div className="form-preview-grid">
        <form onSubmit={(event) => { event.preventDefault(); props.mutate('Public profile updated', (draft) => { const index = draft.agents.findIndex((item) => item.id === agent.id); draft.agents[index] = agent }) }}>
          <FormSection title="" description="">
            <div className="avatar-upload"><div className="profile-avatar">{initials(agent.name)}</div><button type="button" className="btn secondary"><Upload size={16} />Change photo</button></div>
            <div className="form-grid">
              <Field label="Display name"><input value={agent.name} onChange={(event) => setAgent({ ...agent, name: event.target.value })} /></Field>
              <Field label="Business name"><input value={agent.business} onChange={(event) => setAgent({ ...agent, business: event.target.value })} /></Field>
              <Field label="Phone"><input value={agent.phone} onChange={(event) => setAgent({ ...agent, phone: event.target.value })} /></Field>
              <Field label="WhatsApp"><input value={agent.whatsapp} onChange={(event) => setAgent({ ...agent, whatsapp: event.target.value })} /></Field>
              <Field label="About your work" wide><textarea value={agent.bio} onChange={(event) => setAgent({ ...agent, bio: event.target.value })} rows={5} /></Field>
              <Field label="Operating areas" wide><input value={agent.areas.join(', ')} onChange={(event) => setAgent({ ...agent, areas: event.target.value.split(',').map((item) => item.trim()) })} /></Field>
            </div>
          </FormSection>
          <div className="form-actions"><button className="btn primary">Save changes</button></div>
        </form>
        <aside className="sticky-preview"><span className="eyebrow">Student preview</span><AgentMiniCard agent={agent} navigate={props.navigate} expanded /></aside>
      </div>
    </div>
  )
}

export function AgentProfile(props: AppProps) {
  const current = props.db.agents[0]
  if (!current) return <EmptyState icon={<UserRound />} title="No agent profile loaded" body="The backend did not return an agent profile for this account." action="Reload data" onAction={() => props.navigate('/agent/dashboard')} />
  return <AgentProfileForm key={current.id} current={current} props={props} />
}
