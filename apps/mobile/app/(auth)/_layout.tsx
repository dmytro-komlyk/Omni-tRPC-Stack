'use client';

import { useAuthStore } from '@package/store/auth-native';
import { Redirect, Stack } from 'expo-router';
import { ActivityIndicator } from 'react-native-paper';

export default function AuthLayout() {
  const { accessToken, isAuthenticated, isHydrated, isLoading } = useAuthStore();

  if (!isHydrated) return null;

  if (isAuthenticated || accessToken) {
    return <Redirect href="/(tabs)" />;
  }

  if (isLoading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
    </Stack>
  );
}
