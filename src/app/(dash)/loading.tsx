import { Skeleton } from '@/components/ui/skeleton';

export default function DashLoading() {
  return (
    <div className="flex flex-1 flex-col">
      {/* Header skeleton */}
      <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4 lg:px-6">
        <Skeleton className="h-8 w-8" />
        <Skeleton className="h-4 w-px" />
        <Skeleton className="h-4 w-24" />
      </header>

      <div className="flex flex-1 flex-col gap-2 p-4 lg:p-6">
        {/* Section cards skeleton */}
        <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-lg border p-4">
              <Skeleton className="mb-2 h-4 w-24" />
              <Skeleton className="mb-4 h-8 w-32" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>

        {/* Chart skeleton */}
        <div className="rounded-lg border p-4">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <Skeleton className="mb-2 h-5 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="h-8 w-40" />
          </div>
          <Skeleton className="h-[250px] w-full" />
        </div>

        {/* Data table skeleton */}
        <div className="rounded-lg border">
          <div className="flex items-center justify-between border-b p-4">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-8 w-24" />
          </div>
          <div className="p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="mb-4 flex gap-4">
                <Skeleton className="h-4 w-8" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
