import { Suspense } from 'react';
import { TagsList } from '@/components/admin/tags/tags-list';
import { TagsStats } from '@/components/admin/tags/tags-stats';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata = {
  title: 'Tags Management | LinkedIn Post',
  description: 'Manage article tags',
};

export default async function TagsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tags Management</h1>
        <p className="text-muted-foreground">
          Manage article tags, view usage statistics, and clean up orphaned tags
        </p>
      </div>

      {/* Stats Cards */}
      <Suspense fallback={<TagsStatsSkeleton />}>
        <TagsStats />
      </Suspense>

      {/* Tags DataTable */}
      <Suspense fallback={<TagsListSkeleton />}>
        <TagsList />
      </Suspense>
    </div>
  );
}

function TagsStatsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Skeleton className="h-24" />
      <Skeleton className="h-24" />
      <Skeleton className="h-24" />
    </div>
  );
}

function TagsListSkeleton() {
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
