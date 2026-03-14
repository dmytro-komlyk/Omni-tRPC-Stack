import jwt from 'jsonwebtoken';

import type { NextRequest } from 'next/server';

import { NextResponse } from 'next/server';

import { baseUrl } from './utils/constants';

import { auth } from './utils/next-auth';

const COOKIE_DOMAIN = process.env.APP_HOSTNAME;

export async function proxy(request: NextRequest) {
  const { pathname, search, origin } = request.nextUrl;

  const response = NextResponse.next();

  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') || // (png, ico, json, .well-known)
    pathname === '/favicon.ico'
  ) {
    return response;
  }

  const isProduction = process.env.NODE_ENV === 'production';
  const isAuthRoute = pathname.startsWith('/auth');

  const session = await auth();

  if (!session?.user) {
    if (isAuthRoute) {
      return response;
    }

    const signInUrl = new URL('/auth/sign-in', origin);

    if (pathname !== '/' && !pathname.includes('/auth')) {
      signInUrl.searchParams.set('callbackUrl', `${pathname}${search}`);
    }

    return NextResponse.redirect(signInUrl);
  }

  if (session?.user) {
    const { forcePasswordChange, isTwoFactorEnabled, requires2FA } = session.user;

    if (
      pathname.startsWith('/auth') &&
      !requires2FA &&
      isTwoFactorEnabled &&
      !forcePasswordChange
    ) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    if (requires2FA) {
      if (pathname !== '/auth/two-factor/verify') {
        return NextResponse.redirect(new URL('/auth/two-factor/verify', request.url));
      }

      return response;
    }

    if (forcePasswordChange || !isTwoFactorEnabled) {
      if (pathname !== '/profile/onboarding') {
        return NextResponse.redirect(new URL('/profile/onboarding', request.url));
      }

      return response;
    }
  }

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
