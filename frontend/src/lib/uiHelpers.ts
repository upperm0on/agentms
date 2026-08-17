import type { Agent, InquiryStatus, Tone } from '../api/mockApi'

export const money = new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS', maximumFractionDigits: 0 })

export function firstByValue<T extends { id: string }>(items: T[], getValue: (item: T) => string) {
  return items.reduce<Record<string, string>>((seen, item) => {
    const value = getValue(item)
    if (!seen[value]) seen[value] = item.id
    return seen
  }, {})
}

export function initials(name: string) { return name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase() }
export function statusTone(status: InquiryStatus): Tone { return status === 'New' ? 'warning' : status === 'Contacted' ? 'info' : status === 'Viewing Scheduled' ? 'success' : status === 'Negotiating' ? 'warning' : status === 'Closed Won' ? 'success' : 'neutral' }
export function verificationTone(status: Agent['verification']): Tone { return status === 'Verified' ? 'success' : status === 'Pending' ? 'warning' : status === 'Suspended' || status === 'Rejected' ? 'danger' : 'neutral' }
export function currentDateLabel() { return new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) }
