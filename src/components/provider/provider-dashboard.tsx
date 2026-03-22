'use client';

import { SidebarInset, SidebarProvider, SidebarTrigger } from '../ui/sidebar';
import { AppSidebar } from '../dash/app-sidebar';
import { DashboardHeader } from '../dashboard/dashboard-header';
import { Separator } from '../ui/separator';
import { authClient } from '@/lib/authClient';

const { useSession } = authClient;

interface Props {
  children: React.ReactNode;
  userRole: string;
}

export const ProviderDashboard: React.FC<Props> = ({ children }) => {
  const { data: session } = useSession();

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
          </div>
          <DashboardHeader user={session?.user} />
        </header>
        <main className="flex-1 overflow-auto p-4">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
};
