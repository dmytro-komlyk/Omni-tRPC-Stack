import Cookies from 'js-cookie';

export function setThemeCookie(theme: string) {
  const domain = process.env.NODE_ENV === 'production' ? '.gages.io' : '.gages.localhost';

  Cookies.set('theme', theme, {
    domain,
    path: '/',
    expires: 365,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
}
