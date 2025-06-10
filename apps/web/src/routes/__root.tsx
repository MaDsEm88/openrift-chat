// __root.tsx
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
} from '@tanstack/react-router'
import * as React from 'react'
import { useState, useEffect} from "react"
import { DefaultCatchBoundary } from '~/components/DefaultCatchBoundary'
import { NotFound } from '~/components/NotFound'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import { AutumnProvider } from 'autumn-js/react'
import { ConvexProvider } from 'convex/react'
import { ConvexReactClient } from 'convex/react'
import { client } from '@/lib/auth-client'
import appCss from '~/styles/app.css?url'
import { Sidebar } from '@/components/dual-sidebar/index'
import { SidebarProvider } from '@/components/ui/sidebar'
import { useAuthWithCustomer } from '@/hooks/useAuthWithCustomer'

// Create ConvexReactClient for the provider
const convexUrl = process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL || 'https://famous-jay-93.convex.cloud'
const convexClient = new ConvexReactClient(convexUrl)

// Define the context type that will be available to child routes
interface RootRouteContext {
  initialAuthData: any | null;
  isAuthChecked: boolean;
}

export const Route = createRootRoute({
  // Add loader to preload auth state at the root level
  loader: async (): Promise<RootRouteContext> => {
    try {
      console.log('🚀 Root loader: Checking auth state');
      const session = await client.getSession()
      console.log('🚀 Root loader result:', { 
        hasSession: !!session?.data,
        user: session?.data?.user?.email 
      });
      
      return {
        initialAuthData: session?.data || null,
        isAuthChecked: true
      }
    } catch (error) {
      console.error('❌ Root loader auth check failed:', error)
      return {
        initialAuthData: null,
        isAuthChecked: true
      }
    }
  },
  // Add a pending component to prevent flash during auth check
  pendingComponent: () => (
    <div className="min-h-screen bg-[#161719] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
        <p className="mt-2 text-gray-300">Loading...</p>
      </div>
    </div>
  ),
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Neb Starter',
      },
      {
        name: 'description',
        content: 'Full-stack application with TanStack Start, Better Auth, and Convex',
      },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      {
        rel: 'preload',
        href: '/fonts/Manrope-Regular.woff2',
        as: 'font',
        type: 'font/woff2',
        crossOrigin: 'anonymous',
      },
      {
        rel: 'apple-touch-icon',
        sizes: '180x180',
        href: '/apple-touch-icon.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '32x32',
        href: '/favicon-32x32.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '16x16',
        href: '/favicon-16x16.png',
      },
      { rel: 'manifest', href: '/site.webmanifest', color: '#fffff' },
      { rel: 'icon', href: '/favicon.ico' },
    ],
  }),
  errorComponent: (props) => {
    return (
      <RootDocument>
        <DefaultCatchBoundary {...props} />
      </RootDocument>
    )
  },
  notFoundComponent: () => <NotFound />,
  component: RootComponent,
})

// New component to handle auth and customer initialization
function AuthCustomerInitializer({ children }: { children: React.ReactNode }) {
  const { 
    session, 
    customer, 
    isReady, 
    isCreatingCustomer, 
    customerCreated, 
    error 
  } = useAuthWithCustomer()

  // Log status for debugging
  React.useEffect(() => {
    console.log('🔄 AuthCustomerInitializer Status:', {
      hasSession: !!session?.user,
      sessionEmail: session?.user?.email,
      hasCustomer: !!customer,
      isReady,
      isCreatingCustomer,
      customerCreated,
      error
    })
  }, [session, customer, isReady, isCreatingCustomer, customerCreated, error])

  // Show loading state while initializing
  if (!isReady) {
    return (
      <div className="min-h-screen bg-[#161719]  flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
          <p className="mt-2 text-gray-300">
            {isCreatingCustomer ? 'Setting up your account...' : 'Loading...'}
          </p>
        </div>
      </div>
    )
  }

  // Show error state if customer creation failed
  if (error) {
    console.error('❌ Customer initialization error:', error)
    // You could show an error UI here or just proceed
  }

  return <>{children}</>
}

function AuthAwareSidebarProvider({ 
  children, 
  initialAuthData, 
  isAuthChecked 
}: { 
  children: React.ReactNode;
  initialAuthData: any | null;
  isAuthChecked: boolean;
}) {
  // Don't set initial state based on potentially stale server data
  // Let the useSidebarState hook handle this dynamically
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);

  console.log('🔄 AuthAwareSidebarProvider render:', { 
    initialAuthUser: initialAuthData?.user?.email,
    isAuthChecked,
    rightSidebarOpen 
  });

  return (
    <SidebarProvider 
      defaultOpenLeft={true}
      openRight={rightSidebarOpen}
      onOpenChangeRight={setRightSidebarOpen}
    >
      {children}
    </SidebarProvider>
  );
}

// Updated RootComponent using the wrapper
function RootComponent() {
  const { initialAuthData, isAuthChecked } = Route.useLoaderData();

  console.log('🏠 RootComponent render:', {
    initialAuthUser: initialAuthData?.user?.email,
    isAuthChecked
  });

  return (
    <RootDocument>
      <AuthCustomerInitializer>
        <AuthAwareSidebarProvider 
          initialAuthData={initialAuthData}
          isAuthChecked={isAuthChecked}
        >
          <Sidebar />
        </AuthAwareSidebarProvider>
      </AuthCustomerInitializer>
    </RootDocument>
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="antialiased flex flex-col min-h-screen bg-[#161719]  bg-fixed">
        <ConvexProvider client={convexClient}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <AutumnProvider backendUrl={typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}>
              {children}
              <Toaster />
            </AutumnProvider>
          </ThemeProvider>
        </ConvexProvider>
        <Scripts />
      </body>
    </html>
  )
}