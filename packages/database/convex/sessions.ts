//packages/database/convex/sessions.ts
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get session by token
export const getByToken = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .unique();
  },
});

// Get sessions by user ID
export const getByUserId = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("sessions")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

// Create session
export const create = mutation({
  args: {
    userId: v.id("users"),
    token: v.string(),
    expiresAt: v.number(),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    impersonatedBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("sessions", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Update session
export const update = mutation({
  args: {
    id: v.id("sessions"),
    expiresAt: v.optional(v.number()),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    return await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// Delete session
export const remove = mutation({
  args: { id: v.id("sessions") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
  },
});

// Delete session by token
export const removeByToken = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .unique();

    if (session) {
      return await ctx.db.delete(session._id);
    }
    return null;
  },
});

// Clean up expired sessions
export const cleanupExpired = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const expiredSessions = await ctx.db
      .query("sessions")
      .withIndex("by_expires_at", (q) => q.lt("expiresAt", now))
      .collect();

    for (const session of expiredSessions) {
      await ctx.db.delete(session._id);
    }

    return expiredSessions.length;
  },
});

// Get session statistics for admin dashboard
export const getSessionStats = query({
  args: {},
  handler: async (ctx) => {
    const allSessions = await ctx.db.query("sessions").collect();
    const now = Date.now();

    // Calculate active vs expired sessions
    const activeSessions = allSessions.filter(session => session.expiresAt > now).length;
    const expiredSessions = allSessions.filter(session => session.expiresAt <= now).length;

    // Calculate recent sessions (last 24 hours)
    const oneDayAgo = now - (24 * 60 * 60 * 1000);
    const recentSessions = allSessions.filter(session => session.createdAt >= oneDayAgo).length;

    return {
      totalSessions: allSessions.length,
      activeSessions,
      expiredSessions,
      recentSessions,
    };
  },
});
