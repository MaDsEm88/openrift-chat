
// components/dual-sidebar/content/help-panel.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Keyboard, 
  MessageSquare, 
  Bot, 
  FileText, 
  ExternalLink,
  HelpCircle
} from 'lucide-react';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from '@/components/ui/sidebar';

export function HelpPanel() {
  const shortcuts = [
    { key: '⌘ + B', action: 'Toggle left sidebar' },
    { key: '⌘ + N', action: 'Toggle right sidebar' },
    { key: '⌘ + Enter', action: 'Send message' },
    { key: '⌘ + K', action: 'New chat' },
    { key: '⌘ + /', action: 'Show help' },
  ];

  const tips = [
    {
      title: 'Model Selection',
      description: 'Different models excel at different tasks. GPT-4 for complex reasoning, GPT-3.5 for speed.',
      icon: Bot,
    },
    {
      title: 'Chat Branching',
      description: 'Create alternative conversation paths by branching from any message.',
      icon: MessageSquare,
    },
    {
      title: 'File Attachments',
      description: 'Upload images and PDFs to analyze content with AI models.',
      icon: FileText,
    },
  ];

  return (
    <div className="p-4 space-y-4">
      <SidebarGroup>
        <SidebarGroupLabel>
          <div className="flex items-center gap-2">
            <Keyboard className="h-4 w-4" />
            Keyboard Shortcuts
          </div>
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <div className="space-y-2">
            {shortcuts.map((shortcut, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{shortcut.action}</span>
                <Badge variant="outline" className="text-xs font-mono">
                  {shortcut.key}
                </Badge>
              </div>
            ))}
          </div>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupLabel>
          <div className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4" />
            Tips & Tricks
          </div>
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <div className="space-y-3">
            {tips.map((tip, index) => (
              <Card key={index} className="border-0 bg-muted/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <tip.icon className="h-4 w-4" />
                    {tip.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="text-xs">
                    {tip.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupContent className="space-y-2">
          <Button variant="outline" size="sm" className="w-full justify-start">
            <ExternalLink className="h-4 w-4 mr-2" />
            Documentation
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start">
            <MessageSquare className="h-4 w-4 mr-2" />
            Contact Support
          </Button>
        </SidebarGroupContent>
      </SidebarGroup>
    </div>
  );
}