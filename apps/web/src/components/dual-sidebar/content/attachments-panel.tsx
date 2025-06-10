// components/dual-sidebar/content/attachments-panel.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  FileText, 
  Image, 
  X, 
  Download,
  Eye
} from 'lucide-react';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from '@/components/ui/sidebar';

export function AttachmentsPanel() {
  const [attachments, setAttachments] = useState([
    {
      id: '1',
      name: 'document.pdf',
      type: 'pdf',
      size: '2.4 MB',
      status: 'uploaded',
    },
    {
      id: '2',
      name: 'screenshot.png',
      type: 'image',
      size: '1.2 MB',
      status: 'uploading',
      progress: 65,
    },
  ]);

  const removeAttachment = (id: string) => {
    setAttachments(attachments.filter(att => att.id !== id));
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
      case 'doc':
        return FileText;
      case 'image':
        return Image;
      default:
        return FileText;
    }
  };

  return (
    <div className="p-4 space-y-4">
      <SidebarGroup>
        <SidebarGroupLabel>Upload Files</SidebarGroupLabel>
        <SidebarGroupContent>
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-2">
              Drop files here or click to browse
            </p>
            <Button variant="outline" size="sm">
              Choose Files
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Supports PDF, PNG, JPG up to 10MB
            </p>
          </div>
        </SidebarGroupContent>
      </SidebarGroup>

      {attachments.length > 0 && (
        <SidebarGroup>
          <SidebarGroupLabel>Attached Files</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="space-y-3">
              {attachments.map((attachment) => {
                const FileIcon = getFileIcon(attachment.type);
                
                return (
                  <div key={attachment.id} className="flex items-start gap-3 p-2 rounded-lg border">
                    <FileIcon className="h-4 w-4 mt-1 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium truncate">
                          {attachment.name}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {attachment.size}
                        </Badge>
                      </div>
                      
                      {attachment.status === 'uploading' && attachment.progress && (
                        <div className="space-y-1">
                          <Progress value={attachment.progress} className="h-1" />
                          <p className="text-xs text-muted-foreground">
                            Uploading... {attachment.progress}%
                          </p>
                        </div>
                      )}
                      
                      {attachment.status === 'uploaded' && (
                        <div className="flex items-center gap-1 mt-1">
                          <Button variant="ghost" size="sm" className="h-6 px-1">
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-6 px-1">
                            <Download className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 px-1 text-destructive hover:text-destructive"
                            onClick={() => removeAttachment(attachment.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      )}
    </div>
  );
}