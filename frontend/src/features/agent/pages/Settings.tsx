import { KeyRound, LockKeyhole } from 'lucide-react'
import type { AppProps } from '../../../app/types'
import { Preferences } from '../../../components/preferences/Preferences'
import { FormSection, PageHeader } from '../../../components/shared/Primitives'
import '../AgentPages.css'

export function AgentSettings(props: AppProps) {
  return <div className="page narrow-page"><PageHeader eyebrow="Agent account" title="Settings" description="Control operational alerts and account security." /><Preferences db={props.db} mutate={props.mutate} agent /><FormSection title="Security" description="Keep your account protected."><div className="settings-list"><div><span className="settings-icon"><KeyRound /></span><div><strong>Password</strong><span>Managed by the account authentication API</span></div><button className="btn secondary">Change password</button></div><div><span className="settings-icon"><LockKeyhole /></span><div><strong>Two-step verification</strong><span>Status is not exposed by the current backend API</span></div><button className="btn secondary">Set up</button></div></div></FormSection></div>
}
