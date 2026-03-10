'use client';

import { useThemeCookieStore } from '@package/store/ui';
import * as React from 'react';
import { RiMoonFill, RiSunFill } from 'react-icons/ri';

export default function ThemeFixedPlugin({ ...rest }: React.ComponentProps<'button'>) {
  const { theme: zustandTheme, setTheme: setZustandTheme } = useThemeCookieStore();

  const handleThemeToggle = () => {
    const newTheme = zustandTheme === 'dark' ? 'light' : 'dark';
    setZustandTheme(newTheme);
  };

  return (
    <button
      className="border-px fixed bottom-7.5 right-8.75 z-99! flex h-15 w-15 items-center justify-center rounded-full border-[#6a53ff] bg-linear-to-br from-brand-400 to-brand-600 p-0"
      onClick={handleThemeToggle}
      {...rest}
    >
      <div className="cursor-pointer text-gray-600">
        {zustandTheme === 'dark' ? (
          <RiSunFill className="size-4 text-gray-600 dark:text-white" />
        ) : (
          <RiMoonFill className="size-4 text-gray-600 dark:text-white" />
        )}
      </div>
    </button>
  );
}
