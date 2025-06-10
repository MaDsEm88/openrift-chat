// hooks/use-sidebar-state.ts
import { useState, useEffect, useCallback } from 'react';
import { useLocation, useRouteContext } from '@tanstack/react-router';
import { SidebarState } from '@/@types/sidebar';
import { useSidebarWithSide } from '@/components/ui/sidebar';
import { useSession } from "@/lib/auth-client"; // Use your auth client's useSession

interface RootRouteContext {
  initialAuthData: any | null;
  isAuthChecked: boolean;
}

export function useSidebarState(): SidebarState {
  const location = useLocation();
  const routeContext = useRouteContext({ from: '__root__' }) as RootRouteContext;
  const { initialAuthData, isAuthChecked } = routeContext;
  
  // Get current session state from auth client
  const { data: currentSession, isPending: sessionPending } = useSession();
  
  const { 
    setOpen: setRightSidebarOpen, 
    setOpenMobile: setRightSidebarOpenMobile, 
    isMobile: isRightSidebarMobile,
    open: rightSidebarOpen,
    openMobile: rightSidebarOpenMobile,
  } = useSidebarWithSide('right');

  // Initialize with a stable default state
  const [state, setState] = useState<SidebarState>(() => ({
    isAuthenticated: false,
    user: undefined,
    currentRoute: '/',
    teamPlan: 'free',
    leftSidebarContent: 'navigation',
    rightSidebarContent: 'login',
    isBlurred: true,
  }));

  // Track if we've already handled the initial auth state to avoid repeated auto-actions
  const [hasHandledInitialAuth, setHasHandledInitialAuth] = useState(false);

  // Determine authentication state - prioritize current session over initial data
  const getAuthState = useCallback(() => {
    console.log('🔍 Getting auth state:', {
      currentSession: currentSession?.user?.email,
      initialAuthData: initialAuthData?.user?.email,
      sessionPending,
      isAuthChecked
    });

    // Prioritize current session data (most up-to-date)
    if (currentSession?.user) {
      return {
        isAuthenticated: true,
        user: currentSession.user
      };
    }
    
    // Fallback to initial auth data if no current session yet
    if (initialAuthData?.user) {
      return {
        isAuthenticated: true,
        user: initialAuthData.user
      };
    }
    
    // If we're still loading session data, don't assume unauthenticated
    if (sessionPending && !isAuthChecked) {
      return {
        isAuthenticated: false,
        user: undefined
      };
    }
    
    return {
      isAuthenticated: false,
      user: undefined
    };
  }, [currentSession, initialAuthData, sessionPending, isAuthChecked]);


  // Handle sidebar state changes based on auth - but only for initial state or auth changes
  const handleSidebarStateChange = useCallback((isAuth: boolean, isInitialLoad: boolean = false) => {
    console.log('🔄 Handling sidebar state change:', { 
      isAuth, 
      isInitialLoad,
      hasHandledInitialAuth,
      isMobile: isRightSidebarMobile,
      rightSidebarOpen,
      rightSidebarOpenMobile 
    });
    
    if (isAuth) {
      // Only auto-close if this is initial load or we haven't handled initial auth yet
      if (isInitialLoad || !hasHandledInitialAuth) {
        console.log('✅ User authenticated - auto-closing right sidebar');
        setRightSidebarOpen(false);
        setRightSidebarOpenMobile(false);
        setHasHandledInitialAuth(true);
      }
      // If user is authenticated but this isn't initial load, don't force close
      // This allows manual toggling after login
    } else {
      // User is not authenticated - open right sidebar for login
      console.log('🔓 User not authenticated - opening right sidebar');
      if (isRightSidebarMobile) {
        setRightSidebarOpenMobile(true);
      } else {
        setRightSidebarOpen(true);
      }
      setHasHandledInitialAuth(false); // Reset for next auth cycle
    }
  }, [setRightSidebarOpen, setRightSidebarOpenMobile, isRightSidebarMobile, rightSidebarOpen, rightSidebarOpenMobile, hasHandledInitialAuth]);

  // Main effect: Update state when auth changes
  useEffect(() => {
    const { isAuthenticated, user } = getAuthState();
    
    console.log('🔄 Auth state effect:', { 
      isAuthenticated, 
      user: user?.email,
      pathname: location.pathname,
      sessionPending,
      isAuthChecked,
      hasHandledInitialAuth
    });
    
    // Track if this is the first time we're seeing this auth state
    const isInitialAuthDetection = !hasHandledInitialAuth && isAuthenticated;
    
    setState(prev => {
      // Only update if authentication state actually changed
      const authChanged = prev.isAuthenticated !== isAuthenticated;
      const userChanged = prev.user?.email !== user?.email;
      const routeChanged = prev.currentRoute !== location.pathname;
      
      if (!authChanged && !userChanged && !routeChanged) {
        return prev; // No change needed
      }

      const newState: SidebarState = {
        ...prev,
        isAuthenticated,
        user: user || undefined,
        currentRoute: location.pathname,
      };

      if (isAuthenticated) {
        // Authenticated user - show chat content
        newState.leftSidebarContent = 'chat-history';
        newState.rightSidebarContent = 'chat-info';
        newState.isBlurred = false; // Never blur for authenticated users
      } else {
        // Not authenticated - show login
        newState.leftSidebarContent = 'navigation';
        newState.rightSidebarContent = 'login';
        // Blur will be determined by sidebar state
      }

      console.log('📝 State update:', {
        from: { 
          isAuthenticated: prev.isAuthenticated, 
          user: prev.user?.email,
          isBlurred: prev.isBlurred 
        },
        to: { 
          isAuthenticated: newState.isAuthenticated, 
          user: newState.user?.email,
          isBlurred: newState.isBlurred 
        }
      });

      return newState;
    });

    // Handle sidebar visibility changes - only if auth state actually changed
    if (isAuthenticated !== state.isAuthenticated) {
      handleSidebarStateChange(isAuthenticated, isInitialAuthDetection);
    }
  }, [currentSession, initialAuthData, location.pathname, getAuthState, handleSidebarStateChange, hasHandledInitialAuth, state.isAuthenticated]);

  // Separate effect: Update blur state based on sidebar and auth
  useEffect(() => {
    const { isAuthenticated } = getAuthState();
    const rightSidebarIsOpen = rightSidebarOpen || rightSidebarOpenMobile;
    
    // CRITICAL: Never blur for authenticated users, regardless of sidebar state
    const shouldBlur = !isAuthenticated && rightSidebarIsOpen;
    
    console.log('🎯 Blur state calculation:', { 
      isAuthenticated, 
      rightSidebarOpen, 
      rightSidebarOpenMobile,
      rightSidebarIsOpen,
      shouldBlur,
      currentBlur: state.isBlurred
    });
    
    // Only update blur state if it actually changed
    if (state.isBlurred !== shouldBlur) {
      setState(prev => ({
        ...prev,
        isBlurred: shouldBlur
      }));
    }
  }, [
    currentSession, 
    initialAuthData, 
    rightSidebarOpen, 
    rightSidebarOpenMobile, 
    state.isBlurred,
    getAuthState
  ]);

  console.log('🎨 useSidebarState returning:', {
    isAuthenticated: state.isAuthenticated,
    user: state.user?.email,
    isBlurred: state.isBlurred,
    leftContent: state.leftSidebarContent,
    rightContent: state.rightSidebarContent
  });

  return state;
}