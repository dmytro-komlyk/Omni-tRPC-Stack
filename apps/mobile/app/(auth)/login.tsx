'use client';

import { useFacebookAuth } from '@/hooks/use-facebook-auth';
import { useGoogleAuth } from '@/hooks/use-google-auth';
import { trpc } from '@package/api/client';
import { AuthSchema } from '@package/api/schema';
import { useAuthStore } from '@package/store/auth-native';
import { router } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';
import { Button, HelperText, TextInput } from 'react-native-paper';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';

import { Toast } from 'toastify-react-native';

export default function Login() {
  const { signIn: googleSignIn, isLoading: isGoogleLoading } = useGoogleAuth();
  const { signIn: facebookSignIn, isLoading: isFacebookLoading } = useFacebookAuth();
  const { login } = useAuthStore();

  const loginMutation = trpc.auth.login.useMutation();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<AuthSchema.SignInFormData>({
    resolver: zodResolver(AuthSchema.signInFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: AuthSchema.SignInData) => {
    try {
      const response = await loginMutation.mutateAsync({
        email: data.email,
        password: data.password,
      });

      await login({
        user: response.user,
        access: response.accessToken,
        refresh: response.refreshToken || '',
        session: response.sessionToken,
      });

      Toast.success(`Welcome back, ${response.user.nickName || 'user'}!`);
    } catch (error: any) {
      Toast.error(error.message || 'An error occurred during login. Please try again.');
    }
  };

  return (
    <View className="flex gap-1 flex-1 justify-center p-6 bg-background">
      <Text className="text-3xl font-bold mb-6 text-center">Sign in</Text>

      <View className="mb-1">
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="Email"
              mode="outlined"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              autoCapitalize="none"
              keyboardType="email-address"
              error={!!errors.email}
            />
          )}
        />
        <HelperText type="error" visible={!!errors.email}>
          {errors.email?.message}
        </HelperText>
      </View>

      <View className="mb-1">
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="Password"
              mode="outlined"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              secureTextEntry
              error={!!errors.password}
            />
          )}
        />
        <HelperText type="error" visible={!!errors.password}>
          {errors.password?.message}
        </HelperText>
      </View>
      <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')} className="mb-6">
        <Text className="text-primary font-medium ml-1">Forgot Password?</Text>
      </TouchableOpacity>
      <Button
        mode="contained"
        onPress={handleSubmit(onSubmit)}
        loading={loginMutation.isPending}
        disabled={loginMutation.isPending}
        className="rounded-full py-2"
      >
        Login
      </Button>

      <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
        <Text className="text-center text-primary mt-4">
          Don't have an account? <Text className="font-bold">Sign up</Text>
        </Text>
      </TouchableOpacity>

      <View className="flex-row items-center my-6">
        <View className="flex-1 h-[1px] bg-gray-300" />
        <Text className="mx-4 text-gray-500 font-medium">OR</Text>
        <View className="flex-1 h-[1px] bg-gray-300" />
      </View>

      <View className="flex-col gap-3">
        <Button
          mode="outlined"
          icon="google"
          className="rounded-lg py-1 border-gray-300"
          contentStyle={{ height: 48 }}
          onPress={googleSignIn}
          loading={isGoogleLoading}
          disabled={isGoogleLoading || isFacebookLoading || loginMutation.isPending}
        >
          Sign in with Google
        </Button>
        <Button
          mode="contained"
          icon="facebook"
          textColor="#fff"
          className="rounded-lg py-1"
          style={{ backgroundColor: '#1877F2' }}
          contentStyle={{ height: 48 }}
          onPress={facebookSignIn}
          loading={isFacebookLoading}
          disabled={isFacebookLoading || isGoogleLoading || loginMutation.isPending}
        >
          Sign in with Facebook
        </Button>
      </View>
    </View>
  );
}
