# Billing Integration Summary

## Changes Made

### 1. Mobile App Improvements

#### OnboardingFlow.tsx
- **Replaced custom pricing buttons** with the new `MobilePricingTable` component
- **Moved function declarations** before the onboardingSteps array to fix hoisting issues
- **Maintained subscription flow** that redirects to web app for Autumn checkout
- **Added skip functionality** for users who want to complete onboarding without subscribing

#### MobilePricingTable.tsx (New Component)
- **Created reusable pricing component** that matches your Autumn plan structure
- **Supports both monthly and yearly billing** with savings calculation
- **Shows proper trial messaging** when enabled
- **Handles plan selection** with custom callback or default web redirect
- **Responsive design** that works well in mobile onboarding flow

### 2. Web App Improvements

#### Account Page (apps/start-basic/src/routes/account/index.tsx)
- **Enabled Convex queries** that were previously commented out
- **Removed upgrade/downgrade functionality** - now directs users to mobile app
- **Enhanced billing section** with trial status display
- **Added proper trial countdown** and billing date information
- **Kept only cancellation functionality** for subscription management
- **Improved subscription status display** with real data from Convex and Autumn

### 3. Database Integration

#### Convex API Import Fix
- **Fixed import path** from `'database/convex/_generated/api'` to `'database'`
- **Enabled real data queries** for subscriptions, onboarding, and billing
- **Uses existing Autumn handler** at `/api/autumn/$` (no separate webhook needed)
- **Leverages Autumn's built-in Convex integration** for automatic data sync

## Current Flow

### Mobile Onboarding
1. User completes OAuth signup in mobile app
2. User goes through onboarding steps
3. **New**: User sees `MobilePricingTable` with proper Autumn plans
4. User selects plan and billing cycle
5. Mobile app redirects to web login with subscription metadata
6. Web app authenticates user and redirects to Autumn Stripe checkout
7. After successful payment, user returns to mobile app

### Web Admin Dashboard
1. **Simplified account page** shows subscription status only
2. **Trial information** displayed prominently when active
3. **Billing dates** and payment method info shown
4. **Cancellation only** - no upgrade/downgrade options
5. **Directs users to mobile** for plan changes

### Database Sync
1. **Autumn's built-in integration** automatically syncs subscription data to Convex
2. **Trial activation** tracked in user records via existing Convex functions
3. **Real-time updates** between web and mobile apps through shared Convex database
4. **Uses existing `/api/autumn/$` handler** for all Autumn-related API calls

## Recommendations

### Next Steps
1. **Test the integration** by running both apps and going through the onboarding flow
2. **Set up proper Stripe products** in Autumn that match your plan IDs (foundation_plan, performance_plan, champion_plan)
3. **Test subscription cancellation** flow in the web app
4. **Verify trial tracking** works correctly
5. **Test real subscription data** appears in account page

### Mobile App Settings Page
- Consider adding a settings page in mobile app for subscription management
- Use Autumn's `PaywallDialog` component for feature gates
- Implement proper usage tracking for metered features

### Error Handling
- Add proper error handling for failed payments
- Implement retry logic for webhook processing
- Add user-friendly error messages for subscription issues

## Files Modified
- `apps/mobile/components/OnboardingFlow.tsx` - Updated to use MobilePricingTable
- `apps/start-basic/src/routes/account/index.tsx` - Fixed Convex imports and simplified to admin-only view
- `apps/mobile/components/MobilePricingTable.tsx` - New component

## Files to Configure
- Stripe product configuration in Autumn dashboard
- Plan IDs in Autumn: foundation_plan, performance_plan, champion_plan

The integration now properly separates concerns:
- **Mobile app**: User signup, onboarding, and subscription selection
- **Web app**: Admin dashboard with subscription viewing and cancellation
- **Autumn**: Handles all payment processing and subscription management
- **Convex**: Stores user data and subscription status for both apps
