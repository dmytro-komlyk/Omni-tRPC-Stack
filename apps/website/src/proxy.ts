import jwt from 'jsonwebtoken';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { baseUrl } from './utils/constants';
import { auth } from './utils/next-auth';

const COOKIE_DOMAIN = process.env.APP_HOSTNAME;

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const isProduction = process.env.NODE_ENV === 'production';

  const response = NextResponse.next();

  const isPublicRoute =
    pathname === '/' ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname === '/favicon.ico';

  if (isPublicRoute) {
    return response;
  }

  const session = await auth();

  if (!session?.user?.accessToken) {
    const signInUrl = new URL('/auth/sign-in', request.url);
    signInUrl.searchParams.set('callbackUrl', `${pathname}${search}`);

    const redirectResponse = NextResponse.redirect(signInUrl);

    return redirectResponse;
  }

  const token = jwt.decode(session.user.accessToken) as { exp?: number } | null;
  const now = Math.floor(Date.now() / 1000);

  if (token?.exp && token.exp < now) {
    const location = `${baseUrl}/auth/sign-in`;

    const deleteCookie = (name: string) =>
      `${
        isProduction ? '__Secure-' : ''
      }${name}=deleted; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; domain=${COOKIE_DOMAIN}`;

    const headers = new Headers();
    headers.set('Location', location);
    headers.append('Set-Cookie', deleteCookie('authjs.session-token'));
    headers.append('Set-Cookie', deleteCookie('authjs.csrf-token'));
    headers.append('Set-Cookie', deleteCookie('authjs.callback-url'));

    return new Response(null, { status: 302, headers });
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|static|api).*)'],
};
