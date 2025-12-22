'use client';

import { useThemeCookieStore } from '@package/store';
import { ThemeProvider } from 'next-themes';
import React from 'react';

export function ThemeUIProvider({
  children,
  defaultThemeFromCookie,
}: {
  children: React.ReactNode;
  defaultThemeFromCookie: string;
}) {
  const { theme: zustandTheme, _hasHydrated } = useThemeCookieStore();

  React.useEffect(() => {
    if (_hasHydrated) {
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(zustandTheme);
    }
  }, [zustandTheme, _hasHydrated]);

  if (!_hasHydrated) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="size-16 animate-spin rounded-full border-t-4 border-blue-500" />
      </div>
    );
  }

  return (
    <ThemeProvider
      attribute="class"
      forcedTheme={_hasHydrated ? zustandTheme : undefined}
      defaultTheme={defaultThemeFromCookie}
      enableSystem={false}
      disableTransitionOnChange
      storageKey={undefined}
      enableColorScheme={false}
    >
      {children}
    </ThemeProvider>
  );
}
