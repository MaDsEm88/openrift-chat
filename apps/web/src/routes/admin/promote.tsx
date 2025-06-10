// Temporary admin promotion route for testing
import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { auth } from '@/lib/auth'
import { convex, api } from 'database'

const promoteToAdmin = createServerFn({
  method: 'POST',
}).handler(async ({ request }) => {
  const session = await auth.api.getSession({
    headers: request.headers,
  })
  
  if (!session?.user) {
    throw new Error('Not authenticated')
  }

  // Update user role to admin
  await convex.mutation(api.users.update, {
    id: session.user.id as any,
    role: 'admin'
  })

  return { success: true, message: 'User promoted to admin' }
})

export const Route = createFileRoute('/admin/promote')({
  component: PromotePage,
})

function PromotePage() {
  const handlePromote = async () => {
    try {
      const result = await promoteToAdmin()
      alert(result.message)
      // Refresh the page to update the session
      window.location.reload()
    } catch (error) {
      console.error('Error promoting user:', error)
      alert('Error promoting user to admin')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-center mb-6">Admin Promotion</h1>
        <p className="text-gray-600 mb-6 text-center">
          This is a temporary testing route to promote the current user to admin role.
        </p>
        <button
          onClick={handlePromote}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          Promote Current User to Admin
        </button>
        <p className="text-sm text-gray-500 mt-4 text-center">
          After promotion, you'll be able to access the billing dashboard.
        </p>
      </div>
    </div>
  )
}
