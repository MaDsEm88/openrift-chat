import { useState } from 'react'
import { useAutumn } from 'autumn-js/react'
import PaywallDialog from '@/components/autumn/paywall-dialog'

export interface UsePaywallReturn {
  checkFeature: (featureId: string) => Promise<boolean>
  PaywallComponent: () => JSX.Element | null
  isPaywallOpen: boolean
  closePaywall: () => void
}

/**
 * Hook for easy paywall integration
 * 
 * Usage:
 * ```tsx
 * const { checkFeature, PaywallComponent } = usePaywall()
 * 
 * const handleFeatureAction = async () => {
 *   const hasAccess = await checkFeature('premium_feature')
 *   if (hasAccess) {
 *     // Execute feature logic
 *     console.log('User has access!')
 *   }
 *   // If no access, paywall will show automatically
 * }
 * 
 * return (
 *   <div>
 *     <button onClick={handleFeatureAction}>Use Premium Feature</button>
 *     <PaywallComponent />
 *   </div>
 * )
 * ```
 */
export function usePaywall(): UsePaywallReturn {
  const { check } = useAutumn()
  const [paywallOpen, setPaywallOpen] = useState(false)
  const [paywallPreview, setPaywallPreview] = useState<any>(null)

  const checkFeature = async (featureId: string): Promise<boolean> => {
    try {
      const result = await check({
        featureId,
        withPreview: 'formatted'
      })

      if (result.data?.allowed) {
        return true
      } else {
        // Feature not allowed - show paywall
        // Note: The actual preview data structure depends on Autumn's API
        // For now, we'll create a mock preview to show the dialog
        setPaywallPreview({
          scenario: 'feature_flag',
          feature_name: featureId,
          products: [
            {
              id: 'foundation_plan',
              name: 'Foundation Plan',
              is_add_on: false,
              free_trial: true
            }
          ]
        })
        setPaywallOpen(true)
        return false
      }
    } catch (error) {
      console.error('Error checking feature access:', error)
      return false
    }
  }

  const closePaywall = () => {
    setPaywallOpen(false)
    setPaywallPreview(null)
  }

  const PaywallComponent = () => {
    if (!paywallOpen || !paywallPreview) return null

    return (
      <PaywallDialog
        open={paywallOpen}
        setOpen={setPaywallOpen}
        preview={paywallPreview}
      />
    )
  }

  return {
    checkFeature,
    PaywallComponent,
    isPaywallOpen: paywallOpen,
    closePaywall
  }
}

/**
 * Feature definitions for easy reference
 * These should match your Autumn feature configuration
 */
export const FEATURES = {
  WORKOUT_PLANS: 'workout_plans',
  MEAL_SCANS: 'meal_scans', 
  FORM_GUIDANCE: 'form_guidance',
  AI_COACHING: 'ai_coaching',
  ADVANCED_ANALYTICS: 'advanced_analytics',
  NUTRITION_PLANNING: 'nutrition_planning',
  PREMIUM_FEATURES: 'premium_features'
} as const

/**
 * Helper hook for feature gating with automatic paywall
 * 
 * Usage:
 * ```tsx
 * const { executeWithGate, PaywallComponent } = useFeatureGate(FEATURES.WORKOUT_PLANS)
 * 
 * const generateWorkout = async () => {
 *   await executeWithGate(async () => {
 *     // Your feature logic here
 *     console.log('Generating workout...')
 *   })
 * }
 * 
 * return (
 *   <div>
 *     <button onClick={generateWorkout}>Generate Workout</button>
 *     <PaywallComponent />
 *   </div>
 * )
 * ```
 */
export function useFeatureGate(featureId: string) {
  const { checkFeature, PaywallComponent, isPaywallOpen, closePaywall } = usePaywall()

  const executeWithGate = async (action: () => void | Promise<void>) => {
    const hasAccess = await checkFeature(featureId)
    if (hasAccess) {
      await action()
    }
    // If no access, paywall will show automatically
  }

  return {
    executeWithGate,
    PaywallComponent,
    isPaywallOpen,
    closePaywall
  }
}
