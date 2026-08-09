import React, { useState } from 'react'
import { Wallet, ArrowRight, CheckCircle } from 'lucide-react'
import Modal from '../ui/Modal'
import { Input, Select } from '../ui/Input'
import { Button } from '../ui/Button'
import './PayoutRequest.css'

function PayoutRequest({ isOpen, onClose, onSubmit, balance, minAmount = 10 }) {
  const [formData, setFormData] = useState({
    amount: '',
    method: 'bank',
    account_number: '',
    account_name: '',
    bank_name: '',
    mobile_money_number: '',
    mobile_money_provider: 'mtn',
  })
  
  const [errors, setErrors] = useState({})
  
  const canRequest = parseFloat(balance) >= minAmount
  
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }
  
  const validate = () => {
    const newErrors = {}
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Valid amount is required'
    } else if (parseFloat(formData.amount) < minAmount) {
      newErrors.amount = `Minimum payout is ${minAmount} GHS`
    } else if (parseFloat(formData.amount) > balance) {
      newErrors.amount = 'Amount exceeds available balance'
    }
    
    if (formData.method === 'bank') {
      if (!formData.account_number) {
        newErrors.account_number = 'Account number is required'
      }
      if (!formData.account_name) {
        newErrors.account_name = 'Account name is required'
      }
      if (!formData.bank_name) {
        newErrors.bank_name = 'Bank name is required'
      }
    } else {
      if (!formData.mobile_money_number) {
        newErrors.mobile_money_number = 'Mobile money number is required'
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!validate()) {
      return
    }
    
    onSubmit(formData)
  }
  
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Request Payout"
      size="medium"
    >
      <div className="payout-request">
        {!canRequest && (
          <div className="payout-warning">
            <Wallet size={20} />
            <p>
              Minimum payout amount is <strong>{minAmount} GHS</strong>. 
              Your current balance is <strong>{parseFloat(balance).toLocaleString()} GHS</strong>.
            </p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="payout-form">
          <div className="balance-display">
            <div className="balance-item">
              <span>Available Balance:</span>
              <span className="balance-amount">GHS {parseFloat(balance).toLocaleString()}</span>
            </div>
          </div>
          
          <Input
            label="Payout Amount"
            name="amount"
            type="number"
            step="0.01"
            value={formData.amount}
            onChange={handleChange}
            error={errors.amount}
            required
            placeholder={`Minimum: ${minAmount} GHS`}
            max={balance}
          />
          
          <Select
            label="Payout Method"
            name="method"
            value={formData.method}
            onChange={handleChange}
            options={[
              { value: 'bank', label: 'Bank Transfer' },
              { value: 'mobile_money', label: 'Mobile Money' },
            ]}
            required
          />
          
          {formData.method === 'bank' ? (
            <>
              <Input
                label="Bank Name"
                name="bank_name"
                value={formData.bank_name}
                onChange={handleChange}
                error={errors.bank_name}
                required
                placeholder="e.g., GCB Bank"
              />
              <Input
                label="Account Number"
                name="account_number"
                value={formData.account_number}
                onChange={handleChange}
                error={errors.account_number}
                required
                placeholder="Account number"
              />
              <Input
                label="Account Name"
                name="account_name"
                value={formData.account_name}
                onChange={handleChange}
                error={errors.account_name}
                required
                placeholder="Account holder name"
              />
            </>
          ) : (
            <>
              <Select
                label="Mobile Money Provider"
                name="mobile_money_provider"
                value={formData.mobile_money_provider}
                onChange={handleChange}
                options={[
                  { value: 'mtn', label: 'MTN Mobile Money' },
                  { value: 'vodafone', label: 'Vodafone Cash' },
                  { value: 'airteltigo', label: 'AirtelTigo Money' },
                ]}
                required
              />
              <Input
                label="Mobile Money Number"
                name="mobile_money_number"
                type="tel"
                value={formData.mobile_money_number}
                onChange={handleChange}
                error={errors.mobile_money_number}
                required
                placeholder="e.g., 024 XXXX XXXX"
              />
            </>
          )}
          
          <div className="payout-note">
            <CheckCircle size={16} />
            <p>Payouts are processed within 24 hours</p>
          </div>
          
          <div className="payout-actions">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="default"
              disabled={!canRequest}
            >
              Request Payout
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  )
}

export default PayoutRequest

