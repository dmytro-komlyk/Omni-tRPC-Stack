import { cookies } from 'next/headers';

export async function getDefaultThemeFromCookie() {
  const cookieStore = await cookies();
  const theme = cookieStore.get('theme')?.value;
  return theme || 'system';
}
