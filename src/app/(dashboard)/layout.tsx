// FIXME: Authentication temporarily disabled for development
// import { redirect } from 'next/navigation';
// import { headers } from 'next/headers';
// import { auth } from '@/lib/auth';
import { ProviderDashboard } from '@/components/provider/provider-dashboard';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // TODO: Re-enable auth check when Better Auth is fully configured
  // const session = await auth.api.getSession({
  //   headers: await headers(),
  // });
  // if (!session) {
  //   redirect('/signin');
  // }

  return (
    <ProviderDashboard userRole="user">
      {children}
    </ProviderDashboard>
  );
}
