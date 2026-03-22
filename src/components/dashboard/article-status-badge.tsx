'use client';

import { ArticleStatus } from '@/actions/articles';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ArticleStatusBadgeProps {
  status: ArticleStatus;
  className?: string;
}

const statusConfig: Record<ArticleStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  draft: { label: 'Draft', variant: 'secondary' },
  scheduled: { label: 'Scheduled', variant: 'default' },
  published: { label: 'Published', variant: 'default' },
  archived: { label: 'Archived', variant: 'outline' },
};

const statusColors: Record<ArticleStatus, string> = {
  draft: 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200',
  scheduled: 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200',
  published: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200',
  archived: 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200',
};

export function ArticleStatusBadge({ status, className }: ArticleStatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <Badge
      variant={config.variant}
      className={cn(
        'capitalize',
        statusColors[status],
        className
      )}
    >
      {config.label}
    </Badge>
  );
}
