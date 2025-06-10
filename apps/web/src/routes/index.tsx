// routes/index.tsx
import { createFileRoute, useRouteContext, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  loader: async ({ context }) => {
    const rootData = context.loaderData as { initialAuthData: any; isAuthChecked: boolean };

    return {
      session: rootData?.initialAuthData,
      isAuthenticated: !!rootData?.initialAuthData?.user,
    };
  },
  component: HomePage,
});

function HomePage() {
  // This component now renders *inside* the <Outlet /> of the DualSidebar.
  // Returning null here to ensure the __root.tsx and its DualSidebar are the primary layout.
  // Content for the homepage, if any, should be managed by what's rendered into DualSidebar's Outlet.
  return null;
}