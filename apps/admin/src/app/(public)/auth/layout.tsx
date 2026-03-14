'use client';

import ThemeFixedPlugin from '@/components/plugins/ThemeFixedPlugin';
import { PropsWithChildren } from 'react';

interface AuthProps extends PropsWithChildren {}

export default function AuthLayout({ children }: AuthProps) {
  return (
    <div className="relative float-right h-full min-h-screen w-full ">
      <main className={`mx-auto min-h-screen`}>
        <ThemeFixedPlugin />
        {children}
      </main>
    </div>
  );
}
