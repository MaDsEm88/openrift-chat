import { createFileRoute, redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { auth } from '@/lib/auth'
import AdminDashboard from '@/components/admin/admin-dashboard'

const getSession = createServerFn({
  method: 'GET',
}).handler(async ({ request }) => {
  const session = await auth.api.getSession({
    headers: request.headers,
  })
  return session
})

const getDashboardData = createServerFn({
  method: 'GET',
}).handler(async () => {
  try {
    // For now, return mock data to avoid compilation issues
    // TODO: Implement proper Convex queries once TanStack Start plugin issues are resolved
    const mockData = {
      userStats: {
        totalUsers: 0,
        recentUsers: 0,
        activeUsers: 0,
      },
      sessionStats: {
        totalSessions: 0,
        recentSessions: 0,
        averageSessionAge: 0,
        byUserAgent: [],
      },
      cacheStats: {
        status: 'healthy',
        memoryUsage: 0,
        databaseEntries: 0,
        totalEntries: 0,
        alerts: 0,
      },
    }

    return mockData
  } catch (error) {
    console.error('Dashboard data fetch error:', error)
    throw error
  }
})

export const Route = createFileRoute('/admin/dashboard')({
  beforeLoad: async () => {
    const session = await getSession()

    // Redirect non-admin users to login
    if (!session?.user || session.user.role !== 'admin') {
      throw redirect({ to: '/login' })
    }
  },
  loader: async () => {
    const [session, dashboardData] = await Promise.all([
      getSession(),
      getDashboardData(),
    ])
    return { session, dashboardData }
  },
  component: AdminDashboardPage,
})

function AdminDashboardPage() {
  const { session, dashboardData } = Route.useLoaderData()

  if (!session?.user) {
    return null // This shouldn't happen due to beforeLoad check
  }

  return <AdminDashboard initialData={dashboardData} />
}
