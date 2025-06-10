import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Crown, Zap, Target, Check } from "lucide-react";
import { useAutumn } from "autumn-js/react";
import { useSession } from "@/lib/auth-client";
import { shouldShowTrialMessaging, getSubscriptionButtonText } from "@/lib/mobile-web-bridge";

export const PricingTable = () => {
  const { attach } = useAutumn();
  const { data: session } = useSession();
  const [loadingProduct, setLoadingProduct] = useState<string | null>(null);

  // For now, we'll assume user hasn't activated trial yet
  // In a real implementation, you'd fetch this from Convex
  const userTrialStatus = { hasActivatedTrial: false };

  // Static product data matching your Autumn setup
  const products = [
    {
      id: 'foundation_plan',
      name: 'Foundation Plan',
      prices: [
        { interval: 'month', amount: 999 }, // $9.99 in cents
        { interval: 'year', amount: 10190 } // $101.90 in cents
      ]
    },
    {
      id: 'performance_plan',
      name: 'Performance Plan',
      prices: [
        { interval: 'month', amount: 1999 }, // $19.99 in cents
        { interval: 'year', amount: 20390 } // $203.90 in cents
      ]
    },
    {
      id: 'champion_plan',
      name: 'Champion Plan',
      prices: [
        { interval: 'month', amount: 2999 }, // $29.99 in cents
        { interval: 'year', amount: 30590 } // $305.90 in cents
      ]
    }
  ];

  // Plan configurations matching your existing setup
  const planConfigs = {
    'foundation_plan': {
      name: 'Foundation Plan',
      icon: Target,
      color: '#3b82f6',
      popular: false,
      description: 'Build your fitness foundation with intelligent AI guidance',
      features: [
        'Unlimited workout plans',
        '15 meal scans per month',
        'Form guidance with AI feedback',
        '3 progress photos per month',
        '5 meal planning sessions per month'
      ]
    },
    'performance_plan': {
      name: 'Performance Plan',
      icon: Zap,
      color: '#10b981',
      popular: true,
      description: 'Optimize your performance with advanced AI coaching',
      features: [
        'Everything in Foundation',
        '50 meal scans per month',
        'Advanced form analysis',
        '10 progress photos per month',
        '15 meal planning sessions per month',
        'Workout intensity optimization',
        'Recovery recommendations'
      ]
    },
    'champion_plan': {
      name: 'Champion Plan',
      icon: Crown,
      color: '#f59e0b',
      popular: false,
      description: 'Elite-level training with unlimited AI coaching',
      features: [
        'Everything in Performance',
        'Unlimited meal scans',
        'Real-time form correction',
        'Unlimited progress photos',
        'Unlimited meal planning',
        'Personalized nutrition coaching',
        'Priority support'
      ]
    }
  };

  const handleSubscribe = async (productId: string) => {
    setLoadingProduct(productId);
    try {
      await attach({
        productId: productId,
      });
    } catch (error) {
      console.error('Error starting subscription:', error);
    } finally {
      setLoadingProduct(null);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white font-manrope_1 mb-4">
          Choose Your Plan
        </h2>
        <p className="text-lg text-[#7e7b76] font-manrope_1">
          Start your 7-day free trial and unlock AI-powered fitness coaching
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {products.map((product) => {
          const config = planConfigs[product.id as keyof typeof planConfigs];
          if (!config) return null;

          const IconComponent = config.icon;
          const isProcessing = loadingProduct === product.id;
          const monthlyPrice = product.prices?.find(p => p.interval === 'month')?.amount || 0;
          const yearlyPrice = product.prices?.find(p => p.interval === 'year')?.amount || 0;

          return (
            <Card
              key={product.id}
              className={`relative ${config.popular ? 'border-primary border-2 shadow-lg' : 'border-gray-200 dark:border-gray-600'}`}
            >
              {config.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                  <Badge className="bg-primary text-primary-foreground font-manrope_1">
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="pb-4">
                <div className="flex items-center mb-2">
                  <IconComponent size={24} color={config.color} className="mr-2" />
                  <CardTitle className="text-lg font-manrope_1">{config.name}</CardTitle>
                </div>

                <div className="flex items-baseline mb-2">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white font-manrope_1">
                    ${(monthlyPrice / 100).toFixed(2)}
                  </span>
                  <span className="text-[#7e7b76] ml-1 font-manrope_1">/month</span>
                </div>

                {yearlyPrice > 0 && (
                  <p className="text-sm text-green-600 font-manrope_1">
                    Save ${(((monthlyPrice * 12) - yearlyPrice) / 100).toFixed(0)}/year with annual billing
                  </p>
                )}

                <p className="text-[#7e7b76] text-sm font-manrope_1">
                  {config.description}
                </p>
              </CardHeader>

              <CardContent>
                <div className="space-y-3 mb-6">
                  {config.features.map((feature, index) => (
                    <div key={index} className="flex items-start">
                      <Check size={16} color="#22c55e" className="mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700 dark:text-gray-300 font-manrope_1">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={() => handleSubscribe(product.id)}
                  disabled={isProcessing}
                  className={`w-full font-manrope_1 ${config.popular ? 'bg-primary hover:bg-primary/90' : ''}`}
                  style={!config.popular ? { backgroundColor: config.color } : undefined}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    getSubscriptionButtonText(userTrialStatus)
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
