'use client';

import { trpc } from '@package/api/client';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Toast } from 'toastify-react-native';

export default function VerifyEmailScreen() {
  const { token, email } = useLocalSearchParams<{ token: string; email: string }>();

  const verifyMutation = trpc.auth.verifyEmail.useMutation();

  useEffect(() => {
    if (token && email) {
      handleVerify();
    }
  }, [token, email]);

  const handleVerify = async () => {
    try {
      await verifyMutation.mutateAsync({ token, email });
      Toast.success('Email successfully verified!');
      router.replace('/(auth)/login');
    } catch (e: any) {
      Toast.error(e.message || 'Error verifying email. Please try again.');
      router.replace('/(auth)/login');
    }
  };

  return (
    <View className="flex-1 justify-center items-center bg-background p-6">
      <ActivityIndicator size="large" color="#6200ee" />
      <Text className="mt-4 text-center">Verifying your email...</Text>
      <Text className="text-gray-400 text-xs mt-2">{email}</Text>
    </View>
  );
}
