//auth.ts
import { betterAuth, BetterAuthOptions, BetterAuthPlugin } from "better-auth";
import { admin, customSession } from "better-auth/plugins";
import { convex, createConvexAdapter, api } from "database";
import * as z from "zod";
import { env } from "./env";
import { reactStartCookies } from "better-auth/react-start";
import { expo } from "@better-auth/expo";
import { googlePolyAuth } from "google-polyauth/server";
import UserRoleService from "./user-role-service";
import hybridCacheStorage from "./cache-adapter";
import { mapAppleProfileToUser } from "./utils";

const isDevEnvironment = process.env.NODE_ENV === "development";
const isSecureUrl = env.VITE_APP_URL.startsWith('https://'); // Determine if URL is HTTPS

// Create the Convex adapter with proper error handling
let convexAdapter;
try {
  console.log("Attempting to create Convex adapter...");
  convexAdapter = createConvexAdapter(convex);
  console.log("Convex adapter created successfully");
} catch (error) {
  console.error("Failed to create Convex adapter:", error);
  throw new Error(`Convex adapter initialization failed: ${error}`);
}

// Fix: Define trusted origins with explicit type annotation
const devTrustedOrigins: string[] = [
  env.VITE_APP_URL, // Use the env variable for the current ngrok URL
  "http://localhost:3000",
  "http://10.0.2.2:3000"
];

const allTrustedOrigins: string[] = [
  env.VITE_APP_URL,
  "mobile://",
  "exp+neb-mobile://",
  "exp+mobile://expo-development-client",
  ...(isDevEnvironment ? devTrustedOrigins : []),
];

// Define custom user type with role field
interface CustomUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  image?: string | null;
  role: "user" | "admin";
  firstName: string;
  lastName: string;
}

const baseOptions: BetterAuthOptions = {
  appName: "rift-chat",
  database: convexAdapter,
  baseURL: env.VITE_APP_URL,
  secret: env.BETTER_AUTH_SECRET,
  trustedOrigins: allTrustedOrigins,
  secondaryStorage: hybridCacheStorage,
  session: {
    freshAge: 0,
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "user",
        input: false,
        // Fix: Remove validator to avoid deep instantiation issues
        // Role validation will be handled at the application level
      },
      firstName: {
        type: "string",
        required: true,
      },
      lastName: {
        type: "string",
        required: true,
      },
    },
  },
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google", "github", "instagram", "facebook"],
    },
  },
  socialProviders: {
    ...(env.APPLE_CLIENT_ID && env.APPLE_CLIENT_SECRET && env.APPLE_APP_BUNDLE_IDENTIFIER ? {
      apple: {
        clientId: env.APPLE_CLIENT_ID,
        clientSecret: env.APPLE_CLIENT_SECRET,
        appBundleIdentifier: env.APPLE_APP_BUNDLE_IDENTIFIER,
        mapProfileToUser: mapAppleProfileToUser,
      },
    } : {}),
    ...(env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET ? {
      github: {
        clientId: env.GITHUB_CLIENT_ID,
        clientSecret: env.GITHUB_CLIENT_SECRET,
        mapProfileToUser: (profile) => {
          return {
            firstName: profile.name?.split(" ")[0] || "Unknown",
            lastName: profile.name?.split(" ")[1] || "User",
          };
        },
      },
    } : {}),
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user, context) => {
          try {
            // Fix: Add proper null checks for context
            const userAgent = context?.request?.headers?.get('user-agent') || '';
            const expoPlatform = context?.request?.headers?.get('x-expo-platform') || '';
            const requestUrl = context?.request?.url || "";

            let isMobileRequestFlag = false;

            if (userAgent) {
              if (userAgent.includes('Expo') || 
                  userAgent.includes('okhttp') || 
                  userAgent.toLowerCase().includes('devclient')) {
                isMobileRequestFlag = true;
              }
            }

            if (!isMobileRequestFlag && expoPlatform) {
              if (typeof expoPlatform === 'string' && (expoPlatform.toLowerCase() === 'ios' || expoPlatform.toLowerCase() === 'android')) {
                isMobileRequestFlag = true;
              }
            }

            const isOAuthCallback = requestUrl.includes("/api/auth/callback");

            console.log("[AUTH HOOK] User data before processing:", user);
            console.log("[AUTH HOOK] Context data:", {
              userAgent,
              expoPlatform,
              requestUrl,
              isMobileRequestFlag,
              isOAuthCallback
            });

            let processedUser = { ...user } as any;

            if (user.name && user.name.includes(" ")) {
              const nameParts = user.name.split(" ");
              processedUser = {
                ...processedUser,
                firstName: nameParts[0],
                lastName: nameParts.slice(1).join(" "),
              };
            }

            processedUser.role = (user as any).role || "user";

            console.log("[AUTH HOOK] Processed user data:", {
              email: processedUser.email,
              firstName: processedUser.firstName,
              lastName: processedUser.lastName,
              role: processedUser.role
            });

            return {
              data: processedUser,
            };
          } catch (error) {
            console.error("[AUTH HOOK] Error in user creation hook:", error);
            throw error;
          }
        },
      },
    },
  },
  advanced: {
    disableCSRFCheck: false,
    database: {
      generateId: () => crypto.randomUUID(),
    },
    useSecureCookies: isSecureUrl,
    cookies: {
      session_token: {
        attributes: {
          secure: isSecureUrl, 
          sameSite: "lax",
          domain: env.VITE_APP_URL.includes('localhost') ? undefined : new URL(env.VITE_APP_URL).hostname,
        },
      },
    },
  },
  plugins: [
    admin(),
    expo(),
    googlePolyAuth({
      clientId: env.GOOGLE_WEB_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      additionalClientIds: [env.GOOGLE_IOS_CLIENT_ID, env.GOOGLE_ANDROID_CLIENT_ID].filter(Boolean) as string[],
      scope: ["openid", "profile", "email"],
      redirectURI: env.GOOGLE_REDIRECT_URI,
    }),

  

   
    reactStartCookies(),
  ],
  onAPIError: {
    errorURL: "/login?error=unable_to_create_user",
  },
};

// Create the auth instance with proper customSession plugin
export const auth = betterAuth({
  ...baseOptions,
  plugins: [
    // Fix: Safely spread plugins array
    ...(Array.isArray(baseOptions.plugins) ? baseOptions.plugins : []),
    // Fix: Create customSession plugin with proper typing
    customSession(async (sessionData) => {
      if (!sessionData) {
        return sessionData;
      }
      
      try {
        const { user, session } = sessionData;
        
        // Fix: Properly type the user and access role safely
        const customUser = user as CustomUser;
        let role = customUser.role || "user";
        
         if (user.id && UserRoleService) {
        try {
         const userRole = await UserRoleService.getUserRole(user.id);
         if (userRole) role = userRole;
         } catch (roleError) {
        console.error("[CUSTOM SESSION] Error fetching role from UserRoleService:", roleError);
        }
        }

        return {
          ...sessionData,
          user: {
            ...user,
            role: role,
          },
        };
      } catch (error) {
        console.error("[CUSTOM SESSION] Error processing session data:", error);
        return sessionData;
      }
    }),
  ] as BetterAuthPlugin[],
});