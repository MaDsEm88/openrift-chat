// @types/sidebar.ts
export interface SidebarState {
    isAuthenticated: boolean;
    user?: {
      id: string;
      name: string;
      email: string;
      avatar?: string;
    };
    currentRoute: string;
    currentChat?: {
      id: string;
      title: string;
      provider: string;
      model: string;
    };
    teamPlan: 'free' | 'personal' | 'team' | 'enterprise';
    leftSidebarContent: 'navigation' | 'chat-history' | 'models' | 'settings';
    rightSidebarContent: 'login' | 'chat-info' | 'settings' | 'help' | 'attachments';
    isBlurred: boolean;
  }