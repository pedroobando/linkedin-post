'use client';

import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ThumbsUp, MessageCircle, Repeat2, Send, Smartphone, Monitor, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface LinkedInPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
  authorName?: string;
  authorAvatar?: string;
  authorHeadline?: string;
  tags?: string[];
}

/**
 * LinkedIn Preview Component
 * 
 * Shows how the article will appear on LinkedIn in both
 * mobile and desktop layouts.
 * 
 * Features:
 * - Mobile/Desktop toggle
 * - Real-time content preview
 * - Author info display
 * - Engagement buttons (visual only)
 * - Tag display
 */
export function LinkedInPreview({
  isOpen,
  onClose,
  title,
  content,
  authorName = 'Your Name',
  authorAvatar,
  authorHeadline = 'Your Professional Headline',
  tags = [],
}: LinkedInPreviewProps) {
  const [viewMode, setViewMode] = useState<'mobile' | 'desktop'>('desktop');

  // Format content for preview (handles both plain text and HTML)
  const formatContent = (text: string): string => {
    // If content contains HTML tags, strip them
    if (text.includes('<') && text.includes('>')) {
      return text
        .replace(/<p>/g, '')
        .replace(/<\/p>/g, '\n\n')
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<li>/g, '• ')
        .replace(/<\/li>/g, '\n')
        .replace(/<[^>]*>/g, '')
        .trim();
    }
    // Plain text - return as is
    return text.trim();
  };

  const formattedContent = formatContent(content);
  const contentLength = formattedContent.length;
  const isOverLimit = contentLength > 3000;

  const renderMobileView = () => (
    <div className="max-w-[375px] mx-auto bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden">
      {/* Mobile Header */}
      <div className="flex items-center gap-3 p-3 border-b">
        <Avatar className="h-10 w-10">
          <AvatarImage src={authorAvatar} />
          <AvatarFallback className="bg-primary text-primary-foreground">
            {authorName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">
            {authorName}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {authorHeadline}
          </div>
          <div className="text-xs text-gray-400 dark:text-gray-500">
            {format(new Date(), 'MMM d')} • 🌐
          </div>
        </div>
      </div>

      {/* Mobile Content */}
      <div className="p-3 space-y-3">
        {/* Title */}
        {title && (
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-base">
            {title}
          </h3>
        )}
        
        {/* Content */}
        <div className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
          {formattedContent}
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 5).map((tag) => (
              <Badge 
                key={tag} 
                variant="outline" 
                className="text-xs text-primary border-primary/30"
              >
                #{tag.toLowerCase().replace(/\s+/g, '')}
              </Badge>
            ))}
            {tags.length > 5 && (
              <Badge variant="outline" className="text-xs">
                +{tags.length - 5} more
              </Badge>
            )}
          </div>
        )}

        {/* Character Limit Warning */}
        {isOverLimit && (
          <div className="text-xs text-destructive font-medium">
            ⚠️ Content exceeds LinkedIn limit by {contentLength - 3000} characters
          </div>
        )}
      </div>

      {/* Mobile Engagement */}
      <div className="px-3 py-2 border-t">
        <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
          <button className="flex items-center gap-1 text-xs hover:text-gray-700 dark:hover:text-gray-300">
            <ThumbsUp className="h-4 w-4" />
            <span>Like</span>
          </button>
          <button className="flex items-center gap-1 text-xs hover:text-gray-700 dark:hover:text-gray-300">
            <MessageCircle className="h-4 w-4" />
            <span>Comment</span>
          </button>
          <button className="flex items-center gap-1 text-xs hover:text-gray-700 dark:hover:text-gray-300">
            <Repeat2 className="h-4 w-4" />
            <span>Repost</span>
          </button>
          <button className="flex items-center gap-1 text-xs hover:text-gray-700 dark:hover:text-gray-300">
            <Send className="h-4 w-4" />
            <span>Send</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderDesktopView = () => (
    <div className="max-w-[550px] mx-auto bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden">
      {/* Desktop Header */}
      <div className="flex items-start gap-3 p-4">
        <Avatar className="h-12 w-12">
          <AvatarImage src={authorAvatar} />
          <AvatarFallback className="bg-primary text-primary-foreground text-lg">
            {authorName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="font-semibold text-gray-900 dark:text-gray-100 hover:text-primary cursor-pointer">
            {authorName}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {authorHeadline}
          </div>
          <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            {format(new Date(), 'MMM d')} • 🌐
          </div>
        </div>
      </div>

      {/* Desktop Content */}
      <div className="px-4 pb-4 space-y-3">
        {/* Title */}
        {title && (
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
            {title}
          </h3>
        )}
        
        {/* Content */}
        <div className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
          {formattedContent}
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <Badge 
                key={tag} 
                variant="outline" 
                className="text-xs text-primary border-primary/30 hover:bg-primary/5 cursor-pointer"
              >
                #{tag.toLowerCase().replace(/\s+/g, '')}
              </Badge>
            ))}
          </div>
        )}

        {/* Character Limit Warning */}
        {isOverLimit && (
          <div className="flex items-center gap-2 text-sm text-destructive font-medium bg-destructive/10 p-2 rounded">
            <X className="h-4 w-4" />
            Content exceeds LinkedIn limit by {contentLength - 3000} characters
          </div>
        )}
      </div>

      {/* Desktop Engagement */}
      <div className="px-4 py-3 border-t">
        <div className="flex items-center justify-between">
          <button className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 px-3 py-2 rounded transition-colors">
            <ThumbsUp className="h-5 w-5" />
            <span className="text-sm font-medium">Like</span>
          </button>
          <button className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 px-3 py-2 rounded transition-colors">
            <MessageCircle className="h-5 w-5" />
            <span className="text-sm font-medium">Comment</span>
          </button>
          <button className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 px-3 py-2 rounded transition-colors">
            <Repeat2 className="h-5 w-5" />
            <span className="text-sm font-medium">Repost</span>
          </button>
          <button className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 px-3 py-2 rounded transition-colors">
            <Send className="h-5 w-5" />
            <span className="text-sm font-medium">Send</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>LinkedIn Preview</DialogTitle>
          <DialogDescription>
            See how your article will appear on LinkedIn
          </DialogDescription>
        </DialogHeader>

        {/* View Mode Toggle */}
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'mobile' | 'desktop')}>
          <TabsList className="grid w-full max-w-[200px] mx-auto grid-cols-2">
            <TabsTrigger value="desktop" className="gap-2">
              <Monitor className="h-4 w-4" />
              Desktop
            </TabsTrigger>
            <TabsTrigger value="mobile" className="gap-2">
              <Smartphone className="h-4 w-4" />
              Mobile
            </TabsTrigger>
          </TabsList>

          <div className="mt-6 bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
            <TabsContent value="desktop" className="mt-0">
              {renderDesktopView()}
            </TabsContent>
            <TabsContent value="mobile" className="mt-0">
              {renderMobileView()}
            </TabsContent>
          </div>
        </Tabs>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-muted-foreground pt-2 border-t">
          <div>
            Characters: <span className={cn('font-medium', isOverLimit && 'text-destructive')}>
              {contentLength.toLocaleString()}
            </span> / 3,000
          </div>
          <div>
            {tags.length} tag{tags.length !== 1 ? 's' : ''}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}