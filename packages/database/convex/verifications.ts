
//packages/database/convex/verifications.ts
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create a new verification
export const create = mutation({
  args: {
    identifier: v.string(),
    value: v.string(),
    expiresAt: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    return await ctx.db.insert("verifications", {
      identifier: args.identifier,
      value: args.value,
      expiresAt: args.expiresAt,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Find verification by identifier
export const getByIdentifier = query({
  args: {
    identifier: v.string(),
  },
  handler: async (ctx, args) => {
    const verification = await ctx.db
      .query("verifications")
      .withIndex("by_identifier", (q) => q.eq("identifier", args.identifier))
      .first();

    return verification;
  },
});

// Find verification by identifier and value
export const getByIdentifierAndValue = query({
  args: {
    identifier: v.string(),
    value: v.string(),
  },
  handler: async (ctx, args) => {
    const verification = await ctx.db
      .query("verifications")
      .withIndex("by_identifier_value", (q) =>
        q.eq("identifier", args.identifier).eq("value", args.value)
      )
      .first();

    return verification;
  },
});

// Update verification
export const update = mutation({
  args: {
    id: v.id("verifications"),
    value: v.optional(v.string()),
    expiresAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const now = Date.now();

    const updateData: any = {
      updatedAt: now,
    };

    if (updates.value !== undefined) {
      updateData.value = updates.value;
    }

    if (updates.expiresAt !== undefined) {
      updateData.expiresAt = updates.expiresAt;
    }

    await ctx.db.patch(id, updateData);

    return await ctx.db.get(id);
  },
});

// Remove verification by ID
export const remove = mutation({
  args: {
    id: v.id("verifications"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Remove verification by identifier
export const removeByIdentifier = mutation({
  args: {
    identifier: v.string(),
  },
  handler: async (ctx, args) => {
    const verification = await ctx.db
      .query("verifications")
      .withIndex("by_identifier", (q) => q.eq("identifier", args.identifier))
      .first();

    if (verification) {
      await ctx.db.delete(verification._id);
    }
  },
});

// Clean up expired verifications
export const cleanupExpired = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const expiredVerifications = await ctx.db
      .query("verifications")
      .withIndex("by_expires_at", (q) => q.lt("expiresAt", now))
      .collect();

    for (const verification of expiredVerifications) {
      await ctx.db.delete(verification._id);
    }

    return expiredVerifications.length;
  },
});

// Get all verifications (for debugging)
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("verifications").collect();
  },
});
