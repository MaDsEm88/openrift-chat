/**
 * Utilities for handling the mobile-to-web authentication and plan selection flow
 */

export interface MobilePlanSelection {
  planId: string;
  billing: 'monthly' | 'yearly';
  userEmail: string;
  timestamp: number;
}

/**
 * Generate a secure URL for mobile-to-web plan selection flow
 */
export function generateMobileToWebURL(planSelection: MobilePlanSelection): string {
  const baseURL = process.env.VITE_APP_URL || 'http://localhost:3000';
  
  // Encode the plan selection data
  const encodedData = btoa(JSON.stringify(planSelection));
  
  // Create URL with encoded data
  const url = new URL('/login', baseURL);
  url.searchParams.set('from', 'mobile');
  url.searchParams.set('plan_data', encodedData);
  url.searchParams.set('action', 'checkout');
  
  return url.toString();
}

/**
 * Parse mobile plan selection from URL parameters
 */
export function parseMobilePlanSelection(searchParams: URLSearchParams): MobilePlanSelection | null {
  try {
    const planData = searchParams.get('plan_data');
    const from = searchParams.get('from');
    
    if (from !== 'mobile' || !planData) {
      return null;
    }
    
    const decoded = JSON.parse(atob(planData));
    
    // Validate the data structure
    if (!decoded.planId || !decoded.billing || !decoded.userEmail || !decoded.timestamp) {
      return null;
    }
    
    // Check if the data is not too old (30 minutes)
    const now = Date.now();
    const dataAge = now - decoded.timestamp;
    const maxAge = 30 * 60 * 1000; // 30 minutes
    
    if (dataAge > maxAge) {
      console.warn('Mobile plan selection data is too old');
      return null;
    }
    
    return decoded;
  } catch (error) {
    console.error('Error parsing mobile plan selection:', error);
    return null;
  }
}

/**
 * Store plan selection in session storage for use after login
 */
export function storePlanSelectionForAfterLogin(planSelection: MobilePlanSelection): void {
  try {
    sessionStorage.setItem('pending_mobile_plan', JSON.stringify(planSelection));
  } catch (error) {
    console.error('Error storing plan selection:', error);
  }
}

/**
 * Retrieve and clear stored plan selection after login
 */
export function retrieveAndClearPlanSelection(): MobilePlanSelection | null {
  try {
    const stored = sessionStorage.getItem('pending_mobile_plan');
    if (!stored) return null;
    
    // Clear it immediately
    sessionStorage.removeItem('pending_mobile_plan');
    
    const planSelection = JSON.parse(stored);
    
    // Validate it's still fresh (within 30 minutes)
    const now = Date.now();
    const dataAge = now - planSelection.timestamp;
    const maxAge = 30 * 60 * 1000; // 30 minutes
    
    if (dataAge > maxAge) {
      console.warn('Stored plan selection is too old');
      return null;
    }
    
    return planSelection;
  } catch (error) {
    console.error('Error retrieving plan selection:', error);
    return null;
  }
}

/**
 * Plan configuration mapping
 */
export const PLAN_CONFIGS = {
  foundation_plan: {
    name: 'Foundation Plan',
    price: 9.99,
    yearlyPrice: 101.90,
    description: 'Build your fitness foundation with intelligent AI guidance'
  },
  performance_plan: {
    name: 'Performance Plan', 
    price: 19.99,
    yearlyPrice: 203.90,
    description: 'Optimize your performance with advanced AI coaching'
  },
  champion_plan: {
    name: 'Champion Plan',
    price: 29.99,
    yearlyPrice: 305.90,
    description: 'Elite-level training with unlimited AI coaching'
  }
} as const;

/**
 * Generate checkout URL with plan parameters
 */
export function generateCheckoutURL(planId: string, billing: string = 'monthly', fromMobile: boolean = false): string {
  const baseURL = process.env.VITE_APP_URL || 'http://localhost:3000';
  const url = new URL('/account/billing/checkout', baseURL);
  
  url.searchParams.set('plan', planId);
  url.searchParams.set('billing', billing);
  
  if (fromMobile) {
    url.searchParams.set('from', 'mobile');
    // Add success/cancel URLs for mobile deep linking
    url.searchParams.set('success_url', encodeURIComponent('mobile://subscription-success'));
    url.searchParams.set('cancel_url', encodeURIComponent('mobile://subscription-cancelled'));
  }
  
  return url.toString();
}

/**
 * Check if user should see trial messaging based on their status
 */
export function shouldShowTrialMessaging(userStatus: {
  hasActivatedTrial?: boolean;
  hasCompletedOnboarding?: boolean;
} | null): boolean {
  // Show trial messaging only if user hasn't activated trial yet
  return !userStatus?.hasActivatedTrial;
}

/**
 * Get appropriate button text based on user's trial status
 */
export function getSubscriptionButtonText(userStatus: {
  hasActivatedTrial?: boolean;
  hasCompletedOnboarding?: boolean;
} | null): string {
  if (shouldShowTrialMessaging(userStatus)) {
    return 'Start 7-Day Free Trial';
  } else {
    return 'Subscribe Now';
  }
}

/**
 * Get appropriate paywall title based on user's trial status
 */
export function getPaywallTitle(userStatus: {
  hasActivatedTrial?: boolean;
  hasCompletedOnboarding?: boolean;
} | null, featureName?: string): string {
  if (shouldShowTrialMessaging(userStatus)) {
    return 'Start Your Free Trial';
  } else {
    return featureName ? `Upgrade for ${featureName}` : 'Upgrade Your Plan';
  }
}

/**
 * Get appropriate paywall message based on user's trial status
 */
export function getPaywallMessage(userStatus: {
  hasActivatedTrial?: boolean;
  hasCompletedOnboarding?: boolean;
} | null, featureName?: string): string {
  if (shouldShowTrialMessaging(userStatus)) {
    return `Start your 7-day free trial to unlock ${featureName || 'premium features'} and advanced AI-powered capabilities.`;
  } else {
    return `Upgrade your plan to access ${featureName || 'this premium feature'} and unlock more advanced capabilities.`;
  }
}
