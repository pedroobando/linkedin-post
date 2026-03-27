import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/get-session';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  if (!session?.user || session.user.role !== 'admin') {
    redirect('/dashboard');
  }

  return <>{children}</>;
}
