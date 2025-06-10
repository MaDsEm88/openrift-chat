
//packages/database/convex/users.ts
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get user by ID
export const getById = query({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get user by email
export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();
  },
});

// Create user
export const create = mutation({
  args: {
    name: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    emailVerified: v.optional(v.boolean()),
    image: v.optional(v.string()),
    role: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("users", {
      ...args,
      emailVerified: args.emailVerified ?? false,
      role: args.role ?? "user",
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Update user
export const update = mutation({
  args: {
    id: v.id("users"),
    name: v.optional(v.string()),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerified: v.optional(v.boolean()),
    image: v.optional(v.string()),
    role: v.optional(v.string()),
    banned: v.optional(v.boolean()),
    banReason: v.optional(v.string()),
    banExpires: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    return await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// Count users
export const count = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    return users.length;
  },
});

// Count recent users (last 30 days)
export const countRecent = query({
  args: { daysAgo: v.number() },
  handler: async (ctx, args) => {
    const cutoffDate = Date.now() - (args.daysAgo * 24 * 60 * 60 * 1000);
    const users = await ctx.db
      .query("users")
      .withIndex("by_created_at", (q) => q.gte("createdAt", cutoffDate))
      .collect();
    return users.length;
  },
});

// Get all users (for admin)
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  },
});

// Delete user
export const remove = mutation({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
  },
});

// Get recent users with details (for admin dashboard)
export const getRecentUsers = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    return await ctx.db
      .query("users")
      .withIndex("by_created_at")
      .order("desc")
      .take(limit);
  },
});

// Get user statistics for admin dashboard
export const getAdminStats = query({
  args: {},
  handler: async (ctx) => {
    const allUsers = await ctx.db.query("users").collect();
    const now = Date.now();

    // Calculate time periods
    const oneDayAgo = now - (24 * 60 * 60 * 1000);
    const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = now - (30 * 24 * 60 * 60 * 1000);

    // Count users by time period
    const totalUsers = allUsers.length;
    const usersToday = allUsers.filter(user => user.createdAt >= oneDayAgo).length;
    const usersThisWeek = allUsers.filter(user => user.createdAt >= oneWeekAgo).length;
    const usersThisMonth = allUsers.filter(user => user.createdAt >= oneMonthAgo).length;

    // Count by role
    const adminUsers = allUsers.filter(user => user.role === "admin").length;
    const regularUsers = allUsers.filter(user => user.role === "user" || !user.role).length;

    // Count banned users
    const bannedUsers = allUsers.filter(user => user.banned === true).length;

    return {
      totalUsers,
      usersToday,
      usersThisWeek,
      usersThisMonth,
      adminUsers,
      regularUsers,
      bannedUsers,
      activeUsers: totalUsers - bannedUsers,
    };
  },
});


