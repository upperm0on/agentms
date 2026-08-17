import type { Agent, InquiryStatus, Listing, Tone } from '../api/mockApi'

export const money = new Intl.NumberFormat('en-GH', {
  style: 'currency', currency: 'GHS', maximumFractionDigits: 0,
})

export function initials(name: string) {
  return name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()
}

export function freshnessRank(value: Listing['freshness']) {
  return ['Confirmed today', 'Confirmed this week', 'Needs refresh', 'Stale'].indexOf(value)
}

export function statusTone(status: InquiryStatus): Tone {
  if (status === 'New' || status === 'Negotiating') return 'warning'
  if (status === 'Contacted') return 'info'
  if (status === 'Viewing Scheduled' || status === 'Closed Won') return 'success'
  return 'neutral'
}

export function verificationTone(status: Agent['verification']): Tone {
  if (status === 'Verified') return 'success'
  if (status === 'Pending') return 'warning'
  if (status === 'Suspended' || status === 'Rejected') return 'danger'
  return 'neutral'
}
