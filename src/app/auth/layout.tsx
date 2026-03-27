import { getServerSession } from '@/lib/get-session';
import { redirect } from 'next/navigation';

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();
  const user = session?.user;

  if (user) redirect('/admin');
  return <section>{children}</section>;
}
