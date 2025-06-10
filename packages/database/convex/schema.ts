//packages/database/convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    emailVerified: v.boolean(),
    image: v.optional(v.string()),
    role: v.optional(v.string()),
    banned: v.optional(v.boolean()),
    banReason: v.optional(v.string()),
    banExpires: v.optional(v.number()),
    // Trial and onboarding tracking
    hasCompletedOnboarding: v.optional(v.boolean()),
    hasActivatedTrial: v.optional(v.boolean()),
    trialActivatedAt: v.optional(v.number()),
    onboardingCompletedAt: v.optional(v.number()),
    subscriptionActivatedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_role", ["role"])
    .index("by_created_at", ["createdAt"]),

  sessions: defineTable({
    userId: v.id("users"),
    token: v.string(),
    expiresAt: v.number(),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    impersonatedBy: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user_id", ["userId"])
    .index("by_token", ["token"])
    .index("by_expires_at", ["expiresAt"]),

  accounts: defineTable({
    userId: v.id("users"),
    accountId: v.string(),
    providerId: v.string(),
    accessToken: v.optional(v.string()),
    refreshToken: v.optional(v.string()),
    accessTokenExpiresAt: v.optional(v.number()),
    refreshTokenExpiresAt: v.optional(v.number()),
    scope: v.optional(v.string()),
    idToken: v.optional(v.string()),
    password: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user_id", ["userId"])
    .index("by_provider_account", ["providerId", "accountId"]),

  verifications: defineTable({
    identifier: v.string(),
    value: v.string(),
    expiresAt: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_identifier", ["identifier"])
    .index("by_identifier_value", ["identifier", "value"])
    .index("by_expires_at", ["expiresAt"]),

  mobilePasskeys: defineTable({
    userId: v.id("users"),
    credentialId: v.string(),
    publicKey: v.string(),
    counter: v.number(),
    platform: v.string(),
    lastUsed: v.string(),
    status: v.string(),
    createdAt: v.string(),
    updatedAt: v.string(),
    revokedAt: v.optional(v.string()),
    revokedReason: v.optional(v.string()),
    metadata: v.optional(v.string()),
    aaguid: v.optional(v.string()),
  })
    .index("by_user_id", ["userId"])
    .index("by_credential_id", ["credentialId"]),

  passkeysChallenges: defineTable({
    userId: v.string(),
    challenge: v.string(),
    type: v.string(),
    createdAt: v.string(),
    expiresAt: v.string(),
  })
    .index("by_user_id", ["userId"])
    .index("by_challenge", ["challenge"]),

  cacheEntries: defineTable({
    key: v.string(),
    value: v.string(),
    expiresAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_key", ["key"])
    .index("by_expires_at", ["expiresAt"]),

  // Billing and Subscription Tables
  products: defineTable({
    id: v.string(),
    name: v.string(),
    description: v.string(),
    price: v.number(),
    currency: v.string(),
    interval: v.union(v.literal("month"), v.literal("year")),
    features: v.array(v.string()),
    active: v.boolean(),
    stripeProductId: v.optional(v.string()),
    stripePriceId: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_product_id", ["id"])
    .index("by_stripe_product", ["stripeProductId"])
    .index("by_active", ["active"]),

  subscriptions: defineTable({
    userId: v.string(),
    platform: v.union(v.literal("stripe"), v.literal("apple"), v.literal("google"), v.literal("autumn")),
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
    autumnCustomerId: v.optional(v.string()), 
    metadata: v.optional(v.object({})),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_external_id", ["externalId"])
    .index("by_status", ["status"])
    .index("by_platform", ["platform"])
    .index("by_autumn_customer", ["autumnCustomerId"]),

  checkout_sessions: defineTable({
    sessionId: v.string(),
    userId: v.string(),
    productId: v.string(),
    platform: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("completed"),
      v.literal("expired"),
      v.literal("canceled")
    ),
    checkoutUrl: v.string(),
    successUrl: v.string(),
    cancelUrl: v.string(),
    expiresAt: v.number(),
    metadata: v.optional(v.object({})),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_session_id", ["sessionId"])
    .index("by_user", ["userId"])
    .index("by_status", ["status"]),

  usage_events: defineTable({
    userId: v.string(),
    featureId: v.string(),
    amount: v.number(),
    timestamp: v.number(),
    metadata: v.optional(v.object({})),
  })
    .index("by_user_feature", ["userId", "featureId"])
    .index("by_timestamp", ["timestamp"]),

  billing_events: defineTable({
    userId: v.string(),
    type: v.union(
      v.literal("subscription_created"),
      v.literal("subscription_updated"),
      v.literal("subscription_canceled"),
      v.literal("payment_succeeded"),
      v.literal("payment_failed"),
      v.literal("invoice_created"),
      v.literal("checkout_session_completed")
    ),
    subscriptionId: v.optional(v.string()),
    externalId: v.string(), 
    platform: v.string(),
    data: v.object({}),
    processed: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_type", ["type"])
    .index("by_external_id", ["externalId"])
    .index("by_processed", ["processed"]),
});
