'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AuthSchema, trpc } from '@package/api';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Text, View } from 'react-native';
import { Button, HelperText, TextInput } from 'react-native-paper';
import { Toast } from 'toastify-react-native';

export default function ResetPassword() {
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);

  const { token, email } = useLocalSearchParams<{ token: string; email: string }>();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<AuthSchema.ResetPasswordFormData>({
    resolver: zodResolver(AuthSchema.resetPasswordFormSchema),
    defaultValues: { password: '', passwordConfirmation: '' },
  });

  const resetPassword = trpc.auth.resetPassword.useMutation();

  const onSubmit = async (data: AuthSchema.ResetPasswordFormData) => {
    try {
      const response = await resetPassword.mutateAsync({
        token,
        email,
        password: data.password,
      });
      Toast.success(response.message);
      router.replace('/(auth)/login');
    } catch (error: any) {
      Toast.error(error.message || 'Failed to reset password');
    }
  };

  return (
    <View className="flex-1 justify-center p-6 bg-background">
      <Text className="text-2xl font-bold text-center mb-6">Create New Password</Text>

      <View className="mb-2">
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="Password"
              mode="outlined"
              secureTextEntry={!showPassword}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={!!errors.password}
              right={
                <TextInput.Icon
                  icon={showPassword ? 'eye-off' : 'eye'}
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
              className="bg-transparent"
            />
          )}
        />
        <HelperText type="error" visible={!!errors.password}>
          {errors.password?.message}
        </HelperText>
      </View>

      <View className="mb-6">
        <Controller
          control={control}
          name="passwordConfirmation"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="Confirm Password"
              mode="outlined"
              secureTextEntry={!showPasswordConfirmation}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={!!errors.passwordConfirmation}
              right={
                <TextInput.Icon
                  icon={showPasswordConfirmation ? 'eye-off' : 'eye'}
                  onPress={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                />
              }
              className="bg-transparent"
            />
          )}
        />
        <HelperText type="error" visible={!!errors.passwordConfirmation}>
          {errors.passwordConfirmation?.message}
        </HelperText>
      </View>

      <Button
        mode="contained"
        onPress={handleSubmit(onSubmit)}
        loading={resetPassword.isPending}
        disabled={resetPassword.isPending}
        className="rounded-full py-1"
      >
        Reset Password
      </Button>
    </View>
  );
}
