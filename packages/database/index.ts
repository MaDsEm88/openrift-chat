/// <reference types="node" />

import { ConvexHttpClient } from "convex/browser";

// Initialize Convex client
const convexUrl = process.env.CONVEX_URL || process.env.EXPO_PUBLIC_CONVEX_URL;

if (!convexUrl) {
  console.error("Available environment variables:", {
    CONVEX_URL: process.env.CONVEX_URL,
    EXPO_PUBLIC_CONVEX_URL: process.env.EXPO_PUBLIC_CONVEX_URL,
    NODE_ENV: process.env.NODE_ENV
  });
  throw new Error("CONVEX_URL, or EXPO_PUBLIC_CONVEX_URL environment variable is required");
}

console.log("Initializing Convex client with URL:", convexUrl);

// Create a singleton client instance
let convexClient: ConvexHttpClient | null = null;

export const convex = (() => {
  if (!convexClient) {
    convexClient = new ConvexHttpClient(convexUrl);
  }
  return convexClient;
})();

// Export the client as db for backward compatibility
export const db = convex;

// Export Convex types and utilities
export { ConvexHttpClient } from "convex/browser";
export type { Id } from "./convex/_generated/dataModel";

// Export the auth adapter
export { createConvexAdapter } from "./convex/auth_adapter";

// Export the API
export { api } from "./convex/_generated/api";
