'use client';

import { FACEBOOK_APP_ID } from '@/keys';
import { trpc } from '@package/api/client';
import { useAuthStore } from '@package/store/auth-native';
import * as AuthSession from 'expo-auth-session';
import * as Facebook from 'expo-auth-session/providers/facebook';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import { Toast } from 'toastify-react-native';

WebBrowser.maybeCompleteAuthSession();

export function useFacebookAuth() {
  const { login } = useAuthStore();
  const [isProcessing, setIsProcessing] = useState(false);

  const loginMobileProvider = trpc.auth.loginMobileProvider.useMutation();

  const [request, response, promptAsync] = Facebook.useAuthRequest({
    clientId: FACEBOOK_APP_ID,
    scopes: ['public_profile', 'email'],
    redirectUri: AuthSession.makeRedirectUri({
      scheme: `fb${FACEBOOK_APP_ID}`,
      native: `fb${FACEBOOK_APP_ID}://authorize`,
    }),
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const token = response.authentication?.accessToken;

      if (token) {
        handleBackendLogin(token);
      } else {
        setIsProcessing(false);
        Toast.error("Facebook didn't provide an access token");
      }
    } else if (response?.type === 'cancel' || response?.type === 'error') {
      setIsProcessing(false);
    }
  }, [response]);

  const handleBackendLogin = async (token: string) => {
    try {
      const res = await loginMobileProvider.mutateAsync({
        token: token,
        provider: 'facebook',
      });

      await login({
        user: res.user,
        access: res.accessToken,
        refresh: res.refreshToken || res.sessionToken,
        session: res.sessionToken,
      });

      Toast.success(`Welcome back, ${res.user.nickName}!`);
    } catch (error: any) {
      console.error('Facebook Backend Auth Error:', error);
      Toast.error('Server authentication failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const signIn = async () => {
    setIsProcessing(true);
    try {
      const result = await promptAsync();
      if (result.type !== 'success') {
        setIsProcessing(false);
      }
    } catch (e) {
      setIsProcessing(false);
      Toast.error('Failed to open Facebook login');
    }
  };

  return {
    signIn,
    isLoading: !request || isProcessing || loginMobileProvider.isPending,
  };
}
