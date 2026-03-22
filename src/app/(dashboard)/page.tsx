// FIXME: Authentication temporarily disabled for development
// import { headers } from 'next/headers';
// import { auth } from '@/lib/auth';
// import { redirect } from 'next/navigation';

import Link from 'next/link';

export default function DashboardPage() {
  // TODO: Re-enable auth check when Better Auth is fully configured
  // const session = await auth.api.getSession({
  //   headers: await headers(),
  // });
  // if (!session) {
  //   redirect('/signin');
  // }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          {/* Welcome back, {session.user.name || session.user.email}! */}
          Welcome to LinkedIn Post Manager!
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Stats cards will be added in Phase 4 */}
        <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <p className="text-sm font-medium">Total Articles</p>
          </div>
          <div className="text-2xl font-bold">-</div>
          <p className="text-xs text-muted-foreground">Coming in Phase 4</p>
        </div>

        <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <p className="text-sm font-medium">Published</p>
          </div>
          <div className="text-2xl font-bold">-</div>
          <p className="text-xs text-muted-foreground">Coming in Phase 4</p>
        </div>

        <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <p className="text-sm font-medium">Scheduled</p>
          </div>
          <div className="text-2xl font-bold">-</div>
          <p className="text-xs text-muted-foreground">Coming in Phase 4</p>
        </div>

        <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <p className="text-sm font-medium">Drafts</p>
          </div>
          <div className="text-2xl font-bold">-</div>
          <p className="text-xs text-muted-foreground">Coming in Phase 4</p>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
        <h2 className="text-lg font-semibold">Quick Actions</h2>
        <div className="mt-4 flex gap-4">
          <Link
            href="/articles/new"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Create New Article
          </Link>
          <Link
            href="/articles"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            View All Articles
          </Link>
        </div>
      </div>
    </div>
  );
}
