import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/login', '/api/auth/login', '/api/auth/logout', '/api/redirect', '/api/track'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    return NextResponse.next();
  }

  // Check auth cookie
  const authCookie = request.cookies.get('split-auth')?.value;
  const adminPassword = process.env.ADMIN_PASSWORD || 'split2024';
  const expectedHash = Buffer.from(adminPassword).toString('base64');

  if (authCookie !== expectedHash) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|pixel.js).*)'],
};
