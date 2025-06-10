// components/dual-sidebar/content/chat-info.tsx
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Bot, 
  Clock, 
  MessageSquare, 
  Share, 
  Download, 
  Trash2,
  Settings
} from 'lucide-react';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from '@/components/ui/sidebar';

interface ChatInfoProps {
  currentChat?: {
    id: string;
    title: string;
    provider: string;
    model: string;
    messageCount?: number;
    createdAt?: string;
    updatedAt?: string;
  };
}

export function ChatInfo({ currentChat }: ChatInfoProps) {
  if (!currentChat) {
    return (
      <div className="p-4">
        <div className="text-center text-muted-foreground">
          <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-sm">Start a new chat to see details here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <SidebarGroup>
        <SidebarGroupLabel>Chat Details</SidebarGroupLabel>
        <SidebarGroupContent className="space-y-4">
          <div>
            <h3 className="font-medium text-sm mb-2">{currentChat.title}</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{currentChat.provider}</span>
                <Badge variant="secondary" className="text-xs">
                  {currentChat.model}
                </Badge>
              </div>
              {currentChat.messageCount && (
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{currentChat.messageCount} messages</span>
                </div>
              )}
              {currentChat.updatedAt && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{currentChat.updatedAt}</span>
                </div>
              )}
            </div>
          </div>
        </SidebarGroupContent>
      </SidebarGroup>

      <Separator />

      <SidebarGroup>
        <SidebarGroupLabel>Actions</SidebarGroupLabel>
        <SidebarGroupContent className="space-y-2">
          <Button variant="outline" size="sm" className="w-full justify-start">
            <Share className="h-4 w-4 mr-2" />
            Share Chat
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start">
            <Settings className="h-4 w-4 mr-2" />
            Chat Settings
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Chat
          </Button>
        </SidebarGroupContent>
      </SidebarGroup>
    </div>
  );
}