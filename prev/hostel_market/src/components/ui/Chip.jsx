import React from 'react'
import { X } from 'lucide-react'
import { cn } from '../../utils/cn.js'
import './Chip.css'

function Chip({ selected = false, dismissible = false, onDismiss, className, children, ...props }) {
  return (
    <span className={cn('chip', selected && 'chip-selected', className)} {...props}>
      {children}
      {dismissible && (
        <button className="chip-dismiss" onClick={onDismiss} aria-label="Remove">
          <X size={14} />
        </button>
      )}
    </span>
  )}

export { Chip }


