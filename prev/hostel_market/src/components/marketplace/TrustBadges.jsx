import React from 'react'
import { ShieldCheck, CreditCard, PackageCheck } from 'lucide-react'
import './TrustBadges.css'

function TrustBadges() {
  return (
    <div className="trust-badges">
      <span className="trust-badge"><ShieldCheck size={14} /> Buyer protection</span>
      <span className="trust-badge"><CreditCard size={14} /> Secure payments</span>
      <span className="trust-badge"><PackageCheck size={14} /> Verified sellers</span>
    </div>
  )
}

export default TrustBadges


