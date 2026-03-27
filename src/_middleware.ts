import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';

export async function middleware(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  const { pathname } = req.nextUrl;

  // Protected routes
  const isDashboardRoute = pathname.startsWith('/dashboard');
  const isAdminRoute = pathname.startsWith('/admin');

  if (isDashboardRoute || isAdminRoute) {
    if (!session?.session) {
      const loginUrl = new URL('/auth/login', req.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Admin route protection - check for admin role
    if (isAdminRoute && session.user.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
};
