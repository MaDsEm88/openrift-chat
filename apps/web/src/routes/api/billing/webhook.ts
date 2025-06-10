// apps/start-basic/src/routes/api/billing/webhook.ts
import { createAPIFileRoute } from '@tanstack/react-start/api'
import { convex } from 'database'
import { api } from '../../../../../../convex/_generated/api'

export const APIRoute = createAPIFileRoute('/api/billing/webhook')({
  POST: async ({ request }) => {
    try {
      const body = await request.text()
      const signature = request.headers.get('stripe-signature')

      if (!signature) {
        return new Response('Missing stripe signature', { status: 400 })
      }

      // In a real implementation, you would verify the webhook signature here
      // For now, we'll just parse the event
      const event = JSON.parse(body)

      // Handle different Stripe webhook events
      switch (event.type) {
        case 'checkout.session.completed':
          await handleCheckoutSessionCompleted(event.data.object)
          break

        case 'customer.subscription.created':
        case 'customer.subscription.updated':
          await handleSubscriptionUpdated(event.data.object)
          break

        case 'customer.subscription.deleted':
          await handleSubscriptionDeleted(event.data.object)
          break

        case 'invoice.payment_succeeded':
          await handlePaymentSucceeded(event.data.object)
          break

        case 'invoice.payment_failed':
          await handlePaymentFailed(event.data.object)
          break

        default:
          console.log(`Unhandled event type: ${event.type}`)
      }

      // Record the billing event
      await convex.mutation(api.billing.recordBillingEvent, {
        userId: event.data.object.customer || 'unknown',
        type: mapEventType(event.type),
        externalId: event.id,
        platform: 'stripe',
        data: event.data.object,
      })

      return new Response('Webhook processed', { status: 200 })
    } catch (error) {
      console.error('Webhook error:', error)
      return new Response('Webhook error', { status: 500 })
    }
  },
})

async function handleCheckoutSessionCompleted(session: any) {
  // Update checkout session status
  if (session.metadata?.sessionId) {
    await convex.mutation(api.billing.updateCheckoutSession, {
      sessionId: session.metadata.sessionId,
      status: 'completed',
      metadata: { stripeSessionId: session.id },
    })
  }

  // Create or update subscription if this was a subscription checkout
  if (session.mode === 'subscription' && session.subscription) {
    // You would fetch the subscription details from Stripe here
    // and create/update the subscription in Convex
  }
}

async function handleSubscriptionUpdated(subscription: any) {
  // Map Stripe subscription to our format
  const subscriptionData = {
    userId: subscription.customer, // You might need to map customer ID to user ID
    platform: 'stripe' as const,
    externalId: subscription.id,
    productId: subscription.items.data[0]?.price?.product || 'unknown',
    status: mapSubscriptionStatus(subscription.status),
    currentPeriodStart: subscription.current_period_start * 1000,
    currentPeriodEnd: subscription.current_period_end * 1000,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    canceledAt: subscription.canceled_at ? subscription.canceled_at * 1000 : undefined,
    trialStart: subscription.trial_start ? subscription.trial_start * 1000 : undefined,
    trialEnd: subscription.trial_end ? subscription.trial_end * 1000 : undefined,
    metadata: subscription.metadata,
  }

  await convex.mutation(api.subscriptions.updateSubscription, subscriptionData)
}

async function handleSubscriptionDeleted(subscription: any) {
  const subscriptionData = {
    userId: subscription.customer,
    platform: 'stripe' as const,
    externalId: subscription.id,
    productId: subscription.items.data[0]?.price?.product || 'unknown',
    status: 'canceled' as const,
    currentPeriodStart: subscription.current_period_start * 1000,
    currentPeriodEnd: subscription.current_period_end * 1000,
    cancelAtPeriodEnd: true,
    canceledAt: Date.now(),
    trialStart: subscription.trial_start ? subscription.trial_start * 1000 : undefined,
    trialEnd: subscription.trial_end ? subscription.trial_end * 1000 : undefined,
    metadata: subscription.metadata,
  }

  await convex.mutation(api.subscriptions.updateSubscription, subscriptionData)
}

async function handlePaymentSucceeded(invoice: any) {
  // Handle successful payment
  console.log('Payment succeeded for invoice:', invoice.id)
}

async function handlePaymentFailed(invoice: any) {
  // Handle failed payment
  console.log('Payment failed for invoice:', invoice.id)
}

function mapEventType(stripeEventType: string) {
  const eventMap: Record<string, any> = {
    'checkout.session.completed': 'checkout_session_completed',
    'customer.subscription.created': 'subscription_created',
    'customer.subscription.updated': 'subscription_updated',
    'customer.subscription.deleted': 'subscription_canceled',
    'invoice.payment_succeeded': 'payment_succeeded',
    'invoice.payment_failed': 'payment_failed',
    'invoice.created': 'invoice_created',
  }

  return eventMap[stripeEventType] || 'unknown'
}

function mapSubscriptionStatus(stripeStatus: string) {
  const statusMap: Record<string, any> = {
    'active': 'active',
    'canceled': 'canceled',
    'incomplete': 'incomplete',
    'incomplete_expired': 'incomplete_expired',
    'past_due': 'past_due',
    'trialing': 'trialing',
    'unpaid': 'unpaid',
  }

  return statusMap[stripeStatus] || 'active'
}
