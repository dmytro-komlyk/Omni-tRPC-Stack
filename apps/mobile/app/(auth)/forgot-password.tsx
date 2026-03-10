'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AuthSchema, trpc } from '@package/api';
import { router } from 'expo-router';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Text, View } from 'react-native';
import { Button, HelperText, TextInput } from 'react-native-paper';
import { Toast } from 'toastify-react-native';

export default function ForgotPassword() {
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<AuthSchema.ForgotPasswordFormData>({
    resolver: zodResolver(AuthSchema.forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const forgotPassword = trpc.auth.forgotPassword.useMutation();

  const onSubmit = async (data: AuthSchema.ForgotPasswordFormData) => {
    try {
      const response = await forgotPassword.mutateAsync(data);
      Toast.success(response.message);
      router.back();
    } catch (error: any) {
      Toast.error(error.message || 'Error sending reset link');
    }
  };

  return (
    <View className="flex-1 justify-center p-6 bg-background">
      <Text className="text-3xl font-bold text-center mb-2">Reset Password</Text>
      <Text className="text-gray-500 text-center mb-8">
        Enter your email and we'll send you a link to reset your password.
      </Text>

      <View className="mb-4">
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="Email"
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={!!errors.email}
            />
          )}
        />
        <HelperText type="error" visible={!!errors.email}>
          {errors.email?.message}
        </HelperText>
      </View>

      <Button
        mode="contained"
        onPress={handleSubmit(onSubmit)}
        loading={forgotPassword.isPending}
        disabled={!isValid || forgotPassword.isPending}
        className="rounded-full py-1"
      >
        Send Link
      </Button>

      <Button mode="text" onPress={() => router.back()} className="mt-2">
        Back to Login
      </Button>
    </View>
  );
}
