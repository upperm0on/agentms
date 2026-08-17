import React from 'react'
import { cn } from '../../utils/cn.js'
import './Badge.css'

function Badge({ variant = 'default', className, children, ...props }) {
  const variantClass = `badge-${variant}`
  return (
    <span className={cn('badge', variantClass, className)} {...props}>
      {children}
    </span>
  )
}

export { Badge }


