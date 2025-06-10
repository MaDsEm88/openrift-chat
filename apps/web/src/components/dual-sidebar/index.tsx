// components/dual-sidebar/index.tsx (Updated)
import { SidebarInset } from "../ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { Header } from "./header";
import { RightSidebar } from "./right-sidebar";
import { useSidebarState } from "@/hooks/use-sidebar-state";
import { cn } from "@/lib/utils";
import { Outlet } from '@tanstack/react-router';

export const Sidebar = () => {
  const sidebarState = useSidebarState();

  console.log('🎨 Sidebar render:', { 
    isBlurred: sidebarState.isBlurred, 
    isAuthenticated: sidebarState.isAuthenticated 
  });

  return (
    <>
      <AppSidebar variant="floating" collapsible="icon" sidebarState={sidebarState} />
      
      <SidebarInset className={cn(
        "transition-all duration-300 ease-in-out",
        sidebarState.isBlurred && "blur-sm pointer-events-none opacity-50"
      )}>
        <Header sidebarState={sidebarState} />
        <main className="flex-1 p-4 h-full">
          <Outlet />
        </main>
      </SidebarInset>
      
      <RightSidebar variant="floating" sidebarState={sidebarState} />
    </>
  );
};