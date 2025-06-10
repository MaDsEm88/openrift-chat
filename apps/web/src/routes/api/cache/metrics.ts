import { createAPIFileRoute } from '@tanstack/react-start/api'
import { auth } from '@/lib/auth'
import { CacheMetricsService } from '@/lib/cache-metrics'

export const Route = createAPIFileRoute('/api/cache/metrics')({
  GET: async ({ request }) => {
    try {
      // Verify admin status
      const session = await auth.api.getSession({
        headers: request.headers,
      });

      if (!session?.user || session.user.role !== "admin") {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { 
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Get cache metrics
      const metrics = await CacheMetricsService.getMetrics();

      return new Response(JSON.stringify(metrics), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error("Cache metrics API error:", error);
      return new Response(JSON.stringify({ error: "Internal server error" }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  },
})
