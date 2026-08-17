import { ChevronRight, ShieldCheck } from 'lucide-react'
import type { Agent } from '../../api/mockApi'
import { initials } from '../../lib/uiHelpers'
import './AgentMiniCard.css'

export function AgentMiniCard({ agent, navigate, expanded }: { agent: Agent; navigate: (p: string) => void; expanded?: boolean }) { return <div className={`agent-mini ${expanded ? 'expanded' : ''}`}><div className="agent-mini-head"><span className="avatar-sm large">{initials(agent.name)}</span><div><strong>{agent.name}</strong><span>{agent.business}</span></div><ShieldCheck className="verified-shield" /></div>{expanded && <p>{agent.bio}</p>}<div className="agent-metrics"><span><strong>{agent.responseRate}%</strong> response</span><span><strong>{agent.freshnessScore}%</strong> fresh</span></div><button className="text-button" onClick={() => navigate(`/agents/${agent.id}`)}>View public profile <ChevronRight size={15} /></button></div> }
