import React, { useState } from 'react'
import Modal from '../ui/Modal'
import { Input, Textarea } from '../ui/Input'
import { Button } from '../ui/Button'

function ContactSellerModal({ isOpen, onClose, onSubmit, product, orderId, isOrderContact = false }) {
  const [formData, setFormData] = useState({
    name: '',
    message: '',
  })
  const [errors, setErrors] = useState({})
  
  // Pre-fill message for order-related contacts
  React.useEffect(() => {
    if (isOrderContact && isOpen) {
      setFormData(prev => ({
        ...prev,
        message: orderId 
          ? `Hi! I just purchased ${product?.name || 'this item'} (Order #${orderId}). I'd like to coordinate delivery details. Please let me know when and where we can arrange pickup/delivery.`
          : `Hi! I just purchased ${product?.name || 'this item'}. I'd like to coordinate delivery details. Please let me know when and where we can arrange pickup/delivery.`
      }))
    }
  }, [isOrderContact, isOpen, orderId, product?.name])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const newErrors = {}
    if (!formData.name.trim()) newErrors.name = 'Your name is required'
    if (!formData.message.trim()) newErrors.message = 'Message is required'
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return
    onSubmit?.({ ...formData, productId: product?.id })
  }

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={isOrderContact ? "Contact Seller - Delivery Coordination" : "Contact Seller"} 
      size="medium"
    >
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
        <Input
          label="Your Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          required
        />
        <Textarea
          label={isOrderContact 
            ? `Message about your order for "${product?.name || 'this item'}"` 
            : `Message about "${product?.name || 'this item'}"`}
          name="message"
          value={formData.message}
          onChange={handleChange}
          error={errors.message}
          rows={isOrderContact ? 6 : 5}
          required
          placeholder={isOrderContact 
            ? "I'd like to coordinate delivery details. Please let me know when and where we can arrange pickup/delivery."
            : "Enter your message here..."}
        />
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="default">Send</Button>
        </div>
      </form>
    </Modal>
  )
}

export default ContactSellerModal


