'use client';

import { Button, Input, Link as NextUILink } from '@heroui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthSchema } from '@package/api';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { IoEyeOffOutline, IoEyeOutline } from 'react-icons/io5';

import LoadingSpinner from '@/components/loading/LoadingSpinner';
import { showToast } from '@/components/Toast';

interface SignInProps {
  callbackUrl: string;
  defaultEmail?: string;
}

const SignIn = ({ callbackUrl, defaultEmail = '' }: SignInProps) => {
  const [isSubmittingCredentials, setIsSubmittingCredentials] = useState(false);
  const [isVisiblePassword, setIsVisiblePassword] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, touchedFields },
  } = useForm<AuthSchema.SignInData>({
    resolver: zodResolver(AuthSchema.signInSchema),
    defaultValues: {
      email: defaultEmail,
      password: '',
    },
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const toggleVisibilityPassword = () => setIsVisiblePassword(!isVisiblePassword);

  const onSubmit = async (data: AuthSchema.SignInData) => {
    setIsSubmittingCredentials(true);

    try {
      const result = await signIn('login', {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (result?.error) {
        showToast.error(result?.code as string);
        return;
      }
      const targetUrl = callbackUrl;
      window.location.href = targetUrl;
    } catch (error: any) {
      showToast.error(`${error.message}`);
    } finally {
      setIsSubmittingCredentials(false);
    }
  };

  return (
    <div className="w-full max-w-full flex-col items-center gap-6 md:max-w-105 md:pl-4 lg:pl-0">
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Email */}
        <Input
          {...register('email')}
          variant="bordered"
          label="Email*"
          placeholder="mail@simple.com"
          id="email"
          type="email"
          isInvalid={(!!errors.email && touchedFields.email) ?? false}
          errorMessage={errors.email && touchedFields.email ? errors.email.message : null}
          classNames={{
            base: 'h-[90px] pb-2',
            inputWrapper: [
              'border-1',
              'border-gray-300/30',
              'group-data-[focus=true]:border-brand-500!',
              'group-data-[hover=true]:border-brand-500',
            ],
            input: ['!outline-none'],
          }}
        />

        {/* Password */}
        <Input
          {...register('password')}
          variant="bordered"
          label="Password*"
          placeholder="Min. 6 characters"
          id="password"
          type={isVisiblePassword ? 'text' : 'password'}
          isInvalid={(!!errors.password && touchedFields.password) ?? false}
          errorMessage={errors.password && touchedFields.password ? errors.password.message : null}
          classNames={{
            base: 'h-[90px]',
            inputWrapper: [
              'border-1',
              'border-gray-300/30',
              'group-data-[focus=true]:border-brand-500!',
              'group-data-[hover=true]:border-brand-500',
            ],
            input: ['!outline-none'],
          }}
          endContent={
            <button
              className="focus:outline-none"
              type="button"
              onClick={toggleVisibilityPassword}
              aria-label={isVisiblePassword ? 'Hide password' : 'Show password'}
            >
              {isVisiblePassword ? (
                <IoEyeOutline size={30} className="flex pb-2 text-gray-400" />
              ) : (
                <IoEyeOffOutline size={30} className="flex pb-2 text-gray-400" />
              )}
            </button>
          }
        />

        {/* Forgot Password */}
        <div className="flex items-center justify-end pb-4">
          <a
            className="text-brand-500 hover:text-brand-600 text-sm font-medium dark:text-white"
            href="/auth/forgot-password"
          >
            Forgot Password?
          </a>
        </div>
        <Button
          type="submit"
          disabled={!isValid || isSubmittingCredentials}
          isLoading={isSubmittingCredentials}
          spinner={<LoadingSpinner />}
          className="bg-brand-500 hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:hover:bg-brand-300 dark:active:bg-brand-200 w-full rounded-xl py-3 text-base font-medium text-white transition duration-200 dark:text-white"
        >
          Sign In
        </Button>
      </form>
      <div className="mt-4">
        <span className="text-navy-700 text-sm font-medium dark:text-gray-500">
          Not registered yet?
        </span>
        <NextUILink
          as={Link}
          href="/auth/sign-up"
          className="text-brand-500 hover:text-brand-600 ml-1 text-sm font-medium dark:text-white"
        >
          Create an account
        </NextUILink>
      </div>
    </div>
  );
};

export default SignIn;
