//packages/database/convex/accounts.ts
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get account by provider and account ID
export const getByProviderAccount = query({
  args: { providerId: v.string(), accountId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("accounts")
      .withIndex("by_provider_account", (q) => 
        q.eq("providerId", args.providerId).eq("accountId", args.accountId)
      )
      .unique();
  },
});

// Get accounts by user ID
export const getByUserId = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("accounts")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

// Create account
export const create = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("accounts", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Update account
export const update = mutation({
  args: {
    id: v.id("accounts"),
    accessToken: v.optional(v.string()),
    refreshToken: v.optional(v.string()),
    accessTokenExpiresAt: v.optional(v.number()),
    refreshTokenExpiresAt: v.optional(v.number()),
    scope: v.optional(v.string()),
    idToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    return await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// Delete account
export const remove = mutation({
  args: { id: v.id("accounts") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
  },
});

// Delete accounts by user ID
export const removeByUserId = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const accounts = await ctx.db
      .query("accounts")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .collect();
    
    for (const account of accounts) {
      await ctx.db.delete(account._id);
    }
    
    return accounts.length;
  },
});
