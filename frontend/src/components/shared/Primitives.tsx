import type { ReactNode, SelectHTMLAttributes } from 'react'
import { CheckCircle2, ChevronDown, ChevronRight, CircleAlert, Clock3, RefreshCw, ShieldCheck, X } from 'lucide-react'
import type { Tone } from '../../api/mockApi'

export function Drawer({ title, close, children }: { title: string; close: () => void; children: ReactNode }) { return <div className="drawer-backdrop" onMouseDown={(e) => e.target === e.currentTarget && close()}><aside className="drawer"><div className="drawer-header"><div><span className="eyebrow">Details</span><h2>{title}</h2></div><button className="icon-btn" onClick={close}><X /></button></div><div className="drawer-body">{children}</div></aside></div> }
export function PageHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: ReactNode }) { return <div className="page-header"><div>{eyebrow && <span className="eyebrow">{eyebrow}</span>}<h1>{title}</h1>{description && <p>{description}</p>}</div>{action}</div> }
export function SectionHeading({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description: string; action?: ReactNode }) { return <div className="section-heading"><div>{eyebrow && <span className="eyebrow">{eyebrow}</span>}<h2>{title}</h2>{description && <p>{description}</p>}</div>{action}</div> }
export function FormHeading({ number, title, description }: { number: string; title: string; description: string }) { return <div className="form-heading"><span>{number}</span><div><h2>{title}</h2><p>{description}</p></div></div> }
export function Field({ label, children, wide }: { label: string; children: ReactNode; wide?: boolean }) { return <label className={`field ${wide ? 'wide' : ''}`}><span>{label}</span>{children}</label> }
export function FilterGroup({ label, children }: { label: string; children: ReactNode }) { return <div className="filter-group"><strong>{label}</strong>{children}</div> }
export function SelectControl({ children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) { return <span className="select-control"><select {...props}>{children}</select><ChevronDown size={16} /></span> }
export function FormSection({ title, description, children }: { title: string; description: string; children: ReactNode }) { return <section className={`form-section ${!title && !description ? 'no-heading' : ''}`}>{(title || description) && <div className="form-section-heading">{title && <h2>{title}</h2>}{description && <p>{description}</p>}</div>}<div>{children}</div></section> }
export function DetailSection({ title, children }: { title: string; children: ReactNode }) { return <section className="detail-section"><h2>{title}</h2>{children}</section> }
export function Badge({ tone = 'neutral', children }: { tone?: Tone; children: ReactNode }) { return <span className={`badge ${tone}`}>{children}</span> }
export type SignalKind = 'availability' | 'freshness' | 'verified'

function SignalIcon({ kind, value, size }: { kind: SignalKind; value: string; size: number }) {
  if (kind === 'verified') return <ShieldCheck size={size} />
  if (value === 'Available' || value === 'Confirmed today') return <CheckCircle2 size={size} />
  if (value === 'Limited' || value === 'Confirmed this week') return <Clock3 size={size} />
  if (value === 'Full' || value === 'Unavailable' || value === 'Stale') return <CircleAlert size={size} />
  return <RefreshCw size={size} />
}

export function SignalTag({ kind, value, active, explain = true, floating }: { kind: SignalKind; value: string; active?: boolean; explain?: boolean; floating?: boolean }) {
  const normalized = value.toLowerCase().replace(/\s+/g, '-')
  return <span className={`signal-tag icon-only ${explain ? 'has-tip' : ''} ${kind} ${normalized} ${floating ? 'floating' : ''} ${active ? 'tip-active' : ''}`} data-tip={explain ? value : undefined} aria-label={value} tabIndex={explain ? 0 : -1}><SignalIcon kind={kind} value={value} size={14} /></span>
}
export function SignalDetail({ kind, value }: { kind: SignalKind; value: string }) {
  const normalized = value.toLowerCase().replace(/\s+/g, '-')
  const title = kind === 'availability' ? 'Availability' : kind === 'freshness' ? 'Freshness' : 'Trust'
  return <div className={`detail-signal ${kind} ${normalized}`}><span><SignalIcon kind={kind} value={value} size={18} /></span><div><strong>{value}</strong><small>{title}</small></div></div>
}
export function Fact({ label, value, icon }: { label: string; value: string; icon?: ReactNode }) { return <div className={`fact ${icon ? 'with-icon' : ''}`}>{icon && <i>{icon}</i>}<span>{label}</span><strong>{value}</strong></div> }
export function Metric({ label, value, detail, tone = 'neutral', icon }: { label: string; value: string; detail: string; tone?: Tone; icon?: ReactNode }) { return <div className={`metric ${tone}`}>{icon && <i className="metric-icon">{icon}</i>}<span>{label}</span><strong>{value}</strong><small>{detail}</small></div> }
export function Review({ label, value }: { label: string; value: string }) { return <div><span>{label}</span><strong>{value}</strong></div> }
export function Queue({ icon, title, value, detail, tone, onClick }: { icon: ReactNode; title: string; value: string; detail: string; tone: Tone; onClick: () => void }) { return <button onClick={onClick}><span className={`queue-icon ${tone}`}>{icon}</span><div><strong>{title}</strong><small>{detail}</small></div><Badge tone={tone}>{value}</Badge><ChevronRight /></button> }
export function ActivityItem({ icon, title, meta }: { icon: ReactNode; title: string; meta: string }) { return <div><span>{icon}</span><div><strong>{title}</strong><small>{meta}</small></div></div> }
export function EmptyState({ icon, title, body, action, onAction }: { icon: ReactNode; title: string; body: string; action?: string; onAction?: () => void }) { return <div className="empty-state"><span>{icon}</span><h2>{title}</h2><p>{body}</p>{action && <button className="btn primary" onClick={onAction}>{action}</button>}</div> }
