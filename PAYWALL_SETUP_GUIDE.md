# Mobile Paywall System Setup Guide

This guide explains how to set up the mobile paywall system that redirects to your TanStack Start web app for subscription management using Autumn.

## 🏗️ Architecture Overview

```
Mobile App (Expo) → Feature Gate → Paywall Modal → Direct URL → Web App (TanStack Start) → Autumn → Stripe
                                                                                              ↓
                                                                Success/Cancel → Deep Link Back to Mobile
```

**Simplified Flow**: No session management needed - mobile app directly opens web checkout with plan parameters.

## 📱 What's Been Implemented

### Mobile App Components

1. **Pricing Screen** (`apps/mobile/app/(flows)/pricing.tsx`)
   - Displays your 3 Autumn plans (Foundation, Performance, Champion)
   - Handles monthly/yearly billing toggle
   - Redirects to web app for checkout

2. **Paywall Modal** (`apps/mobile/components/PaywallModal.tsx`)
   - Reusable component for feature restrictions
   - Shows usage limits and recommended upgrades
   - Integrates with pricing screen

3. **Subscription Status** (`apps/mobile/components/SubscriptionStatus.tsx`)
   - Displays current plan and usage information
   - Shows renewal dates and cancellation status

4. **Feature Access Hook** (`apps/mobile/hooks/useFeatureAccess.ts`)
   - Easy-to-use hook for feature gating
   - Tracks usage and shows paywalls automatically
   - Includes predefined feature constants

5. **Success/Cancel Screens**
   - Handle deep link returns from web checkout
   - Provide user feedback and next steps

### Web App Integration

1. **Updated Checkout Page** (`apps/start-basic/src/routes/account/billing/checkout/index.tsx`)
   - Integrates with Autumn for actual payments
   - Handles mobile-specific redirects
   - Shows plan details and features

2. **Autumn Integration**
   - Already configured in your TanStack Start app
   - API endpoint at `/api/autumn/$`
   - Provider setup in `__root.tsx`

### Database Functions

1. **Enhanced Subscription Functions** (`packages/database/convex/subscriptions.ts`)
   - Feature access checking with usage limits
   - Usage tracking per feature
   - Plan-based feature limits

## 🚀 Setup Instructions

### 1. Configure Autumn Products

In your Autumn dashboard, make sure your products match these IDs:
- `foundation_plan` - Foundation Plan ($9.99/month)
- `performance_plan` - Performance Plan ($19.99/month)
- `champion_plan` - Champion Plan ($29.99/month)

### 2. Environment Variables

Add to your `apps/start-basic/.env.local`:
```bash
# Autumn Configuration
AUTUMN_SECRET_KEY=your_autumn_secret_key_here
```

### 3. Update Mobile App URLs

In `apps/mobile/app/(flows)/pricing.tsx`, update the base URL:
```typescript
const baseUrl = "https://your-domain.com"; // Replace with your actual web app URL
```

### 4. Configure Deep Links

In your `app.config.ts`, ensure your scheme is set:
```typescript
export default {
  expo: {
    scheme: "mobile", // This should match your deep link scheme
    // ... other config
  }
}
```

### 5. Enable Convex Functions

Uncomment the Convex queries in:
- `apps/mobile/hooks/useFeatureAccess.ts`
- `apps/mobile/components/BillingManager.tsx`

Once your Convex types are generated.

## 📋 Usage Examples

### Basic Feature Gating

```typescript
import { useFeatureGate, FEATURES } from "~/hooks/useFeatureAccess";

function MyComponent() {
  const workoutGate = useFeatureGate(
    FEATURES.WORKOUT_PLANS.id,
    FEATURES.WORKOUT_PLANS.description
  );

  const handleGenerateWorkout = async () => {
    await workoutGate.executeWithGate(async () => {
      // Your feature logic here
      generateWorkoutPlan();
    });
  };

  return (
    <Button onPress={handleGenerateWorkout}>
      Generate Workout Plan
    </Button>
  );
}
```

### Manual Paywall Control

```typescript
import { useFeatureAccess } from "~/hooks/useFeatureAccess";

function MyComponent() {
  const { showPaywall, paywallVisible, paywallProps, closePaywall } = useFeatureAccess();

  const handlePremiumFeature = () => {
    showPaywall("advanced_ai", "Get advanced AI coaching recommendations");
  };

  return (
    <>
      <Button onPress={handlePremiumFeature}>Premium Feature</Button>

      {paywallProps && (
        <PaywallModal
          visible={paywallVisible}
          onClose={closePaywall}
          {...paywallProps}
        />
      )}
    </>
  );
}
```

## 🔄 Flow Walkthrough

1. **User hits feature limit** in mobile app
2. **Paywall shows** with upgrade options
3. **User selects plan** → redirects to web app checkout
4. **Web app processes payment** via Autumn
5. **Success** → redirects back to mobile app with deep link
6. **Mobile app refreshes** subscription status

## 🧪 Testing

1. **Test Paywall**: Go to Dashboard → Subscription → Test Paywall
2. **Test Features**: Go to Dashboard → Subscription → Feature Examples
3. **Test Pricing**: Go to Dashboard → Subscription → View All Plans
4. **Test Checkout**: Select a plan and go through the flow

## 🔧 Customization

### Adding New Features

1. Add to `FEATURES` constant in `useFeatureAccess.ts`
2. Update feature limits in `getFeatureLimits()` in `subscriptions.ts`
3. Use `useFeatureGate` in your components

### Styling Paywalls

Modify `PaywallModal.tsx` to match your app's design system.

### Custom Plans

Update plan configurations in:
- `apps/mobile/app/(flows)/pricing.tsx`
- `apps/start-basic/src/routes/account/billing/checkout/index.tsx`

## 🚨 Important Notes

- **Apple App Store**: This system complies with Apple's guidelines by handling payments outside the app
- **Deep Links**: Make sure your mobile app scheme is registered and working
- **Autumn Setup**: Ensure your Autumn products are properly configured
- **Testing**: Test the full flow in development before going live

## 📞 Support

If you encounter issues:
1. Check Autumn dashboard for webhook events
2. Verify deep link configuration
3. Test web app checkout independently
4. Check Convex database for subscription records
