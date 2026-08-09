import React from 'react'
import { Slot } from "@radix-ui/react-slot"
import { cn } from "../../utils/cn.js"
import './Button.css'

function Button({
  className,
  variant = 'default',
  size = 'default',
  asChild = false,
  loading = false,
  disabled,
  ...props
}) {
  const Comp = asChild ? Slot : "button"
  const variantClass = `btn-${variant}`
  const sizeClass = `btn-${size}`
  
  return (
    <Comp
      className={cn('btn', variantClass, sizeClass, loading && 'is-loading', className)}
      aria-busy={loading || undefined}
      disabled={disabled || loading}
      {...props}
    />
  )
}

export { Button }
