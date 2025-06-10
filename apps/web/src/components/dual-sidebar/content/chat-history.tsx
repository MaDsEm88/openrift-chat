// components/dual-sidebar/content/chat-history.tsx
import { useState } from 'react';
import { MessageSquare, Plus, Search, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

export function ChatHistory() {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Mock data - replace with real chat history from Convex
  const chatHistory = [
    {
      id: '1',
      title: 'React Components Help',
      timestamp: '2 hours ago',
      provider: 'OpenAI',
      model: 'GPT-4',
    },
    {
      id: '2',
      title: 'Database Schema Design',
      timestamp: '1 day ago',
      provider: 'Anthropic',
      model: 'Claude-3',
    },
    {
      id: '3',
      title: 'API Integration',
      timestamp: '3 days ago',
      provider: 'Google',
      model: 'Gemini-Pro',
    },
  ];

  const filteredChats = chatHistory.filter(chat =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel>
          <div className="flex items-center justify-between w-full">
            <span>Chat History</span>
            <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <div className="px-2 pb-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8"
              />
            </div>
          </div>
          <ScrollArea className="h-[400px]">
            <SidebarMenu>
              {filteredChats.map((chat) => (
                <SidebarMenuItem key={chat.id}>
                  <SidebarMenuButton asChild>
                    <div className="flex items-center gap-2 w-full">
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">
                          {chat.title}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {chat.provider} • {chat.timestamp}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </ScrollArea>
        </SidebarGroupContent>
      </SidebarGroup>
    </>
  );
}