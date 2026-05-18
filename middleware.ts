import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

const PUBLIC_PATHS = [
  '/login',
  '/api/auth/login',
  '/api/auth/logout',
  '/api/redirect',
  '/api/track',
  '/api/stats',
  '/favicon.ico',
  '/_next',
  '/pixel.js',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rotas publicas
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    return NextResponse.next();
  }

  // Bloqueia se nao tiver cookie 'split-auth'
  const auth = request.cookies.get('split-auth')?.value;
  if (!auth) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
