'use client';

import { HeroUIProvider } from '@heroui/react';
import { TrpcProvider } from '@package/api/provider';
import { ThemeUIProvider } from '@package/ui/ThemeProvider';
import type { Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React from 'react';

interface IProviderProps {
  children: React.ReactNode;
  session: Session | null;
  defaultThemeFromCookie: string;
}

export function Providers({ children, session, defaultThemeFromCookie }: IProviderProps) {
  const router = useRouter();

  return (
    <SessionProvider session={session}>
      <TrpcProvider>
        <ThemeUIProvider defaultThemeFromCookie={defaultThemeFromCookie}>
          <HeroUIProvider navigate={router.push}>{children}</HeroUIProvider>
        </ThemeUIProvider>
      </TrpcProvider>
    </SessionProvider>
  );
}
