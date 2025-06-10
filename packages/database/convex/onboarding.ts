//packages/database/convex/onboarding.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Mark user as having completed onboarding
 */
export const completeOnboarding = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, { userId }) => {
    const now = Date.now();
    
    await ctx.db.patch(userId, {
      hasCompletedOnboarding: true,
      onboardingCompletedAt: now,
      updatedAt: now,
    });

    return { success: true };
  },
});

/**
 * Mark user as having activated their trial
 */
export const activateTrial = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, { userId }) => {
    const now = Date.now();
    
    await ctx.db.patch(userId, {
      hasActivatedTrial: true,
      trialActivatedAt: now,
      updatedAt: now,
    });

    return { success: true };
  },
});

/**
 * Check if user has completed onboarding
 */
export const hasCompletedOnboarding = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, { userId }) => {
    const user = await ctx.db.get(userId);
    return user?.hasCompletedOnboarding ?? false;
  },
});

/**
 * Check if user has activated trial
 */
export const hasActivatedTrial = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, { userId }) => {
    const user = await ctx.db.get(userId);
    return user?.hasActivatedTrial ?? false;
  },
});

/**
 * Get user's trial and onboarding status
 */
export const getUserOnboardingStatus = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, { userId }) => {
    const user = await ctx.db.get(userId);
    
    if (!user) {
      return null;
    }

    return {
      hasCompletedOnboarding: user.hasCompletedOnboarding ?? false,
      hasActivatedTrial: user.hasActivatedTrial ?? false,
      trialActivatedAt: user.trialActivatedAt,
      onboardingCompletedAt: user.onboardingCompletedAt,
      isNewUser: !user.hasCompletedOnboarding && !user.hasActivatedTrial,
    };
  },
});

/**
 * Get user by email (for web app login matching)
 */
export const getUserByEmail = query({
  args: {
    email: v.string(),
  },
  handler: async (ctx, { email }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (!user) {
      return null;
    }

    return {
      id: user._id,
      email: user.email,
      name: user.name,
      firstName: user.firstName,
      lastName: user.lastName,
      hasCompletedOnboarding: user.hasCompletedOnboarding ?? false,
      hasActivatedTrial: user.hasActivatedTrial ?? false,
      trialActivatedAt: user.trialActivatedAt,
    };
  },
});

/**
 * Store selected plan from mobile for web checkout
 */
export const storePendingPlan = mutation({
  args: {
    userId: v.id("users"),
    planId: v.string(),
    billing: v.optional(v.string()),
  },
  handler: async (ctx, { userId, planId, billing = "monthly" }) => {
    const now = Date.now();
    
    // Store in user metadata or create a separate pending_plans table
    await ctx.db.patch(userId, {
      updatedAt: now,
    });

    // For now, we'll use the checkout_sessions table to store pending plan
    const sessionId = `pending_${userId}_${now}`;
    
    await ctx.db.insert("checkout_sessions", {
      sessionId,
      userId: userId,
      productId: planId,
      platform: "mobile_to_web",
      status: "pending",
      checkoutUrl: "",
      successUrl: "",
      cancelUrl: "",
      expiresAt: now + (30 * 60 * 1000), // 30 minutes
      metadata: {
        billing,
        fromMobile: true,
        createdForOnboarding: true,
      },
      createdAt: now,
      updatedAt: now,
    });

    return { sessionId, success: true };
  },
});

/**
 * Get pending plan for user (for web checkout)
 */
export const getPendingPlan = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, { userId }) => {
    const pendingSession = await ctx.db
      .query("checkout_sessions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => 
        q.and(
          q.eq(q.field("status"), "pending"),
          q.eq(q.field("platform"), "mobile_to_web"),
          q.gt(q.field("expiresAt"), Date.now())
        )
      )
      .order("desc")
      .first();

    if (!pendingSession) {
      return null;
    }

    return {
      planId: pendingSession.productId,
      billing: (pendingSession.metadata as any)?.billing ?? "monthly",
      sessionId: pendingSession.sessionId,
      expiresAt: pendingSession.expiresAt,
    };
  },
});

/**
 * Clear pending plan (after successful checkout or expiry)
 */
export const clearPendingPlan = mutation({
  args: {
    sessionId: v.string(),
  },
  handler: async (ctx, { sessionId }) => {
    const session = await ctx.db
      .query("checkout_sessions")
      .withIndex("by_session_id", (q) => q.eq("sessionId", sessionId))
      .first();

    if (session) {
      await ctx.db.patch(session._id, {
        status: "completed",
        updatedAt: Date.now(),
      });
    }

    return { success: true };
  },
});
