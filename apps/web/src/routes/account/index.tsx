//accountpage - 
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useSession } from '@/lib/auth-client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { User, Crown, Zap, ChevronDown, Target, Check, Loader2, Calendar, CreditCard, X, Menu } from 'lucide-react'
import { LogOutButton } from '@/components/auth/logout-button'
import { useCustomer, useAutumn } from 'autumn-js/react'
import { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { shouldShowTrialMessaging, getSubscriptionButtonText } from '@/lib/mobile-web-bridge'
import { useQuery, useMutation } from 'convex/react'
import { api } from 'database'

export const Route = createFileRoute('/account/')({
  component: AccountPage,
})

// Types for better type safety
interface BillingEvent {
  _id: string;
  createdAt: number;
  type: string;
  data: {
    amount?: number;
    status?: string;
    [key: string]: any;
  };
}

interface UserUsage {
  [key: string]: {
    used: number;
    limit?: number;
    resetDate: number;
  };
}

interface Subscription {
  status: string;
  trialEnd?: number;
  currentPeriodEnd: number;
  currentPeriodStart: number;
  productId: string;
  platform: string;
  externalId: string;
  cancelAtPeriodEnd?: boolean;
  canceledAt?: number;
}

// Mobile detection hook
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
}

// Feature usage bar component
const FeatureUsageBar = ({ name, used, limit }: { name: string; used: number; limit: number }) => {
  const percentage = Math.min((used / (limit || 1)) * 100, 100);
  return (
    <div className="mb-4">
      <div className="flex justify-between mb-1">
        <span className="text-sm text-gray-600 dark:text-gray-400">{name}</span>
        <span className="text-sm text-gray-600 dark:text-gray-400">{used}/{limit}</span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

interface PlanConfig {
  name: string;
  icon: React.ElementType;
  monthlyPrice?: number;
  yearlyPrice?: number;
  monthlyStripePriceId?: string;
  yearlyStripePriceId?: string;
  color: string;
  popular: boolean;
  description: string;
  features: string[];
  stripeProductId: string;
}

const iconMap: { [key: string]: React.ElementType } = {
  Target: Target,
  Zap: Zap,
  Crown: Crown,
};

function AccountPage() {
  // ✅ FIXED: Always call hooks in the same order, no conditional calls
  const { data: session, isPending } = useSession()
  const { customer, refetch: refetchCustomer } = useCustomer()
  const { attach, check } = useAutumn()
  
  // All useState hooks called consistently
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)
  const [isPaymentHistoryOpen, setIsPaymentHistoryOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('basic-info')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  // All useRef hooks called consistently
  const dropdownRef = useRef<HTMLDivElement>(null)
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  
  // Custom hook called consistently
  const isMobile = useIsMobile()

  // ✅ FIXED: Always call useQuery hooks, use undefined instead of "skip"
  const userSubscription = useQuery(
    api.subscriptions.getUserSubscription,
    session?.user?.id ? { userId: session.user.id } : undefined
  )
  
  const userOnboardingStatus = useQuery(
    api.onboarding.getUserOnboardingStatus,
    session?.user?.id ? { userId: session.user.id as any } : undefined
  )
  
  const billingHistory = useQuery(
    api.billing.getUserBillingHistory,
    session?.user?.id ? { userId: session.user.id } : undefined
  ) as BillingEvent[] | undefined

  const userUsage = useQuery(
    api.subscriptions.getUserUsage,
    session?.user?.id ? { userId: session.user.id } : undefined
  ) as UserUsage | undefined

  const productsQuery = useQuery(api.billing.getProducts)

  // ✅ FIXED: All useMemo hooks are now called consistently
  const planConfigs = useMemo(() => {
    if (!productsQuery?.length) { 
      return {} as Record<string, PlanConfig>;
    }

    const groupedByStripeProductId = productsQuery.reduce((acc, product) => { 
      if (!product.active || !product.stripeProductId) return acc;
      acc[product.stripeProductId] = acc[product.stripeProductId] || [];
      acc[product.stripeProductId].push(product);
      return acc;
    }, {} as Record<string, Array<typeof productsQuery[0]>>); 

    const finalConfigs: Record<string, PlanConfig> = {};

    for (const stripeProductId in groupedByStripeProductId) {
      const productsInGroup = groupedByStripeProductId[stripeProductId];
      
      const monthlyProduct = productsInGroup.find(p => (p.name?.toLowerCase().includes('monthly')) && typeof p.price === 'number');
      const yearlyProduct = productsInGroup.find(p => (p.name?.toLowerCase().includes('yearly')) && typeof p.price === 'number');

      const representativeProduct = monthlyProduct || yearlyProduct;
      if (!representativeProduct) continue;

      let inferredIconName = 'Target';
      const productNameLower = representativeProduct.name?.toLowerCase();
      if (productNameLower?.includes('foundation')) {
        inferredIconName = 'Target';
      } else if (productNameLower?.includes('growth') || productNameLower?.includes('performance')) {
        inferredIconName = 'Zap';
      } else if (productNameLower?.includes('peak') || productNameLower?.includes('champion')) {
        inferredIconName = 'Crown';
      }

      const clientKey = (representativeProduct.name?.toLowerCase().split(' ')[0].replace('plan', '').trim().replace(/[^a-z0-9_]/gi, '') || stripeProductId.replace('prod_', '')) + '_plan';

      finalConfigs[clientKey] = {
        name: representativeProduct.name?.replace(/ Monthly| Yearly/i, '').trim() || 'Unnamed Plan',
        icon: iconMap[inferredIconName] || Target,
        monthlyPrice: monthlyProduct?.price,
        yearlyPrice: yearlyProduct?.price,
        monthlyStripePriceId: monthlyProduct?.stripePriceId,
        yearlyStripePriceId: yearlyProduct?.stripePriceId,
        color: representativeProduct.color || '#3b82f6',
        popular: representativeProduct.popular || false,
        description: representativeProduct.description || '',
        features: representativeProduct.features || [],
        stripeProductId: stripeProductId,
      };
    }
    return finalConfigs;
  }, [productsQuery]); 

  const currentPlanId = useMemo(() => {
    if (!userSubscription?.subscription?.productId || !Object.keys(planConfigs).length) {
      return null;
    }
    
    const currentSubscribedStripeProductId = userSubscription.subscription.productId;

    for (const planKey in planConfigs) {
      if (planConfigs[planKey].stripeProductId === currentSubscribedStripeProductId) {
        return planKey;
      }
    }
    return null;
  }, [userSubscription, planConfigs]);

  // Mutations for subscription management
  const updateSubscription = useMutation(api.subscriptions.updateSubscription)
  const recordBillingEvent = useMutation(api.billing.recordBillingEvent)

  // ✅ FIXED: useEffect hooks called consistently
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const navigate = useNavigate({ from: Route.fullPath });
  const search = Route.useSearch();

  // Convex mutations and queries
  const fulfillPaymentMutation = useMutation(api.billing.fulfillAutumnPayment);
  const userFeatures = useQuery(api.billing.getUserFeatures,
    session?.user?.id ? { userId: session.user.id } : "skip"
  );

  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    const {
      payment_status,
      session_id: stripeSessionId, // This is the checkoutSessionId for fulfillAutumnPayment
      planId: internalPlanIdFromUrl, // This is the internalPlanId for fulfillAutumnPayment
      billing_cycle,
      error: paymentErrorParam,
      from, // e.g., 'mobile_onboarding'
    } = search;

    if (payment_status === "success" && stripeSessionId && internalPlanIdFromUrl && session?.user?.id && !processingPayment && !paymentSuccess) {
      setProcessingPayment(true);
      setPaymentError(null);

      console.log("Processing successful payment from Autumn/Stripe...");
      console.log("Stripe Session ID (Checkout Session ID):", stripeSessionId);
      console.log("Internal Plan ID from URL:", internalPlanIdFromUrl);
      console.log("User ID:", session.user.id);

      fulfillPaymentMutation({
        checkoutSessionId: stripeSessionId,
        userId: session.user.id,
        internalPlanId: internalPlanIdFromUrl,
        // fromContext: from, // You can pass 'from' if your mutation uses it
      })
        .then((result) => {
          if (result.success) {
            console.log("Convex: Payment fulfilled successfully", result);
            setPaymentSuccess(true);
            // Construct deep link URL
            const mobileRedirectUrl = `miloapp://(flows)/onboarding?status=success&planId=${encodeURIComponent(
              result.planId || internalPlanIdFromUrl || ''
            )}&billing=${encodeURIComponent(
              result.billingCycle || billing_cycle || ''
            )}&timestamp=${Date.now()}${ from ? `&from=${encodeURIComponent(from)}` : ''}`;
            
            if (from === "mobile" || from === "mobile_onboarding") {
              console.log("Redirecting to mobile app:", mobileRedirectUrl);
              window.location.href = mobileRedirectUrl;
            } else {
              // Handle web success (e.g., show a success message)
              // Optionally clear URL params
              navigate({ search: (prev) => ({ ...prev, payment_status: undefined, session_id: undefined, planId: undefined, billing_cycle: undefined, error: undefined, from: undefined }), replace: true });
            }
          } else {
            console.error("Convex: Failed to fulfill payment", result.error);
            setPaymentError(result.error || "Failed to update subscription. Please contact support.");
            // Construct error deep link URL
            const mobileRedirectUrl = `miloapp://(flows)/onboarding?status=error&errorCode=PAYMENT_FULFILL_FAILED&errorMessage=${encodeURIComponent(result.error || 'Unknown error')}&timestamp=${Date.now()}${ from ? `&from=${encodeURIComponent(from)}` : ''}`;
            if (from === "mobile" || from === "mobile_onboarding") {
               console.log("Redirecting to mobile app with error:", mobileRedirectUrl);
               window.location.href = mobileRedirectUrl;
            }
            // Optionally clear URL params
            navigate({ search: (prev) => ({ ...prev, payment_status: undefined, session_id: undefined, planId: undefined, billing_cycle: undefined, error: undefined, from: undefined }), replace: true });
          }
        })
        .catch((err) => {
          console.error("Error calling fulfillAutumnPayment mutation:", err);
          setPaymentError(err.message || "An unexpected error occurred. Please contact support.");
           // Construct error deep link URL
           const mobileRedirectUrl = `miloapp://(flows)/onboarding?status=error&errorCode=MUTATION_ERROR&errorMessage=${encodeURIComponent(err.message || 'Unknown error')}&timestamp=${Date.now()}${ from ? `&from=${encodeURIComponent(from)}` : ''}`;
           if (from === "mobile" || from === "mobile_onboarding") {
              console.log("Redirecting to mobile app with mutation error:", mobileRedirectUrl);
              window.location.href = mobileRedirectUrl;
           }
           // Optionally clear URL params
           navigate({ search: (prev) => ({ ...prev, payment_status: undefined, session_id: undefined, planId: undefined, billing_cycle: undefined, error: undefined, from: undefined }), replace: true });
        })
        .finally(() => {
          setProcessingPayment(false);
          // Don't clear params immediately if redirecting, let the redirect happen first.
          // If not redirecting (i.e., web flow), clear them here or after a delay.
          if (!(from === "mobile" || from === "mobile_onboarding")) {
            setTimeout(() => { // Delay to allow user to see status before URL clears
                navigate({ search: (prev) => ({ ...prev, payment_status: undefined, session_id: undefined, planId: undefined, billing_cycle: undefined, error: undefined, from: undefined }), replace: true });
            }, 3000);
          }
        });
    } else if (payment_status === "error" && paymentErrorParam && !paymentError && !processingPayment) {
        setPaymentError(`Payment failed or was cancelled: ${paymentErrorParam}`);
        // Optionally clear URL params
        navigate({ search: (prev) => ({ ...prev, payment_status: undefined, session_id: undefined, planId: undefined, billing_cycle: undefined, error: undefined, from: undefined }), replace: true });
    } else if (payment_status === "cancel" && !paymentError && !processingPayment) {
        setPaymentError("Payment was cancelled.");
        // Optionally clear URL params
        navigate({ search: (prev) => ({ ...prev, payment_status: undefined, session_id: undefined, planId: undefined, billing_cycle: undefined, error: undefined, from: undefined }), replace: true });
    }

  }, [search, session, fulfillPaymentMutation, navigate, processingPayment, paymentSuccess, paymentError]); // Removed refetchCustomer from dependencies as it's not called in this new useEffect

  // ✅ FIXED: All hooks are called before any early returns
  // Show loading state while session is being fetched
  if (isPending) {
    return (
      <div className="min-h-screen bg-[#e9e5dc] dark:bg-[#1e1b16] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Redirect to login if no session
  if (!session?.user) {
    window.location.href = '/login'
    return null
  }

  const user = session.user
  const userInitials = user.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase()
    : user.email?.charAt(0).toUpperCase() || 'U'

  // Get subscription data from Autumn and Convex
  const currentProduct = customer?.products?.[0]
  const messagesFeature = customer?.features ? Object.values(customer.features).find((f: any) => f.feature_id === 'messages') : null
  const messagesUsed = messagesFeature ? ((messagesFeature as any).limit - (messagesFeature.balance || 0)) : 0
  const messagesLimit = (messagesFeature as any)?.limit || 50

  const hasActiveSubscription = userSubscription?.hasActiveSubscription || false
  const subscription = userSubscription?.subscription as Subscription | null
  const trialStatus = userOnboardingStatus || { hasActivatedTrial: false }

  const getTrialDaysRemaining = () => {
    if (!trialStatus.hasActivatedTrial) return 0;
    if (!subscription?.trialEnd) return 0;
    
    const now = Date.now();
    const trialEnd = subscription.trialEnd;
    const daysRemaining = Math.ceil((trialEnd - now) / (1000 * 60 * 60 * 24));
    return Math.max(0, daysRemaining);
  }

  const trialDaysRemaining = getTrialDaysRemaining()

  const getBillingInfo = () => {
    if (!subscription) {
      return {
        nextBillingDate: 'No active subscription',
        hasPaymentMethod: false,
        planName: 'No Plan',
        monthlyTotal: '$0.00'
      }
    }

    const endDate = subscription.status === 'trialing' 
      ? subscription.trialEnd 
      : subscription.currentPeriodEnd;

    const activePriceDetail = productsQuery?.find(p => p.stripePriceId === subscription.productId); 
    const price = activePriceDetail?.price || 0;
    
    let planName = 'Unknown Plan';
    if (activePriceDetail?.stripeProductId) {
        const matchedPlanKey = Object.keys(planConfigs).find(key => planConfigs[key].stripeProductId === activePriceDetail.stripeProductId);
        if (matchedPlanKey) {
            planName = planConfigs[matchedPlanKey].name;
        }
    } else if (activePriceDetail?.name) {
        planName = activePriceDetail.name;
    }

    return {
      nextBillingDate: endDate ? new Date(endDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }) : 'Unknown',
      hasPaymentMethod: true,
      planName: planName,
      monthlyTotal: `$${price.toFixed(2)}`
    }
  }

  const billingInfo = getBillingInfo()

  const handleCancelSubscription = async () => {
    if (!session?.user?.id || !subscription) return;
    
    const platform = subscription.platform as "stripe" | "apple" | "google";
    if (!['stripe', 'apple', 'google'].includes(platform)) {
      console.error('Invalid subscription platform:', subscription.platform);
      return;
    }

    try {
      await updateSubscription({
        userId: session.user.id,
        platform: platform,
        externalId: subscription.externalId,
        productId: subscription.productId,
        status: "canceled",
        currentPeriodStart: subscription.currentPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd,
        cancelAtPeriodEnd: true,
        canceledAt: Date.now()
      });
  
      await recordBillingEvent({
        userId: session.user.id,
        type: "subscription_canceled",
        subscriptionId: subscription.externalId,
        externalId: `cancel_${Date.now()}`,
        platform: platform,
        data: {
          cancelReason: "user_requested",
          effectiveDate: subscription.currentPeriodEnd
        }
      });
      
      setIsCancelDialogOpen(false);
    } catch (error) {
      console.error('Error cancelling subscription:', error);
    }
  }

  const formatBillingHistory = () => {
    if (!billingHistory || billingHistory.length === 0) {
      return [];
    }
    
    return billingHistory.map(event => ({
      date: new Date(event.createdAt).toLocaleDateString(),
      type: event.type,
      amount: event.data?.amount || 0,
      status: event.data?.status || 'unknown'
    }));
  };

  const formatFeatureUsage = (feature: string) => {
    if (!userUsage) return { used: 0, limit: 0 };
    
    const usage = userUsage[feature];
    if (!usage) return { used: 0, limit: 0 };
    
    return {
      used: usage.used,
      limit: usage.limit || 0
    };
  };

  const sidebarSections = [
    {
      id: 'basic-info',
      title: 'Basic Information',
      subtitle: 'Tell us about your business details',
      icon: User,
      completed: true
    },
    {
      id: 'billing',
      title: 'Billing',
      subtitle: 'Information to confirm your identity',
      icon: CreditCard,
      completed: !!currentPlanId
    },
    {
      id: 'plans',
      title: 'Plans',
      subtitle: 'Provide your tax filing details',
      icon: Crown,
      completed: false
    },
    {
      id: 'usage',
      title: 'Usage',
      subtitle: 'Share how COVID-19 affected your business',
      icon: Zap,
      completed: false
    },
    {
      id: 'rewards',
      title: 'Rewards',
      subtitle: 'Upload necessary documents and details',
      icon: Target,
      completed: false
    }
  ]

  const handleSubscribe = async (planId: string) => {
    if (currentPlanId === planId) {
      return
    }

    setLoadingPlan(planId)

    try {
      await attach({
        productId: planId,
        metadata: {
          billing_cycle: billingCycle,
          from_web: 'true'
        }
      })
    } catch (error) {
      console.error('Error starting subscription:', error)
    } finally {
      setLoadingPlan(null)
    }
  }

  // Component to render content based on active section
  const renderSectionContent = () => {
    switch (activeSection) {
      case 'basic-info':
        return (
          <Card className="bg-[#f5f2ea] dark:bg-[#0f0c05] dark:border-[#d6d1c4]/20 border-[#29261f]/20">
            <CardHeader className="flex flex-row items-center justify-between ">
              <CardTitle className="text-lg font-manrope_1 font-semibold text-gray-900 dark:text-white">
                Basic Information
              </CardTitle>
              <Avatar className="h-6 w-6">
                <AvatarImage src={user.image || ''} alt={user.name || ''} />
                <AvatarFallback className="text-sm">{userInitials}</AvatarFallback>
              </Avatar>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex w-full justify-between">
                <p className="font-manrope_1 text-sm font-bold text-black dark:text-white">Name</p>
                <p className="font-manrope_1 text-sm text-black/60 dark:text-white/60">{user.firstName} {user.lastName}</p>
              </div>
              <div className="flex w-full justify-between">
                <p className="font-manrope_1 text-sm font-bold text-black dark:text-white">Email</p>
                <p className="font-manrope_1 text-sm text-black/60 dark:text-white/60">{user.email}</p>
              </div>
            </CardContent>
          </Card>
        )

      case 'billing':
        return (
          <Card className="bg-[#f5f2ea] dark:bg-[#0f0c05] dark:border-[#d6d1c4]/20 border-[#29261f]/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-lg font-manrope_1 font-semibold text-gray-900 dark:text-white">
                Billing
              </CardTitle>
              <Button
                variant="ghost"
                className="absolute cursor-pointer top 4 right-4 md:right-12 text-blue-600 hover:text-blue-700 font-manrope_1 text-sm"
                onClick={() => setIsPaymentHistoryOpen(true)}
              >
                Payment history
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Trial Status */}
              {trialStatus.hasActivatedTrial && subscription?.status === 'trialing' && (
                <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <Crown className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-lg font-semibold text-blue-900 dark:text-blue-100 font-manrope_1">
                      {getTrialDaysRemaining()} days left in trial
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-300 font-manrope_1">
                      Trial ends on {subscription?.trialEnd ? new Date(subscription.trialEnd).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              )}

              {/* Next Billing Date */}
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <div>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white font-manrope_1">
                    {billingInfo.nextBillingDate}
                  </p>
                  <p className="text-sm text-[#7e7b76] font-manrope_1">
                    {subscription?.status === 'trialing' ? 'Trial ends / Billing starts' : 'Next Billing Date'}
                  </p>
                </div>
              </div>

              {/* Payment Method */}
              {billingInfo.hasPaymentMethod && (
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <div>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white font-manrope_1">
                      Payment method on file
                    </p>
                    <p className="text-sm text-[#7e7b76] font-manrope_1">
                      Managed through Stripe
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )

      case 'plans':
        return (
          <Card className="bg-[#f5f2ea] dark:bg-[#0f0c05] dark:border-[#d6d1c4]/20 border-[#29261f]/20">
            <CardHeader>
              <CardTitle className="text-lg font-manrope_1 font-semibold text-gray-900 dark:text-white">
                Current plan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {currentPlanId ? (
                <>
                  <div className="border border-[#d6d1c4] dark:border-[#29261f] rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900 dark:text-white font-manrope_1">
                        {planConfigs[currentPlanId as keyof typeof planConfigs]?.name || billingInfo.planName}
                      </h3>
                      <Button
                        variant="ghost"
                        className="text-red-600 hover:text-red-700 font-manrope_1 text-sm"
                        onClick={() => setIsCancelDialogOpen(true)}
                      >
                        Cancel subscription
                      </Button>
                    </div>

                    <div className="space-y-2 mb-4">
                      {planConfigs[currentPlanId as keyof typeof planConfigs]?.features.slice(0, 3).map((feature, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <Check size={16} color="#22c55e" className="mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700 dark:text-gray-300 font-manrope_1">
                            {feature}
                          </span>
                        </div>
                      ))}
                      <Button variant="ghost" className="text-blue-600 hover:text-blue-700 font-manrope_1 text-sm p-0 h-auto">
                        Show more
                      </Button>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm text-[#7e7b76] font-manrope_1">
                        {billingInfo.monthlyTotal}/user/mo • 1 seat purchased
                      </p>
                      <p className="font-semibold text-gray-900 dark:text-white font-manrope_1">
                        Monthly total: {billingInfo.monthlyTotal}
                      </p>
                    </div>
                  </div>

                  <div className="border border-[#d6d1c4] dark:border-[#29261f] rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white font-manrope_1 mb-1">
                          Manage subscription
                        </h4>
                        <p className="text-sm text-[#7e7b76] font-manrope_1">
                          To upgrade or downgrade your plan, please use the mobile app
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-[#7e7b76] font-manrope_1 mb-4">No active subscription</p>
                  <p className="text-sm text-[#7e7b76] font-manrope_1">
                    To subscribe to a plan, please use the mobile app
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )

      case 'usage':
        return (
          <Card className="bg-[#f5f2ea] dark:bg-[#0f0c05] dark:border-[#d6d1c4]/20 border-[#29261f]/20">
            <CardHeader>
              <CardTitle className="text-lg font-manrope_1 font-semibold text-gray-900 dark:text-white">Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Premium Features</span>
                    <Crown className="w-4 h-4 text-gray-400" />
                  </div>
                  {(() => {
                    const usage = formatFeatureUsage('premium_features');
                    return (
                      <FeatureUsageBar
                        name="Premium Features"
                        used={usage.used}
                        limit={usage.limit}
                      />
                    );
                  })()}
                </div>
                {/* Similar updates for other usage sections */}
              </div>
            </CardContent>
          </Card>
        )

      case 'rewards':
        return (
          <Card className="bg-[#f5f2ea] dark:bg-[#0f0c05] dark:border-[#d6d1c4]/20 border-[#29261f]/20">
            <CardHeader>
              <CardTitle className="text-lg font-manrope_1 font-semibold text-gray-900 dark:text-white">Rewards</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-[#7e7b76] font-manrope_1">Rewards system coming soon!</p>
              </div>
            </CardContent>
          </Card>
        )

      default:
        return null
    }
  }

  return (
    <div className="w-full min-h-screen bg-[#e9e5dc] dark:bg-[#1e1b16]">
 {isMobile ? (
  /* Mobile Layout */
  <>
    {/* Mobile Header with Dropdown */}
    <div className="fixed top-2 left-4 right-4  z-50">
      {/* Header Bar */}
      <div className={`bg-[#2d4a3e] text-white transition-all duration-300 ${
        isMobileMenuOpen ? 'rounded-t-xl' : 'rounded-xl'
      }`}>     
        <div className="flex items-center justify-between p-4">
          <h1 className="text-lg font-bold font-manrope_1">Settings</h1>
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setIsMobileMenuOpen(!isMobileMenuOpen)
            }}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <AnimatePresence mode="wait">
              {isMobileMenuOpen ? (
                <motion.div
                  key="x-icon"
                  initial={{ scale: 0, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 90 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  <X className="w-6 h-6 text-white" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu-icon"
                  initial={{ scale: 0, rotate: 90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: -90 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  <Menu className="w-6 h-6 text-white" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/10 z-30"
              onClick={(e) => {
                e.stopPropagation()
                setIsMobileMenuOpen(false)
              }}
            />

            {/* Dropdown Panel */}
            <motion.div
              ref={mobileMenuRef}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ 
                duration: 0.3, 
                ease: "easeOut",
                opacity: { duration: 0.2 }
              }}
              className="relative bg-[#2d4a3e] text-white shadow-xl overflow-hidden z-40 rounded-b-xl"
            >
              <div className="max-h-[calc(100vh-80px)] overflow-y-auto">
                {/* Navigation Items */}
                <nav className="p-4 space-y-2">
                  {sidebarSections.map((section, index) => {
                    const isActive = activeSection === section.id

                    return (
                      <motion.button
                        key={section.id}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ 
                          delay: index * 0.05,
                          duration: 0.2,
                          ease: "easeOut"
                        }}
                        onClick={() => {
                          setActiveSection(section.id)
                          setIsMobileMenuOpen(false)
                        }}
                        className={`w-full text-left p-3 rounded-lg transition-colors flex items-center gap-3 ${
                          isActive
                            ? 'bg-white/10 text-white'
                            : 'text-white/70 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            section.completed
                              ? 'bg-green-500 border-green-500'
                              : isActive
                                ? 'border-white'
                                : 'border-white/30'
                          }`}>
                            {section.completed && <Check size={14} />}
                          </div>
                          <div>
                            <div className="font-medium font-manrope_1">{section.title}</div>
                            <div className="text-xs text-white/60 font-manrope_1">{section.subtitle}</div>
                          </div>
                        </div>
                      </motion.button>
                    )
                  })}
                </nav>

                {/* User Section */}
                <div className="border-t border-white/20 p-4">
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ 
                      delay: sidebarSections.length * 0.05,
                      duration: 0.2,
                      ease: "easeOut"
                    }}
                    className="relative"
                    ref={dropdownRef}
                  >
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.image || ''} alt={user.name || ''} />
                        <AvatarFallback>{userInitials}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 text-left">
                        <div className="font-medium font-manrope_1">{user.name}</div>
                        <div className="text-xs text-white/60 font-manrope_1">{user.email}</div>
                      </div>
                      <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                      {isDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0, scale: 0.95 }}
                          animate={{ opacity: 1, height: 'auto', scale: 1 }}
                          exit={{ opacity: 0, height: 0, scale: 0.95 }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                          className="mt-2 overflow-hidden"
                        >
                          <div className="bg-white/10 rounded-lg p-2">
                            <LogOutButton
                              variant="ghost"
                              className="w-full justify-start text-white hover:text-white hover:bg-white/10 text-sm font-manrope_1"
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>

    {/* Mobile Content */}
    <div className="pt-28 pb-4 px-4">
      <div className="max-w-7xl mx-auto">
        {renderSectionContent()}
      </div>
    </div>
  </>
) : (
        /* Desktop Layout with Sidebar */
      /* Desktop Layout with Sidebar */
<div className="min-h-screen py-[2rem] px-[2rem] flex justify-center">
  <div className="flex w-full max-w-[1300px]">
    {/* Sidebar */}
    <div className="w-80 bg-[#2d4a3e] rounded-xl text-white p-6 flex flex-col">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-xl font-bold font-manrope_1">Settings</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {sidebarSections.map((section) => {
          const isActive = activeSection === section.id

          return (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full text-left p-3 rounded-lg transition-colors flex items-center gap-3 ${
                isActive
                  ? 'bg-white/10 text-white'
                  : 'text-white/70 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3 flex-1">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  section.completed
                    ? 'bg-green-500 border-green-500'
                    : isActive
                      ? 'border-white'
                      : 'border-white/30'
                }`}>
                  {section.completed && <Check size={14} />}
                </div>
                <div>
                  <div className="font-medium font-manrope_1">{section.title}</div>
                  <div className="text-xs text-white/60 font-manrope_1">{section.subtitle}</div>
                </div>
              </div>
            </button>
          )
        })}
      </nav>

      {/* Bottom User Section */}
      <div className="border-t border-white/20 pt-4">
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors"
          >
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.image || ''} alt={user.name || ''} />
              <AvatarFallback>{userInitials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 text-left">
              <div className="font-medium font-manrope_1">{user.name}</div>
              <div className="text-xs text-white/60 font-manrope_1">{user.email}</div>
            </div>
            <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="absolute bottom-full left-0 right-0 mb-2 bg-[#e9e5dc] dark:bg-[#1e1b16] border border-[#d6d1c4] dark:border-[#29261f] rounded-lg shadow-lg overflow-hidden"
              >
                <div className="p-2">
                  <LogOutButton
                    variant="ghost"
                    className="w-full justify-start text-[#7e7b76] hover:text-gray-800 dark:hover:text-gray-200 text-sm font-manrope_1 hover:bg-black/5 dark:hover:bg-white/5"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>

    {/* Main Content */}
    <div className="flex-1 pl-[2rem]">
      <div className="max-w-none">
        {renderSectionContent()}
      </div>
    </div>
  </div>
</div>
  )}
    

      {/* Cancel Subscription Dialog */}
      <AnimatePresence>
        {isCancelDialogOpen && (
          <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0, ease: "easeOut" }}
            >
          <DialogContent className="max-w-md bg-[#f5f2ea] dark:bg-[#0f0c05]">
          <DialogHeader>
            <DialogTitle className="text-lg font-manrope_1 font-bold text-gray-900 dark:text-white">
              Cancel your subscription?
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <p className="text-sm text-[#7e7b76] font-manrope_1">
              If you cancel your subscription:
            </p>
            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300 font-manrope_1">
              <li>• You will lose access to premium features</li>
              <li>• Your subscription will remain active until the end of your billing period</li>
              <li>• You won't be charged again after your current billing period</li>
            </ul>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => setIsCancelDialogOpen(false)}
              className="font-manrope_1"
            >
              Cancel
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white font-manrope_1"
              onClick={() => {
                // Handle cancellation logic here
                setIsCancelDialogOpen(false)
              }}
            >
              Cancel subscription
            </Button>
          </div>
          </DialogContent>
            </motion.div>
          </Dialog>
        )}
      </AnimatePresence>

      {/* Payment History Dialog */}
      <AnimatePresence>
        {isPaymentHistoryOpen && (
          <Dialog open={isPaymentHistoryOpen} onOpenChange={setIsPaymentHistoryOpen}>
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0, ease: "easeOut" }}
            >
          <DialogContent className="max-w-[92vw] md:max-w-xl bg-[#f5f2ea] dark:bg-[#0f0c05]">
          <DialogHeader>
            <DialogTitle className="text-lg font-manrope_1 font-bold text-gray-900 dark:text-white">
              Payment History
            </DialogTitle>
          </DialogHeader>

  <div className="space-y-4 mt-4">
    {formatBillingHistory().length > 0 ? (
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {formatBillingHistory().map((item, index) => (
          <div key={index} className="py-4 flex justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {item.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </p>
              <p className="text-sm text-gray-500">{item.date}</p>
            </div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              ${item.amount?.toFixed(2) || '0.00'}
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="text-center py-8">
        <p className="text-[#7e7b76] font-manrope_1">No payment history available</p>
        <p className="text-sm text-[#7e7b76] font-manrope_1 mt-2">
          Your payment history will appear here once you have an active subscription.
        </p>
      </div>
    )}
  </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => setIsPaymentHistoryOpen(false)}
              className="font-manrope_1 cursor-pointer"
            >
              Close
            </Button>
          </div>
          </DialogContent>
            </motion.div>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  )
}