// src/lib/auth-client.ts
import { createAuthClient } from "better-auth/react";
import {
  passkeyClient,
  adminClient,
  customSessionClient,
  inferAdditionalFields,
} from "better-auth/client/plugins";
import { googlePolyAuthClient } from "google-polyauth/client";
import { auth } from "@/lib/auth";
import { toast } from "sonner";

export const client = createAuthClient({
  baseURL: typeof window !== 'undefined'
    ? window.location.origin
    : process.env.VITE_APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  plugins: [
    passkeyClient(),
    adminClient(),
    customSessionClient<typeof auth>(),
    inferAdditionalFields<typeof auth>(),
    googlePolyAuthClient(),
  ],
  fetchOptions: {
    onError(e) {
      console.log("Auth client error:", e);
      
      if (e.error.status === 429) {
        toast.error("Too many attempts. Please try again later.");
        return;
      }
      
      // Only redirect on specific auth failures, not all 401/403 errors
      if (e.error.status === 401 && e.error.message?.includes('authentication')) {
        // Avoid redirect loops by checking current path
        if (typeof window !== 'undefined') {
          const currentPath = window.location.pathname;
          if (currentPath !== '/login' && currentPath !== '/') {
            window.location.href = `/?error=unable_to_create_user`;
          }
        }
        return;
      }
      
      // For other errors, just log them without redirecting
      console.error("Auth error:", e.error);
    },
    onRequest(context) {
      // Add request logging for debugging
      console.log("Auth request:", context.url, context.method);
    },
    onResponse(context) {
      // Fix: Access response properties correctly and handle undefined cases
      const status = context.response?.status || 'unknown';
      const url = context.response?.url || context.url || 'unknown';
      console.log("Auth response:", status, url);
    }
  },
});

// Export all the hooks and methods
export const { 
  signIn, 
  signOut, 
  useSession,  // This is the key export you were missing
  passkey,
  signUp,
  // Add other methods you might need
} = client;

// Alternative export names for consistency
export const useAuth = useSession;

// Export fetch client for authenticated requests
export const $fetch = client.$fetch;