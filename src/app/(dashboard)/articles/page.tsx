import { Suspense } from 'react';
import { ArticlesList } from '@/components/dashboard/articles-list';
import { Skeleton } from '@/components/ui/skeleton';

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Articles</h1>
          <p className="text-muted-foreground">
            Manage your LinkedIn articles and posts
          </p>
        </div>
      </div>

      <Suspense fallback={<ArticlesListSkeleton />}>
        <ArticlesList searchParams={params} />
      </Suspense>
    </div>
  );
}

function ArticlesListSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-[300px]" />
        <Skeleton className="h-10 w-[120px]" />
      </div>
      <Skeleton className="h-[400px] w-full" />
    </div>
  );
}
