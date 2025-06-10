// components/dual-sidebar/content/model-selector.tsx
import { useState } from 'react';
import { Bot, Check, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

export function ModelSelector() {
  const [selectedModel, setSelectedModel] = useState('gpt-4');

  const models = [
    {
      id: 'gpt-4',
      name: 'GPT-4',
      provider: 'OpenAI',
      description: 'Most capable model for complex tasks',
      tier: 'premium',
    },
    {
      id: 'gpt-3.5-turbo',
      name: 'GPT-3.5 Turbo',
      provider: 'OpenAI',
      description: 'Fast and efficient for most tasks',
      tier: 'standard',
    },
    {
      id: 'claude-3-sonnet',
      name: 'Claude 3 Sonnet',
      provider: 'Anthropic',
      description: 'Balanced performance and speed',
      tier: 'premium',
    },
    {
      id: 'gemini-pro',
      name: 'Gemini Pro',
      provider: 'Google',
      description: 'Google\'s most capable model',
      tier: 'premium',
    },
  ];

  return (
    <SidebarGroup>
      <SidebarGroupLabel>AI Models</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {models.map((model) => (
            <SidebarMenuItem key={model.id}>
              <SidebarMenuButton
                onClick={() => setSelectedModel(model.id)}
                className="h-auto p-3"
              >
                <div className="flex items-start gap-3 w-full">
                  <Bot className="h-5 w-5 mt-0.5 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{model.name}</span>
                      {model.tier === 'premium' && (
                        <Badge variant="secondary" className="text-xs">
                          <Zap className="h-3 w-3 mr-1" />
                          Pro
                        </Badge>
                      )}
                      {selectedModel === model.id && (
                        <Check className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {model.provider}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {model.description}
                    </div>
                  </div>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}