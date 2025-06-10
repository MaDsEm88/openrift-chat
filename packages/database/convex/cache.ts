import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get cache entry by key
export const getByKey = query({
  args: { key: v.string() },
  handler: async (ctx, args) => {
    const entry = await ctx.db
      .query("cacheEntries")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .unique();

    // Check if entry is expired
    if (entry && entry.expiresAt && entry.expiresAt < Date.now()) {
      // Delete expired entry (this needs to be done in a mutation, not a query)
      // For now, just return null and let cleanup handle expired entries
      return null;
    }

    return entry;
  },
});

// Set cache entry (upsert)
export const set = mutation({
  args: {
    key: v.string(),
    value: v.string(),
    ttl: v.optional(v.number()), // TTL in seconds
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const expiresAt = args.ttl ? now + (args.ttl * 1000) : undefined;

    // Check if entry exists
    const existing = await ctx.db
      .query("cacheEntries")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .unique();

    if (existing) {
      // Update existing entry
      return await ctx.db.patch(existing._id, {
        value: args.value,
        expiresAt,
        updatedAt: now,
      });
    } else {
      // Create new entry
      return await ctx.db.insert("cacheEntries", {
        key: args.key,
        value: args.value,
        expiresAt,
        createdAt: now,
        updatedAt: now,
      });
    }
  },
});

// Delete cache entry by key
export const removeByKey = mutation({
  args: { key: v.string() },
  handler: async (ctx, args) => {
    const entry = await ctx.db
      .query("cacheEntries")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .unique();

    if (entry) {
      return await ctx.db.delete(entry._id);
    }
    return null;
  },
});

// Clean up expired cache entries
export const cleanupExpired = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const expiredEntries = await ctx.db
      .query("cacheEntries")
      .withIndex("by_expires_at", (q) => q.lt("expiresAt", now))
      .collect();

    for (const entry of expiredEntries) {
      await ctx.db.delete(entry._id);
    }

    return expiredEntries.length;
  },
});

// Get cache statistics
export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const allEntries = await ctx.db.query("cacheEntries").collect();
    const now = Date.now();

    const total = allEntries.length;
    const expired = allEntries.filter(entry =>
      entry.expiresAt && entry.expiresAt < now
    ).length;

    return {
      total,
      expired,
      active: total - expired,
    };
  },
});



// Clear all cache entries
export const clearAll = mutation({
  args: {},
  handler: async (ctx) => {
    const allEntries = await ctx.db.query("cacheEntries").collect();

    for (const entry of allEntries) {
      await ctx.db.delete(entry._id);
    }

    return allEntries.length;
  },
});
