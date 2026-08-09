import React from 'react'
import AccessDenied from '../components/ui/AccessDenied'

function NotFound() {
  return (
    <AccessDenied
      title="Page not found"
      subtitle="The page you’re looking for doesn’t exist or has moved."
    />
  )
}

export default NotFound


