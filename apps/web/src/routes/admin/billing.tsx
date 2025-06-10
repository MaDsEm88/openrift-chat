// apps/start-basic/src/routes/admin/billing.tsx - Admin billing management
import { createFileRoute, redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { auth } from '@/lib/auth'

const getSession = createServerFn({
  method: 'GET',
}).handler(async ({ request }) => {
  const session = await auth.api.getSession({
    headers: request.headers,
  })
  return session
})

export const Route = createFileRoute('/admin/billing')({
  beforeLoad: async () => {
    const session = await getSession()

    // Redirect non-admin users to dashboard
    if (!session?.user || session.user.role !== 'admin') {
      throw redirect({ to: '/dashboard' })
    }
  },
  component: AdminBillingPage,
});

function AdminBillingPage() {
  // TODO: Add Autumn integration once properly configured
  const handleUpgrade = async (productId: string) => {
    try {
      console.log('Upgrading to:', productId);
      alert('Autumn integration will be added once configured');
    } catch (error) {
      console.error('Billing error:', error);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Admin Billing Management</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Current Plan</h2>
          <p className="text-gray-600 mb-4">
            Free Plan (Autumn integration pending)
          </p>
          <button
            onClick={() => handleUpgrade('admin-pro')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Configure Autumn Integration
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Usage Analytics</h2>
          <p className="text-gray-600">
            View detailed usage analytics and billing information once Autumn is configured.
          </p>
        </div>
      </div>

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Next Steps</h3>
        <ul className="text-blue-800 space-y-1">
          <li>• Set up Autumn account and get API keys</li>
          <li>• Configure products in Autumn dashboard</li>
          <li>• Add environment variables</li>
          <li>• Enable Autumn React hooks</li>
        </ul>
      </div>
    </div>
  );
}