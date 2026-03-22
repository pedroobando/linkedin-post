'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { ArticleWithTags } from '@/actions/articles';

// Dynamic import to avoid SSR issues with client-side only features
const ArticleEditor = dynamic(
  () => import('@/components/editor/article-editor').then(mod => ({ default: mod.ArticleEditor })),
  {
    ssr: false,
    loading: () => <ArticleEditorSkeleton />,
  }
);

interface ArticleEditorWrapperProps {
  article?: ArticleWithTags | null;
}

function ArticleEditorSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-10 w-[300px]" />
        <Skeleton className="h-5 w-[200px]" />
      </div>
      
      <div className="grid gap-6 lg:grid-cols-[1fr,300px]">
        <div className="space-y-6">
          <Skeleton className="h-[500px] w-full" />
          <Skeleton className="h-[150px] w-full" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-[200px] w-full" />
          <Skeleton className="h-[250px] w-full" />
        </div>
      </div>
    </div>
  );
}

export function ArticleEditorWrapper({ article }: ArticleEditorWrapperProps) {
  return <ArticleEditor article={article} />;
}
