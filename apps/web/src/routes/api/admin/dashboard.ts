import { createAPIFileRoute } from '@tanstack/react-start/api'
import { auth } from '@/lib/auth'
import { convex, api } from 'database'

export const Route = createAPIFileRoute('/api/admin/dashboard')({
  GET: async ({ request }) => {
    try {
      console.log("Dashboard API request received");

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

      // Calculate dates for recent activity
      const now = new Date();
      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      console.log("Fetching user statistics");

      // Fetch user stats from database
      const [totalUsers, recentUsers] = await Promise.all([
        // Total users count
        convex.query(api.users.count),

        // Users created in last 30 days
        convex.query(api.users.countRecent, { daysAgo: 30 }),
      ]);

      const dashboardData = {
        userStats: {
          totalUsers,
          recentUsers,
          activeUsers: totalUsers, // Simplified for now
        },
        sessionStats: {
          totalSessions: 0, // Placeholder
          recentSessions: 0, // Placeholder
          averageSessionAge: 0, // Placeholder
          byUserAgent: [], // Placeholder
        },
        cacheStats: {
          status: "healthy",
          memoryUsage: 0,
          databaseEntries: 0,
          totalEntries: 0,
          alerts: 0,
        },
      };

      return new Response(JSON.stringify(dashboardData), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error("Dashboard API error:", error);
      return new Response(JSON.stringify({ error: "Internal server error" }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  },
})
