'use client';

import { trpc } from '@package/api/client';
import { AuthSchema } from '@package/api/schema';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Button, Checkbox, HelperText, TextInput } from 'react-native-paper';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';

import { Toast } from 'toastify-react-native';

export default function Register() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<AuthSchema.SignUpFormData>({
    resolver: zodResolver(AuthSchema.signUpFormSchema),
    mode: 'onChange',
    defaultValues: {
      nickName: '',
      email: '',
      password: '',
      passwordConfirmation: '',
      isTwoFactorEnabled: false,
    },
  });

  const signUpMutation = trpc.auth.register.useMutation();

  const onSubmit = async (data: AuthSchema.SignUpFormData) => {
    setIsSubmitting(true);
    try {
      const response = await signUpMutation.mutateAsync(data);
      if (response.success) {
        Toast.success(
          response.message ||
            'Registration successful! Please check your email to verify your account.'
        );
        router.replace('/(auth)/login');
      }
    } catch (error: any) {
      Toast.error(error.message || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerClassName="flex-grow justify-center p-6 bg-background">
      <Text className="text-3xl font-bold text-center mb-8 text-foreground">Sign Up</Text>

      {/* Nickname */}
      <View className="mb-2">
        <Controller
          control={control}
          name="nickName"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="Nickname"
              mode="outlined"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={!!errors.nickName}
              className="bg-transparent"
            />
          )}
        />
        <HelperText type="error" visible={!!errors.nickName} className="px-1">
          {errors.nickName?.message}
        </HelperText>
      </View>

      {/* Email */}
      <View className="mb-2">
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
              className="bg-transparent"
            />
          )}
        />
        <HelperText type="error" visible={!!errors.email} className="px-1">
          {errors.email?.message}
        </HelperText>
      </View>

      {/* Password */}
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
        <HelperText type="error" visible={!!errors.password} className="px-1">
          {errors.password?.message}
        </HelperText>
      </View>

      {/* Confirm Password */}
      <View className="mb-2">
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
        <HelperText type="error" visible={!!errors.passwordConfirmation} className="px-1">
          {errors.passwordConfirmation?.message}
        </HelperText>
      </View>

      {/* 2FA Checkbox */}
      <View className="flex-row items-center mb-6 ml-1">
        <Controller
          control={control}
          name="isTwoFactorEnabled"
          render={({ field: { onChange, value } }) => (
            <TouchableOpacity
              onPress={() => onChange(!value)}
              activeOpacity={0.7}
              className="flex-row items-center"
            >
              <View className="mr-2 bg-white rounded-lg">
                <Checkbox
                  status={value ? 'checked' : 'unchecked'}
                  onPress={() => onChange(!value)}
                  color="#6200ee"
                />
              </View>
              <Text className="text-sm font-medium text-foreground ml-1">
                Enable 2FA (Two-Factor Authentication)
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <Button
        mode="contained"
        onPress={handleSubmit(onSubmit)}
        loading={isSubmitting}
        disabled={isSubmitting || !isValid}
        className="h-14 rounded-xl py-1 bg-primary"
      >
        <Text className="text-white font-bold text-base">Create Account</Text>
      </Button>

      <TouchableOpacity onPress={() => router.push('/(auth)/login')} className="mt-6">
        <Text className="text-center text-primary mt-4">
          Already have an account? <Text className="font-bold">Sign in</Text>
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
