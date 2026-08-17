import { useToast } from '../contexts/ToastContext'

/**
 * Hook to handle account verification errors consistently across the app
 * @returns {Function} Function to handle verification errors
 */
export function useVerificationError() {
  const toast = useToast()

  const handleVerificationError = (error) => {
    if (error?.requires_verification || error?.status === 403) {
      toast.warning(
        error?.message || 'Please check your email and verify your account to continue. A verification link was sent to your email address.',
        'Account Verification Required'
      )
      return true // Indicates this was a verification error
    }
    return false // Not a verification error
  }

  return { handleVerificationError }
}

