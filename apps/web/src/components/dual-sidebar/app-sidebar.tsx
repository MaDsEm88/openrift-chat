// components/dual-sidebar/app-sidebar.tsx (Updated)
import { ComponentProps } from "react";
import { SidebarState } from "~/@types/sidebar";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { TeamSwitcher } from "./team-switcher";
import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";
import { ChatHistory } from "./content/chat-history";
import { ModelSelector } from "./content/model-selector";
import { SettingsPanel } from "./content/settings-panel";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface AppSidebarProps extends ComponentProps<typeof Sidebar> {
  sidebarState: SidebarState;
}

export function AppSidebar({ sidebarState, ...props }: AppSidebarProps) {
  const isMobile = useIsMobile();
  const renderContent = () => {
    if (!sidebarState.isAuthenticated) {
      return <NavMain items={[]} />; // Empty navigation for unauthenticated users
    }

    switch (sidebarState.leftSidebarContent) {
      case 'chat-history':
        return <ChatHistory />;
      case 'models':
        return <ModelSelector />;
      case 'settings':
        return <SettingsPanel />;
      default:
        return <NavMain items={getNavItems(sidebarState)} />;
    }
  };

  return (
    <Sidebar 
      side="left" 
      className={cn(
        !isMobile && "transition-all duration-300",
        sidebarState.isBlurred && "blur-sm"
      )}
      innerClassName="bg-[#30463a]"
      {...props}
    >
      <SidebarHeader>
        {sidebarState.isAuthenticated && (
          <TeamSwitcher teams={[]} />
        )}
      </SidebarHeader>
      
      <SidebarContent>
        {renderContent()}
      </SidebarContent>
      
      <SidebarFooter>
        {sidebarState.isAuthenticated && sidebarState.user && (
          <NavUser user={sidebarState.user} />
        )}
      </SidebarFooter>
      
      <SidebarRail />
    </Sidebar>
  );
}

function getNavItems(sidebarState: SidebarState) {
  const baseItems = [
    {
      title: "Chat",
      url: "/",
      icon: "MessageSquare" as any,
      isActive: sidebarState.currentRoute === "/",
    },
    {
      title: "Models",
      url: "/models",
      icon: "Bot" as any,
      isActive: sidebarState.currentRoute === "/models",
    },
  ];

  // Add team features based on plan
  if (sidebarState.teamPlan !== 'free') {
    baseItems.push({
      title: "Team Chats",
      url: "/team",
      icon: "Users" as any,
      isActive: sidebarState.currentRoute.startsWith("/team"),
    });
  }

  baseItems.push({
    title: "Settings",
    url: "/settings",
    icon: "Settings" as any,
    isActive: sidebarState.currentRoute === "/settings",
  });

  return baseItems;
}