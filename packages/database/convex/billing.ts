// packages/database/convex/billing.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get user's current subscription/product
export const getUserSubscription = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();

    if (!subscription) {
      return null;
    }

    // Get product details
    const product = await ctx.db
      .query("products")
      .withIndex("by_product_id", (q) => q.eq("id", subscription.productId))
      .first();

    return {
      ...subscription,
      product,
    };
  },
});

// Get user's feature usage and limits
export const getUserFeatures = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();

    if (!subscription) {
      return null;
    }

    // Get usage events for current billing period
    const usageEvents = await ctx.db
      .query("usage_events")
      .withIndex("by_user_feature", (q) => q.eq("userId", args.userId))
      .filter((q) => 
        q.and(
          q.gte(q.field("timestamp"), subscription.currentPeriodStart || 0),
          q.lte(q.field("timestamp"), subscription.currentPeriodEnd || Date.now())
        )
      )
      .collect();

    // Group usage by feature
    const featureUsage = usageEvents.reduce((acc, event) => {
      if (!acc[event.featureId]) {
        acc[event.featureId] = 0;
      }
      acc[event.featureId] += event.amount;
      return acc;
    }, {} as Record<string, number>);

    return {
      subscription,
      usage: featureUsage,
      billingPeriod: {
        start: subscription.currentPeriodStart,
        end: subscription.currentPeriodEnd,
      },
    };
  },
});

// Create or update subscription after Autumn payment
export const fulfillAutumnPayment = mutation({
  args: {
    userId: v.string(),
    productId: v.string(),
    autumnCustomerId: v.string(),
    subscriptionData: v.object({
      status: v.union(
        v.literal("active"),
        v.literal("canceled"),
        v.literal("past_due"),
        v.literal("trialing"),
        v.literal("incomplete"),
        v.literal("incomplete_expired"),
        v.literal("unpaid")
      ),
      currentPeriodStart: v.optional(v.number()),
      currentPeriodEnd: v.optional(v.number()),
      cancelAtPeriodEnd: v.optional(v.boolean()),
      metadata: v.optional(v.object({})),
    }),
  },
  handler: async (ctx, args) => {
    try {
      // Check if user already has an active subscription
      const existingSubscription = await ctx.db
        .query("subscriptions")
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .filter((q) => q.eq(q.field("status"), "active"))
        .first();

      // Get product details
      const product = await ctx.db
        .query("products")
        .withIndex("by_product_id", (q) => q.eq("id", args.productId))
        .first();

      if (!product) {
        return {
          success: false,
          error: `Product ${args.productId} not found`,
        };
      }

      const subscriptionData = {
        userId: args.userId,
        productId: args.productId,
        platform: "autumn" as const,
        externalId: args.autumnCustomerId,
        autumnCustomerId: args.autumnCustomerId,
        status: args.subscriptionData.status,
        currentPeriodStart: args.subscriptionData.currentPeriodStart || Date.now(),
        currentPeriodEnd: args.subscriptionData.currentPeriodEnd || (Date.now() + 30 * 24 * 60 * 60 * 1000),
        cancelAtPeriodEnd: args.subscriptionData.cancelAtPeriodEnd || false,
        metadata: args.subscriptionData.metadata || {},
        updatedAt: Date.now(),
      };

      let subscriptionId;

      if (existingSubscription) {
        // Update existing subscription (upgrade/downgrade)
        await ctx.db.patch(existingSubscription._id, subscriptionData);
        subscriptionId = existingSubscription._id;
      } else {
        // Create new subscription
        subscriptionId = await ctx.db.insert("subscriptions", {
          ...subscriptionData,
          createdAt: Date.now(),
        });
      }

      // Record billing event
      await ctx.db.insert("billing_events", {
        userId: args.userId,
        type: "subscription_created",
        subscriptionId: subscriptionId.toString(),
        externalId: args.autumnCustomerId,
        platform: "autumn",
        data: args.subscriptionData,
        processed: true,
        createdAt: Date.now(),
      });

      // Update user onboarding status in users table
      const user = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", args.userId))
        .first();

      if (user) {
        await ctx.db.patch(user._id, {
          hasCompletedOnboarding: true,
          subscriptionActivatedAt: Date.now(),
          updatedAt: Date.now(),
        });
      } else {
        // If we have a user ID instead of email, try to find by ID
        console.warn("Could not find user to update onboarding status");
      }

      return {
        success: true,
        subscriptionId: subscriptionId.toString(),
        productId: args.productId,
        billingCycle: product.interval,
      };
    } catch (error) {
      console.error("Error fulfilling Autumn payment:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  },
});

// Record usage for metered features
export const recordUsageEvent = mutation({
  args: {
    userId: v.string(),
    featureId: v.string(),
    amount: v.number(),
    metadata: v.optional(v.object({})),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("usage_events", {
      userId: args.userId,
      featureId: args.featureId,
      amount: args.amount,
      timestamp: Date.now(),
      metadata: args.metadata || {},
    });
  },
});

// Get user's billing history
export const getUserBillingHistory = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const events = await ctx.db
      .query("billing_events")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(50);

    return events;
  },
});

// Cancel subscription
export const cancelSubscription = mutation({
  args: {
    userId: v.string(),
    cancelAtPeriodEnd: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();

    if (!subscription) {
      return {
        success: false,
        error: "No active subscription found",
      };
    }

    const updates = args.cancelAtPeriodEnd 
      ? { cancelAtPeriodEnd: true, updatedAt: Date.now() }
      : { status: "canceled" as const, updatedAt: Date.now() };

    await ctx.db.patch(subscription._id, updates);

    // Record billing event
    await ctx.db.insert("billing_events", {
      userId: args.userId,
      type: "subscription_canceled",
      subscriptionId: subscription._id.toString(),
      externalId: subscription.externalId || (subscription as any).autumnCustomerId || "",
      platform: "autumn",
      data: { cancelAtPeriodEnd: args.cancelAtPeriodEnd || false },
      processed: true,
      createdAt: Date.now(),
    });

    return {
      success: true,
      cancelAtPeriodEnd: args.cancelAtPeriodEnd || false,
    };
  },
});

// Create or update a product (for syncing with Autumn products)
export const upsertProduct = mutation({
  args: {
    id: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    price: v.number(),
    currency: v.string(),
    interval: v.union(v.literal("month"), v.literal("year")),
    features: v.array(v.string()),
    active: v.boolean(),
    metadata: v.optional(v.object({})),
    stripeProductId: v.optional(v.string()),
    stripePriceId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("products")
      .withIndex("by_product_id", (q) => q.eq("id", args.id))
      .first();

    const productData = {
      id: args.id,
      name: args.name,
      description: args.description || "",
      price: args.price,
      currency: args.currency,
      interval: args.interval,
      features: args.features,
      active: args.active,
      stripeProductId: args.stripeProductId,
      stripePriceId: args.stripePriceId,
      updatedAt: Date.now(),
    };

    if (existing) {
      await ctx.db.patch(existing._id, productData);
      return existing._id;
    } else {
      return await ctx.db.insert("products", {
        ...productData,
        createdAt: Date.now(),
      });
    }
  },
});

// Get all active products
export const getProducts = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("products")
      .withIndex("by_active", (q) => q.eq("active", true))
      .collect();
  },
});