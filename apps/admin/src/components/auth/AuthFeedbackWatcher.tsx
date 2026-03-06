'use client';

import { showToast } from '@/components/Toast';
import { appName } from '@/utils/constants';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef } from 'react';

const AuthFeedbackWatcher = () => {
  const searchParams = useSearchParams();
  const hasShown = useRef<string | null>(null);

  useEffect(() => {
    const toastType = searchParams.get('toast');

    if (!toastType || hasShown.current === toastType) return;

    switch (toastType) {
      case 'welcome':
        showToast.success(`Welcome back to ${appName}!`);
        break;
      case 'logout_success':
        showToast.success('You have successfully logged out.');
        break;
      case 'session_expired':
        showToast.error('Your session has expired. Please sign in again.');
        break;
      default:
        return;
    }

    hasShown.current = toastType;

    const url = new URL(window.location.href);
    url.searchParams.delete('toast');
    window.history.replaceState({}, '', url.pathname + url.search);
  }, [searchParams]);

  return null;
};

export default function AuthFeedbackHandler() {
  return (
    <Suspense fallback={null}>
      <AuthFeedbackWatcher />
    </Suspense>
  );
}
