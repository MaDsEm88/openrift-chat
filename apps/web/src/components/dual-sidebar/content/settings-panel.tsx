// components/dual-sidebar/content/settings-panel.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from '@/components/ui/sidebar';

export function SettingsPanel() {
  const [settings, setSettings] = useState({
    theme: 'dark',
    streaming: true,
    syntaxHighlight: true,
    temperature: [0.7],
    maxTokens: [2048],
  });

  return (
    <div className="p-4 space-y-4">
      <SidebarGroup>
        <SidebarGroupLabel>Appearance</SidebarGroupLabel>
        <SidebarGroupContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="theme-select">Theme</Label>
            <Select value={settings.theme} onValueChange={(value) => setSettings({...settings, theme: value})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="syntax-highlight"
              checked={settings.syntaxHighlight}
              onCheckedChange={(checked) => setSettings({...settings, syntaxHighlight: checked})}
            />
            <Label htmlFor="syntax-highlight">Syntax highlighting</Label>
          </div>
        </SidebarGroupContent>
      </SidebarGroup>

      <Separator />

      <SidebarGroup>
        <SidebarGroupLabel>Chat Behavior</SidebarGroupLabel>
        <SidebarGroupContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="streaming"
              checked={settings.streaming}
              onCheckedChange={(checked) => setSettings({...settings, streaming: checked})}
            />
            <Label htmlFor="streaming">Stream responses</Label>
          </div>
          
          <div className="space-y-2">
            <Label>Temperature: {settings.temperature[0]}</Label>
            <Slider
              value={settings.temperature}
              onValueChange={(value) => setSettings({...settings, temperature: value})}
              max={2}
              min={0}
              step={0.1}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Controls randomness in responses
            </p>
          </div>
          
          <div className="space-y-2">
            <Label>Max Tokens: {settings.maxTokens[0]}</Label>
            <Slider
              value={settings.maxTokens}
              onValueChange={(value) => setSettings({...settings, maxTokens: value})}
              max={4096}
              min={256}
              step={256}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Maximum response length
            </p>
          </div>
        </SidebarGroupContent>
      </SidebarGroup>

      <Separator />

      <SidebarGroup>
        <SidebarGroupContent>
          <Button className="w-full">Save Settings</Button>
        </SidebarGroupContent>
      </SidebarGroup>
    </div>
  );
}