// src/hooks/useAuthWithCustomer.ts
import { useAuth } from '@/lib/auth-client'
import { useAutumn } from 'autumn-js/react'
import { useEffect, useState } from 'react'

export function useAuthWithCustomer() {
  const { data: session, isPending: isSessionPending } = useAuth()
  const { customer, isLoading: isCustomerLoading, error: customerError } = useAutumn()
  
  const [isReady, setIsReady] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    // Track if we've finished the initial auth/customer setup
    if (!isInitialized && !isSessionPending) {
      setIsInitialized(true)
    }

    // We're ready when:
    // 1. Session is not pending
    // 2. If we have a session, customer data is loaded (or we have an error)
    // 3. We've completed at least one initialization cycle
    const sessionReady = !isSessionPending
    const customerReady = !session?.user || !isCustomerLoading
    const initializationComplete = isInitialized
    
    const ready = sessionReady && customerReady && initializationComplete
    
    console.log('[useAuthWithCustomer] Status:', {
      sessionReady,
      customerReady,
      initializationComplete,
      hasSession: !!session?.user,
      hasCustomer: !!customer,
      isCustomerLoading,
      customerError: !!customerError,
      ready
    })
    
    setIsReady(ready)
  }, [session, isSessionPending, customer, isCustomerLoading, customerError, isInitialized])

  return {
    session,
    isSessionPending,
    customer,
    isCustomerLoading,
    customerCreated: !!customer, // Customer exists if we have customer data
    isCreatingCustomer: isCustomerLoading, // Autumn is loading/creating customer
    isReady,
    isInitialized,
    error: customerError?.message || null,
  }
}