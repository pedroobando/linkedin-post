'use client';

interface User {
  name?: string | null;
  email?: string | null;
}

interface DashboardHeaderProps {
  user?: User;
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  return (
    <div className="flex items-center gap-2">
      {user?.name && <span className="text-sm font-medium">{user.name}</span>}
      {user?.email && <span className="text-sm text-muted-foreground">{user.email}</span>}
    </div>
  );
}
