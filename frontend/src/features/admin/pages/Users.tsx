import { useMemo, useState } from 'react'
import { CheckCircle2, LockKeyhole, Search } from 'lucide-react'
import type { Database } from '../../../api/mockApi'
import type { AppProps } from '../../../app/types'
import { Badge, Drawer, PageHeader, Review } from '../../../components/shared/Primitives'
import { initials } from '../../../lib/uiHelpers'
import '../AdminPages.css'

export function AdminUsers(props: AppProps) {
  const [selected, setSelected] = useState<Database['users'][number] | null>(null)
  const [query, setQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('All')
  const users = useMemo(() => {
    const term = query.trim().toLowerCase()
    return props.db.users.filter((user) => (!term || `${user.name} ${user.email}`.toLowerCase().includes(term)) && (roleFilter === 'All' || user.role === roleFilter))
  }, [props.db.users, query, roleFilter])

  async function toggleStatus() {
    if (!selected) return
    const nextStatus = selected.status === 'Active' ? 'Suspended' : 'Active'
    await props.mutate(nextStatus === 'Suspended' ? 'Account suspended' : 'Account reactivated', (draft) => {
      const item = draft.users.find((user) => user.id === selected.id)
      if (item) item.status = nextStatus
    })
    setSelected(null)
  }

  return (
    <div className="page">
      <PageHeader eyebrow="Accounts" title="Platform users" description="Inspect role, verification, and account state without impersonation." />
      <div className="toolbar">
        <div className="input-with-icon"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name or email" /></div>
        <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}><option value="All">All roles</option><option>Student</option><option>Agent</option><option>Admin</option></select>
        <span className="result-count">{users.length} users</span>
      </div>
      <div className="data-table-wrap"><table className="data-table"><thead><tr><th>User</th><th>Role</th><th>Email</th><th>Status</th><th>Last active</th><th></th></tr></thead><tbody>{users.map((user) => <tr key={user.id}><td><div className="person-cell"><span className="avatar-sm">{initials(user.name)}</span><strong>{user.name}</strong></div></td><td>{user.role}</td><td>{user.verified ? <span className="verified"><CheckCircle2 size={14} />Verified</span> : <Badge tone="warning">Unverified</Badge>}</td><td><Badge tone={user.status === 'Active' ? 'success' : 'danger'}>{user.status}</Badge></td><td>{user.lastActive}</td><td><button className="btn secondary small" onClick={() => setSelected(user)}>View</button></td></tr>)}</tbody></table></div>
      {selected && <Drawer title="Account details" close={() => setSelected(null)}>
        <div className="account-profile"><span className="profile-avatar">{initials(selected.name)}</span><div><h2>{selected.name}</h2><p>{selected.email}</p><Badge tone={selected.status === 'Active' ? 'success' : 'danger'}>{selected.status}</Badge></div></div>
        <div className="review-list"><Review label="Role" value={selected.role} /><Review label="Email verification" value={selected.verified ? 'Verified' : 'Pending'} /><Review label="Last active" value={selected.lastActive} /></div>
        <div className="info-callout"><LockKeyhole />Your own admin account cannot be suspended.</div>
        <button className="btn secondary danger-text full" disabled={props.busy || selected.email === props.db.profile.email} onClick={toggleStatus}>{selected.status === 'Active' ? 'Suspend account' : 'Reactivate account'}</button>
      </Drawer>}
    </div>
  )
}
