import React from 'react'
import { ClipboardCheck, Truck, CreditCard } from 'lucide-react'
import './TermsBlocks.css'

function TermsBlocks({ isService }) {
  return (
    <div className="terms-blocks">
      <div className="terms-card">
        <div className="icon-circle">
          <ClipboardCheck size={18} />
        </div>
        <h4>Seller policies</h4>
        <ul>
          <li>Response time: within 24 hours</li>
          <li>Refunds handled case-by-case</li>
          <li>Community code of conduct applies</li>
        </ul>
      </div>
      <div className="terms-card">
        <div className="icon-circle">
          <Truck size={18} />
        </div>
        <h4>Fulfillment</h4>
        <p>{isService ? 'On-site or remote delivery as agreed' : 'Pickup or campus delivery'}</p>
      </div>
      <div className="terms-card">
        <div className="icon-circle">
          <CreditCard size={18} />
        </div>
        <h4>Payment</h4>
        <p>{isService ? 'Escrow-held until completion' : 'Pay on order'}</p>
      </div>
    </div>
  )
}

export default TermsBlocks


