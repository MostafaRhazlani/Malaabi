import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Maps route prefix → required role value (as stored in the user_role cookie)
const ROLE_ROUTES: Record<string, string> = {
  '/dashboard/admin': 'ADMIN',
  '/dashboard/manager': 'MANAGER',
};

export function proxy(request: NextRequest) {
  const accessToken = request.cookies.get('access_token')?.value;
  const userRole = request.cookies.get('user_role')?.value?.toUpperCase();
  const { pathname } = request.nextUrl;

  // Unauthenticated → login
  if (pathname.startsWith('/dashboard') && !accessToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Authenticated but wrong role for this route → unauthorized
  if (accessToken) {
    for (const [route, requiredRole] of Object.entries(ROLE_ROUTES)) {
      if (pathname.startsWith(route) && userRole !== requiredRole) {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
    }
  }

  // Already authenticated → redirect away from login
  if (pathname === '/login' && accessToken) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
};
