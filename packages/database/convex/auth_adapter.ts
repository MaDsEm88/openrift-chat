//packages/database/convex/auth_adapter.ts
import { ConvexHttpClient } from "convex/browser";
import { createAdapter, type AdapterDebugLogs } from "better-auth/adapters";
import { api } from "./_generated/api";
import type { Id } from "./_generated/dataModel";

interface ConvexAdapterConfig {
  /**
   * Helps you debug issues with the adapter.
   */
  debugLogs?: AdapterDebugLogs;
  /**
   * If the table names in the schema are plural.
   */
  usePlural?: boolean;
}

export function createConvexAdapter(client: ConvexHttpClient, config: ConvexAdapterConfig = {}) {
  console.log("Creating Convex adapter with client:", !!client);

  if (!client) {
    throw new Error("ConvexHttpClient is required for createConvexAdapter");
  }

  // Test the connection with a delay to allow initialization
  setTimeout(async () => {
    try {
      console.log("Testing Convex connection...");
      const testResult = await client.query(api.users.count);
      console.log("Convex connection test successful. User count:", testResult);
    } catch (error) {
      console.error("Convex connection test failed:", error);
      // Don't throw here as this is just a test
    }
  }, 1000);

  return createAdapter({
    config: {
      adapterId: "convex-adapter",
      adapterName: "Convex Adapter",
      usePlural: config.usePlural ?? false,
      debugLogs: config.debugLogs ?? false,
      supportsJSON: true,
      supportsDates: true,
      supportsBooleans: true,
      supportsNumericIds: false, // Convex uses string IDs
    },
    adapter: ({ debugLog }) => {
      return {
        create: async ({ model, data, select }) => {
          debugLog?.(`Creating ${model} with data:`, data);

          try {
            let result: any;

            switch (model) {
              case "user":
                console.log("[AUTH ADAPTER] Creating user with data:", data);
                console.log("[AUTH ADAPTER] User email:", data.email);
                console.log("[AUTH ADAPTER] User name:", data.name);

                // Check if user already exists
                const existingUser = await client.query(api.users.getByEmail, { email: data.email });
                if (existingUser) {
                  console.log("[AUTH ADAPTER] User already exists with ID:", existingUser._id);
                  const userResponse = { ...existingUser, _id: existingUser._id, id: existingUser._id };
                  console.log("[AUTH ADAPTER] Returning existing user response:", userResponse);
                  return userResponse as any;
                }

                result = await client.mutation(api.users.create, {
                  name: data.name,
                  firstName: data.firstName || data.name?.split(' ')[0] || '',
                  lastName: data.lastName || data.name?.split(' ')[1] || '',
                  email: data.email,
                  emailVerified: data.emailVerified ?? false,
                  image: data.image,
                  role: data.role,
                });
                console.log("[AUTH ADAPTER] User created with ID:", result);
                const userResponse = { ...data, _id: result, id: result };
                console.log("[AUTH ADAPTER] Returning user response:", userResponse);
                return userResponse as any;

              case "session":
                result = await client.mutation(api.sessions.create, {
                  userId: data.userId as Id<"users">,
                  token: data.token,
                  expiresAt: new Date(data.expiresAt).getTime(),
                  ipAddress: data.ipAddress,
                  userAgent: data.userAgent,
                  impersonatedBy: data.impersonatedBy,
                });
                return { _id: result, id: result, ...data } as any;

              case "account":
                console.log("[AUTH ADAPTER] Creating account with data:", data);
                console.log("[AUTH ADAPTER] Account userId:", data.userId);
                console.log("[AUTH ADAPTER] Account accountId:", data.accountId);
                console.log("[AUTH ADAPTER] Account providerId:", data.providerId);
                if (!data.userId) {
                  console.log("[AUTH ADAPTER] ERROR: userId is missing from account data");
                  throw new Error("userId is required for account creation");
                }
                result = await client.mutation(api.accounts.create, {
                  userId: data.userId as Id<"users">,
                  accountId: data.accountId,
                  providerId: data.providerId,
                  accessToken: data.accessToken,
                  refreshToken: data.refreshToken,
                  accessTokenExpiresAt: data.accessTokenExpiresAt ? new Date(data.accessTokenExpiresAt).getTime() : undefined,
                  refreshTokenExpiresAt: data.refreshTokenExpiresAt ? new Date(data.refreshTokenExpiresAt).getTime() : undefined,
                  scope: data.scope,
                  idToken: data.idToken,
                  password: data.password,
                });
                return { _id: result, id: result, ...data } as any;

              case "verification":
                console.log("[AUTH ADAPTER] Creating verification with data:", data);
                console.log("[AUTH ADAPTER] Verification identifier:", data.identifier);
                console.log("[AUTH ADAPTER] Verification value:", data.value);
                console.log("[AUTH ADAPTER] Verification expiresAt:", data.expiresAt);
                const verificationResult = await client.mutation(api.verifications.create, {
                  identifier: data.identifier,
                  value: data.value,
                  expiresAt: new Date(data.expiresAt).getTime(),
                });
                console.log("[AUTH ADAPTER] Verification created with ID:", verificationResult);
                const response = {
                  _id: verificationResult,
                  id: verificationResult,
                  identifier: data.identifier,
                  value: data.value,
                  expiresAt: data.expiresAt,
                  createdAt: data.createdAt,
                  updatedAt: data.updatedAt,
                };
                console.log("[AUTH ADAPTER] Returning verification response:", response);
                return response as any;

              case "passkeyChallenge":
                // For now, return a mock passkeyChallenge
                const mockId = "temp_" + Date.now();
                return { _id: mockId, id: mockId, ...data } as any;

              default:
                throw new Error(`Unknown model: ${model}`);
            }
          } catch (error) {
            console.error(`Error creating ${model}:`, error);
            throw error;
          }
        },

        findOne: async ({ model, where, select: _select }) => {
          console.log(`[AUTH ADAPTER] Finding one ${model} with where:`, where);

          // Special debugging for verification lookups
          if (model === "verification") {
            console.log(`[AUTH ADAPTER] *** VERIFICATION LOOKUP DETECTED ***`);
            console.log(`[AUTH ADAPTER] Model: ${model}`);
            console.log(`[AUTH ADAPTER] Where conditions:`, JSON.stringify(where, null, 2));
          }

          try {
            // Convert CleanedWhere[] to a simple object for easier access
            const whereObj = where.reduce((acc: any, w: any) => {
              acc[w.field] = w.value;
              return acc;
            }, {});

            let result: any = null;

            switch (model) {
              case "user":
                if (whereObj.id) {
                  result = await client.query(api.users.getById, { id: whereObj.id as Id<"users"> });
                }
                if (whereObj.email) {
                  result = await client.query(api.users.getByEmail, { email: whereObj.email });
                }
                break;

              case "session":
                if (whereObj.token) {
                  result = await client.query(api.sessions.getByToken, { token: whereObj.token });
                }
                break;

              case "account":
                if (whereObj.providerId && whereObj.accountId) {
                  result = await client.query(api.accounts.getByProviderAccount, {
                    providerId: whereObj.providerId,
                    accountId: whereObj.accountId,
                  });
                }
                break;

              case "verification":
                console.log("[AUTH ADAPTER] Looking for verification with whereObj:", whereObj);

                // Let's first see all available verifications
                const allVerifications = await client.query(api.verifications.getAll);
                console.log("[AUTH ADAPTER] All available verifications:", allVerifications);

                if (whereObj.identifier) {
                  console.log("[AUTH ADAPTER] Searching by identifier:", whereObj.identifier);
                  result = await client.query(api.verifications.getByIdentifier, {
                    identifier: whereObj.identifier,
                  });
                  console.log("[AUTH ADAPTER] Found verification by identifier:", result);
                } else if (whereObj.state) {
                  console.log("[AUTH ADAPTER] Searching by state:", whereObj.state);
                  // Better Auth sometimes looks for verification by 'state' field
                  result = await client.query(api.verifications.getByIdentifier, {
                    identifier: whereObj.state,
                  });
                  console.log("[AUTH ADAPTER] Found verification by state:", result);
                } else if (whereObj.id) {
                  console.log("[AUTH ADAPTER] Searching by id:", whereObj.id);
                  // Try to find by ID directly
                  result = allVerifications.find(v => v._id === whereObj.id);
                  console.log("[AUTH ADAPTER] Found verification by id:", result);
                } else {
                  console.log("[AUTH ADAPTER] No identifier, state, or id provided for verification lookup");
                  result = null;
                }
                break;

              case "passkeyChallenge":
                // For now, return null (no passkeyChallenge found)
                result = null;
                break;

              default:
                throw new Error(`Unknown model: ${model}`);
            }

            // Transform Convex result to match Better Auth expectations
            if (result && result._id) {
              return {
                ...result,
                id: result._id, // Better Auth expects 'id' field
              };
            }

            return result;
          } catch (error) {
            console.error(`Error finding one ${model}:`, error);
            throw error;
          }
        },

        update: async ({ model, where, update }) => {
          console.log(`[AUTH ADAPTER] Updating ${model} with where:`, where, "update:", update);

          try {
            // Convert CleanedWhere[] to a simple object for easier access
            const whereObj = where.reduce((acc: any, w: any) => {
              acc[w.field] = w.value;
              return acc;
            }, {});

            const updateData = update as any;

            switch (model) {
              case "user":
                if (whereObj.id) {
                  await client.mutation(api.users.update, {
                    id: whereObj.id as Id<"users">,
                    ...updateData,
                  });
                  return { id: whereObj.id, ...updateData };
                }
                return null;

              case "session":
                if (whereObj.id) {
                  await client.mutation(api.sessions.update, {
                    id: whereObj.id as Id<"sessions">,
                    expiresAt: updateData.expiresAt ? new Date(updateData.expiresAt).getTime() : undefined,
                    ipAddress: updateData.ipAddress,
                    userAgent: updateData.userAgent,
                  });
                  return { id: whereObj.id, ...updateData };
                }
                return null;

              case "account":
                if (whereObj.id) {
                  await client.mutation(api.accounts.update, {
                    id: whereObj.id as Id<"accounts">,
                    accessToken: updateData.accessToken,
                    refreshToken: updateData.refreshToken,
                    accessTokenExpiresAt: updateData.accessTokenExpiresAt ? new Date(updateData.accessTokenExpiresAt).getTime() : undefined,
                    refreshTokenExpiresAt: updateData.refreshTokenExpiresAt ? new Date(updateData.refreshTokenExpiresAt).getTime() : undefined,
                    scope: updateData.scope,
                    idToken: updateData.idToken,
                  });
                  return { id: whereObj.id, ...updateData };
                }
                return null;

              case "verification":
              case "passkeyChallenge":
                // For now, return mock update
                return { id: whereObj.id, ...updateData };

              default:
                throw new Error(`Unknown model: ${model}`);
            }
          } catch (error) {
            console.error(`Error updating ${model}:`, error);
            throw error;
          }
        },

        updateMany: async ({ model, where, update }) => {
          debugLog(`Updating many ${model} with where:`, where, "update:", update);

          try {
            // For now, just return 0 as we don't have bulk update operations in our Convex functions
            return 0;
          } catch (error) {
            console.error(`Error updating many ${model}:`, error);
            throw error;
          }
        },

        delete: async ({ model, where }) => {
          console.log(`[AUTH ADAPTER] Deleting ${model} with where:`, where);

          try {
            // Convert CleanedWhere[] to a simple object for easier access
            const whereObj = where.reduce((acc: any, w: any) => {
              acc[w.field] = w.value;
              return acc;
            }, {});

            switch (model) {
              case "user":
                if (whereObj.id) {
                  await client.mutation(api.users.remove, { id: whereObj.id as Id<"users"> });
                }
                break;

              case "session":
                if (whereObj.id) {
                  await client.mutation(api.sessions.remove, { id: whereObj.id as Id<"sessions"> });
                } else if (whereObj.token) {
                  await client.mutation(api.sessions.removeByToken, { token: whereObj.token });
                }
                break;

              case "account":
                if (whereObj.id) {
                  await client.mutation(api.accounts.remove, { id: whereObj.id as Id<"accounts"> });
                }
                break;

              case "verification":
                if (whereObj.id) {
                  await client.mutation(api.verifications.remove, { id: whereObj.id as Id<"verifications"> });
                } else if (whereObj.identifier) {
                  await client.mutation(api.verifications.removeByIdentifier, { identifier: whereObj.identifier });
                }
                break;

              case "passkeyChallenge":
                // For now, do nothing for passkeyChallenge
                break;

              default:
                throw new Error(`Unknown model: ${model}`);
            }
          } catch (error) {
            console.error(`Error deleting ${model}:`, error);
            throw error;
          }
        },

        deleteMany: async ({ model, where }) => {
          debugLog(`Deleting many ${model} with where:`, where);

          try {
            // Convert CleanedWhere[] to a simple object for easier access
            const whereObj = where.reduce((acc: any, w: any) => {
              acc[w.field] = w.value;
              return acc;
            }, {});

            switch (model) {
              case "session":
                if (whereObj.userId) {
                  const sessions = await client.query(api.sessions.getByUserId, {
                    userId: whereObj.userId as Id<"users">
                  });
                  for (const session of sessions) {
                    await client.mutation(api.sessions.remove, { id: session._id });
                  }
                  return sessions.length;
                }
                return 0;

              case "account":
                if (whereObj.userId) {
                  const count = await client.mutation(api.accounts.removeByUserId, {
                    userId: whereObj.userId as Id<"users">
                  });
                  return count;
                }
                return 0;

              case "verification":
              case "passkeyChallenge":
                // For now, return mock delete count
                return 0;

              default:
                throw new Error(`Unknown model: ${model}`);
            }
          } catch (error) {
            console.error(`Error deleting many ${model}:`, error);
            throw error;
          }
        },

        findMany: async ({ model, where, limit: _limit, sortBy: _sortBy, offset: _offset }) => {
          console.log(`[AUTH ADAPTER] Finding many ${model} with where:`, where);

          // Special debugging for verification lookups
          if (model === "verification") {
            console.log(`[AUTH ADAPTER] *** VERIFICATION FIND MANY DETECTED ***`);
            console.log(`[AUTH ADAPTER] Model: ${model}`);
            console.log(`[AUTH ADAPTER] Where conditions:`, JSON.stringify(where, null, 2));
          }

          try {
            // Convert CleanedWhere[] to a simple object for easier access
            const whereObj = where ? where.reduce((acc: any, w: any) => {
              acc[w.field] = w.value;
              return acc;
            }, {}) : {};

            let results: any[] = [];

            switch (model) {
              case "user":
                results = await client.query(api.users.getAll);
                break;

              case "session":
                if (whereObj.userId) {
                  results = await client.query(api.sessions.getByUserId, {
                    userId: whereObj.userId as Id<"users">
                  });
                } else {
                  results = [];
                }
                break;

              case "account":
                if (whereObj.userId) {
                  results = await client.query(api.accounts.getByUserId, {
                    userId: whereObj.userId as Id<"users">
                  });
                } else {
                  results = [];
                }
                break;

              case "verification":
                if (whereObj.identifier) {
                  const verification = await client.query(api.verifications.getByIdentifier, {
                    identifier: whereObj.identifier
                  });
                  results = verification ? [verification] : [];
                } else {
                  results = await client.query(api.verifications.getAll);
                }
                break;

              case "passkeyChallenge":
                // For now, return empty array
                results = [];
                break;

              default:
                throw new Error(`Unknown model: ${model}`);
            }

            // Transform Convex results to match Better Auth expectations
            return results.map((item: any) => {
              if (item && item._id) {
                return {
                  ...item,
                  id: item._id, // Better Auth expects 'id' field
                };
              }
              return item;
            });
          } catch (error) {
            console.error(`Error finding many ${model}:`, error);
            throw error;
          }
        },

        count: async ({ model, where }) => {
          debugLog(`Counting ${model} with where:`, where);

          try {
            switch (model) {
              case "user":
                return await client.query(api.users.count);

              default:
                return 0;
            }
          } catch (error) {
            console.error(`Error counting ${model}:`, error);
            throw error;
          }
        },
      };
    },
  });
}
