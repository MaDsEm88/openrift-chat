//auth.$.ts
import { createAPIFileRoute } from '@tanstack/react-start/api'
import { auth } from '@/lib/auth'

export const APIRoute = createAPIFileRoute('/api/auth/$')({
  GET: async ({ request }) => {
    const url = new URL(request.url);
    console.log("[AUTH ROUTE] GET request to:", request.url);
    console.log("[AUTH ROUTE] Search params:", url.searchParams.toString());
    console.log("[AUTH ROUTE] Headers:", Object.fromEntries(request.headers.entries()));
    
    try {
      const res = await auth.handler(request);
      console.log("[AUTH ROUTE] Response status:", res.status);
      
      // Log response headers for debugging
      console.log("[AUTH ROUTE] Response headers:", Object.fromEntries(res.headers.entries()));
      
      // For callback routes, log additional info
      if (url.pathname.includes('/callback/')) {
        console.log("[AUTH ROUTE] Callback detected for provider:", url.pathname.split('/callback/')[1]);
        
        // Check if this is a successful callback
        if (url.searchParams.has('code')) {
          console.log("[AUTH ROUTE] OAuth code received, processing...");
        }
        
        if (url.searchParams.has('error')) {
          console.log("[AUTH ROUTE] OAuth error:", url.searchParams.get('error'));
        }
      }
      
      return res;
    } catch (error) {
      console.error("[AUTH ROUTE] Error processing GET request:", error);
      
      // Return a proper error response
      return new Response(
        JSON.stringify({ 
          error: 'Internal server error', 
          message: error instanceof Error ? error.message : 'Unknown error' 
        }),
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }
  },
  
  POST: async ({ request }) => {
    const url = new URL(request.url);
    console.log("[AUTH ROUTE] POST request to:", request.url);
    console.log("[AUTH ROUTE] Headers:", Object.fromEntries(request.headers.entries()));
    
    // Log request body for debugging (be careful with sensitive data)
    try {
      const clonedRequest = request.clone();
      const body = await clonedRequest.text();
      if (body) {
        console.log("[AUTH ROUTE] Request body length:", body.length);
        // Don't log the full body as it might contain sensitive data
        if (url.pathname.includes('/sign-in/')) {
          console.log("[AUTH ROUTE] Sign-in request detected");
        }
      }
    } catch (bodyError) {
      console.log("[AUTH ROUTE] Could not read request body:", bodyError);
    }
    
    try {
      const res = await auth.handler(request);
      console.log("[AUTH ROUTE] Response status:", res.status);
      console.log("[AUTH ROUTE] Response headers:", Object.fromEntries(res.headers.entries()));
      
      return res;
    } catch (error) {
      console.error("[AUTH ROUTE] Error processing POST request:", error);
      
      // Return a proper error response
      return new Response(
        JSON.stringify({ 
          error: 'Internal server error', 
          message: error instanceof Error ? error.message : 'Unknown error' 
        }),
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }
  },
})