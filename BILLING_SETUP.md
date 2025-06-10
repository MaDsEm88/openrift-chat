# 🔥 Billing System Setup Guide

This guide will help you set up the complete billing system in your monorepo that allows mobile apps to use web-based payments, avoiding Apple's 30% commission.

## 🎯 What This System Provides

✅ **Cross-Platform Billing**: Works on iOS, Android, and Web  
✅ **Apple Policy Compliant**: Uses web redirects (now legally allowed)  
✅ **Convex Integration**: Stores subscription data in your existing database  
✅ **Better-Auth Compatible**: Works with your current authentication  
✅ **TanStack Start Integration**: Adds billing routes to your web app  
✅ **Expo Deep Linking**: Handles return from payment flows  
✅ **Cost Savings**: ~2.9% Stripe fees vs 30% Apple commission  

## 🚀 Quick Start

### 1. Install Dependencies

The system uses Autumn.js which is already installed in your monorepo. No additional dependencies needed!

### 2. Environment Variables

Add these to your `apps/web/.env.local`:

```bash
# Autumn Configuration (for Stripe integration)
AUTUMN_SECRET_KEY=sk_test_your_autumn_secret_key

# App URLs
VITE_APP_URL=http://localhost:3000
```

### 3. Set Up Sample Products

Run this mutation in your Convex dashboard to create sample products:

```javascript
// In Convex dashboard, run this mutation:
api.setupProducts.setupSampleProducts({})
```

### 4. Configure Autumn Account

1. Sign up at [autumn.dev](https://autumn.dev)
2. Create a new project
3. Add your products in the Autumn dashboard
4. Get your secret key from the Autumn dashboard
5. Configure webhook endpoints:
   - `https://your-domain.com/api/billing/webhook`

## 📱 How It Works

### Mobile Payment Flow

1. **User taps "Subscribe"** in mobile app
2. **App creates checkout session** via Convex
3. **Redirects to web app** mobile-optimized checkout
4. **Uses Autumn + Stripe** for actual payment processing
5. **Returns to mobile app** with success/failure

### Web Admin Billing

1. **Full Autumn integration** for admin dashboard
2. **Standard web-based** checkout flows
3. **Subscription management** interface

### Unified Subscription Management

1. **All subscription data** stored in Convex
2. **Feature access checks** work across platforms
3. **Single source of truth** for billing status

## 🔧 API Endpoints

### Billing Routes (TanStack Start)

- `GET /billing/` - Admin billing dashboard
- `GET /billing/checkout/:sessionId` - Mobile checkout page
- `POST /api/billing/webhook` - Stripe webhook handler

### Convex Functions

- `api.billing.getProducts` - Get all active products
- `api.billing.createCheckoutSession` - Create mobile checkout
- `api.billing.updateCheckoutSession` - Update session status
- `api.subscriptions.getUserSubscription` - Get user subscription
- `api.subscriptions.updateSubscription` - Update subscription
- `api.subscriptions.checkFeatureAccess` - Check feature access

## 📲 Mobile Integration

### Deep Linking Setup

The mobile app is configured to handle these deep links:

- `mobile://subscription-success` - Payment successful
- `mobile://subscription-cancelled` - Payment cancelled

### Usage in Mobile App

```typescript
import { BillingManager } from '~/components/BillingManager';

// In your component
<BillingManager 
  userId={user.id} 
  userEmail={user.email} 
/>
```

## 🌐 Web Integration

### Admin Dashboard

Visit `/billing/` in your TanStack Start app to:

- Create and manage products
- View subscription analytics
- Monitor billing events

### Checkout Pages

Mobile users are redirected to `/billing/checkout/:sessionId` for payment.

## 🔒 Security Features

- **Webhook signature verification** (configure in production)
- **Session expiration** (30 minutes)
- **Duplicate event prevention**
- **Secure deep linking**

## 💰 Cost Comparison

| Payment Method | Commission | Example: $10/month |
|---------------|------------|-------------------|
| Apple IAP | 30% | $3.00 fee |
| This System | ~2.9% | $0.29 fee |
| **Savings** | **~27%** | **$2.71 saved** |

## 🚀 Production Deployment

### 1. Autumn Configuration

1. Switch to production Autumn keys
2. Configure production webhook URLs
3. Set up proper domain verification

### 2. Webhook Security

Update webhook handler to verify signatures:

```typescript
// In webhook.ts
const signature = request.headers.get('stripe-signature')
// Add proper signature verification
```

### 3. Environment Variables

Update production environment with:
- Production Autumn keys
- Production webhook secrets
- Production app URLs

## 🧪 Testing

### Test the Full Flow

1. **Start your apps**:
   ```bash
   bun dev  # Starts all apps
   ```

2. **Create products** (run setup mutation)

3. **Test mobile flow**:
   - Open mobile app
   - Navigate to billing/subscription screen
   - Tap "Subscribe"
   - Complete payment flow
   - Verify return to app

4. **Test web admin**:
   - Visit `http://localhost:3000/billing/`
   - Create/manage products
   - View subscription data

## 🆘 Troubleshooting

### Common Issues

1. **Deep linking not working**:
   - Check app.config.ts scheme configuration
   - Verify URL scheme in mobile app

2. **Checkout session expired**:
   - Sessions expire after 30 minutes
   - Create new session for retry

3. **Webhook not receiving events**:
   - Check webhook URL configuration
   - Verify network connectivity
   - Check Autumn dashboard logs

### Debug Mode

Enable debug logging by adding to your environment:

```bash
DEBUG=billing:*
```

## 📚 Next Steps

1. **Customize products** to match your app's features
2. **Style checkout pages** to match your brand
3. **Add analytics** for subscription metrics
4. **Implement usage tracking** for metered billing
5. **Add subscription management** for users

## 🎉 Success!

You now have a complete billing system that:
- Saves ~27% on payment processing fees
- Works across all platforms
- Integrates with your existing stack
- Complies with Apple's new policies

Your users can now subscribe via web payments while using your mobile app! 🚀
