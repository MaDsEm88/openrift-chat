/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as accounts from "../accounts.js";
import type * as auth_adapter from "../auth_adapter.js";
import type * as billing from "../billing.js";
import type * as cache from "../cache.js";
import type * as onboarding from "../onboarding.js";
import type * as sessions from "../sessions.js";
import type * as setup_products from "../setup_products.js";
import type * as subscriptions from "../subscriptions.js";
import type * as users from "../users.js";
import type * as verifications from "../verifications.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  accounts: typeof accounts;
  auth_adapter: typeof auth_adapter;
  billing: typeof billing;
  cache: typeof cache;
  onboarding: typeof onboarding;
  sessions: typeof sessions;
  setup_products: typeof setup_products;
  subscriptions: typeof subscriptions;
  users: typeof users;
  verifications: typeof verifications;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
