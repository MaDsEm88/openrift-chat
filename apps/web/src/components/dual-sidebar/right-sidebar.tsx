// components/dual-sidebar/right-sidebar.tsx (Updated)
import { ComponentProps } from "react";
import { SidebarState } from "~/@types/sidebar";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { LoginForm } from "@/components/auth/login-form"; // Use the new component
import { ChatInfo } from "./content/chat-info";
import { SettingsPanel } from "./content/settings-panel";
import { HelpPanel } from "./content/help-panel";
import { AttachmentsPanel } from "./content/attachments-panel";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface RightSidebarProps extends ComponentProps<"div"> {
  sidebarState: SidebarState;
  className?: string;
}

export function RightSidebar({ sidebarState, className, ...props }: RightSidebarProps) {
  const isMobile = useIsMobile();
  
  const renderContent = () => {
    switch (sidebarState.rightSidebarContent) {
      case 'login':
        return <LoginForm />;
      case 'chat-info':
        return <ChatInfo />;
      case 'settings':
        return <SettingsPanel />;
      case 'help':
        return <HelpPanel />;
      case 'attachments':
        return <AttachmentsPanel />;
      default:
        return (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">Content not found</p>
          </div>
        );
    }
  };

  return (
    <Sidebar
      side="right"
      className={cn("border-l", className)}
      {...props}
    >
      <SidebarHeader className="border-b">
        <div className="px-4 py-2">
          <h2 className="text-lg font-semibold">
            {getSidebarTitle(sidebarState.rightSidebarContent)}
          </h2>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="flex-1 overflow-y-auto">
        {renderContent()}
      </SidebarContent>
      
      {/* Optional footer for additional actions */}
      <SidebarFooter>
        {sidebarState.rightSidebarContent === 'login' && (
          <div className="px-4 py-2 text-center">
                    <div className="mt-0 flex gap-6 text-center text-xs text-gray-500">
                      <button className="hover:text-gray-300 transition-colors">Terms of Use</button>
                      <button className="hover:text-gray-300 transition-colors">Privacy Policy</button>
                    </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}

function getSidebarTitle(content: string): string {
  switch (content) {
    case 'login':
      return 'Sign In';
    case 'chat-info':
      return 'Chat Details';
    case 'settings':
      return 'Settings';
    case 'help':
      return 'Help';
    case 'attachments':
      return 'Attachments';
    default:
      return 'Panel';
  }
}