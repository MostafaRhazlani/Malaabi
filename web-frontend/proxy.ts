import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const accessToken = request.cookies.get('access_token')?.value;
  const { pathname } = request.nextUrl;

  // Protect all dashboard routes — redirect to login if no token
  if (pathname.startsWith('/dashboard') && !accessToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Redirect authenticated users away from the login page
  if (pathname === '/login' && accessToken) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
};
