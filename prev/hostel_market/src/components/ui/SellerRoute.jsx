import React from 'react'
import { useSelector } from 'react-redux'
import AccessDenied from './AccessDenied'

function SellerRoute({ children }) {
  const { isAuthenticated, role } = useSelector(state => state.auth)
  const isSeller = role === 'seller'
  if (!isAuthenticated || !isSeller) {
    return (
      <AccessDenied
        title="You're not a seller"
        subtitle="Only sellers can access this page."
      />
    )
  }
  return <>{children}</>
}

export default SellerRoute


