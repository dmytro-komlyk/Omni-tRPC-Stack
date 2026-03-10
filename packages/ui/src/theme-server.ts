import { cookies } from 'next/headers';

export async function getDefaultThemeFromCookie() {
  const cookieStore = await cookies();
  const themeRaw = cookieStore.get('theme')?.value;

  if (!themeRaw) return 'system';

  try {
    const decoded = decodeURIComponent(themeRaw);
    const parsed = JSON.parse(decoded);
    return parsed?.state?.theme || 'system';
  } catch (e) {
    if (themeRaw === 'dark' || themeRaw === 'light') return themeRaw;
    console.error('Error parsing theme cookie:', e);
    return 'system';
  }
}
