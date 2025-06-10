// convex/subscriptions.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getUserSubscription = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (!subscription) {
      return { hasActiveSubscription: false, subscription: null };
    }

    const isActive =
      subscription.status === "active" &&
      subscription.currentPeriodEnd > Date.now();

    return {
      hasActiveSubscription: isActive,
      subscription,
    };
  },
});

export const updateSubscription = mutation({
  args: {
    userId: v.string(),
    platform: v.union(v.literal("stripe"), v.literal("apple"), v.literal("google")),
    externalId: v.string(),
    productId: v.string(),
    status: v.union(
      v.literal("active"),
      v.literal("canceled"),
      v.literal("past_due"),
      v.literal("trialing"),
      v.literal("incomplete"),
      v.literal("incomplete_expired"),
      v.literal("unpaid")
    ),
    currentPeriodStart: v.number(),
    currentPeriodEnd: v.number(),
    cancelAtPeriodEnd: v.optional(v.boolean()),
    canceledAt: v.optional(v.number()),
    trialStart: v.optional(v.number()),
    trialEnd: v.optional(v.number()),
    metadata: v.optional(v.object({})),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    const subscriptionData = {
      userId: args.userId,
      platform: args.platform,
      externalId: args.externalId,
      productId: args.productId,
      status: args.status,
      currentPeriodStart: args.currentPeriodStart,
      currentPeriodEnd: args.currentPeriodEnd,
      cancelAtPeriodEnd: args.cancelAtPeriodEnd,
      canceledAt: args.canceledAt,
      trialStart: args.trialStart,
      trialEnd: args.trialEnd,
      metadata: args.metadata,
      updatedAt: Date.now(),
    };

    if (existing) {
      await ctx.db.patch(existing._id, subscriptionData);
      return existing._id;
    } else {
      return await ctx.db.insert("subscriptions", {
        ...subscriptionData,
        createdAt: Date.now(),
      });
    }
  },
});

export const checkFeatureAccess = query({
  args: {
    userId: v.string(),
    featureId: v.string(),
  },
  handler: async (ctx, args) => {
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    const hasActiveSubscription = subscription
      ? (subscription.status === "active" || subscription.status === "trialing") &&
        subscription.currentPeriodEnd > Date.now()
      : false;

    // Get current usage for the feature
    const currentMonth = new Date();
    const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getTime();
    const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0, 23, 59, 59).getTime();

    const usage = await ctx.db
      .query("usage_events")
      .withIndex("by_user_feature", (q) =>
        q.eq("userId", args.userId).eq("featureId", args.featureId)
      )
      .filter((q) => q.and(
        q.gte(q.field("timestamp"), monthStart),
        q.lte(q.field("timestamp"), monthEnd)
      ))
      .collect();

    const totalUsage = usage.reduce((sum, event) => sum + event.amount, 0);

    // Define feature limits based on subscription plan
    const planId = subscription?.productId || "free";
    const featureLimits = getFeatureLimits(planId, args.featureId);

    const allowed = hasActiveSubscription || totalUsage < featureLimits.limit;

    return {
      allowed,
      hasSubscription: hasActiveSubscription,
      usage: {
        used: totalUsage,
        limit: featureLimits.limit,
        resetDate: monthEnd,
      },
      planId,
    };
  },
});

// Helper function to define feature limits per plan
function getFeatureLimits(planId: string, featureId: string) {
  const limits: Record<string, Record<string, { limit: number; unlimited?: boolean }>> = {
    free: {
      workout_plans: { limit: 3 },
      meal_scans: { limit: 5 },
      form_guidance: { limit: 0 },
      advanced_form_guidance: { limit: 0 },
      progress_photos: { limit: 3 },
      ai_coaching_sessions: { limit: 0 },
      nutrition_coaching: { limit: 0 },
      meal_planning: { limit: 1 },
    },
    foundation_plan: {
      workout_plans: { limit: -1, unlimited: true },
      meal_scans: { limit: 15 },
      form_guidance: { limit: -1, unlimited: true },
      advanced_form_guidance: { limit: 0 },
      progress_photos: { limit: 3 },
      ai_coaching_sessions: { limit: 0 },
      nutrition_coaching: { limit: 0 },
      meal_planning: { limit: 5 },
    },
    performance_plan: {
      workout_plans: { limit: -1, unlimited: true },
      meal_scans: { limit: -1, unlimited: true },
      form_guidance: { limit: -1, unlimited: true },
      advanced_form_guidance: { limit: -1, unlimited: true },
      progress_photos: { limit: -1, unlimited: true },
      ai_coaching_sessions: { limit: 0 },
      nutrition_coaching: { limit: -1, unlimited: true },
      meal_planning: { limit: -1, unlimited: true },
    },
    champion_plan: {
      workout_plans: { limit: -1, unlimited: true },
      meal_scans: { limit: -1, unlimited: true },
      form_guidance: { limit: -1, unlimited: true },
      advanced_form_guidance: { limit: -1, unlimited: true },
      progress_photos: { limit: -1, unlimited: true },
      ai_coaching_sessions: { limit: -1, unlimited: true },
      nutrition_coaching: { limit: -1, unlimited: true },
      meal_planning: { limit: -1, unlimited: true },
    },
  };

  return limits[planId]?.[featureId] || { limit: 0 };
}

export const trackFeatureUsage = mutation({
  args: {
    userId: v.string(),
    featureId: v.string(),
    amount: v.optional(v.number()),
    metadata: v.optional(v.object({})),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("usage_events", {
      userId: args.userId,
      featureId: args.featureId,
      amount: args.amount || 1,
      timestamp: Date.now(),
      metadata: args.metadata,
    });
  },
});

export const getUserUsage = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const currentMonth = new Date();
    const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getTime();
    const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0, 23, 59, 59).getTime();

    const usage = await ctx.db
      .query("usage_events")
      .withIndex("by_user_feature", (q) => q.eq("userId", args.userId))
      .filter((q) => q.and(
        q.gte(q.field("timestamp"), monthStart),
        q.lte(q.field("timestamp"), monthEnd)
      ))
      .collect();

    // Group usage by feature
    const usageByFeature: Record<string, { used: number; resetDate: number }> = {};

    usage.forEach((event) => {
      if (!usageByFeature[event.featureId]) {
        usageByFeature[event.featureId] = { used: 0, resetDate: monthEnd };
      }
      usageByFeature[event.featureId].used += event.amount;
    });

    return usageByFeature;
  },
});