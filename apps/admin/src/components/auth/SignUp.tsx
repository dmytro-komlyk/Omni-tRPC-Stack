'use client';

import { Button, Checkbox, Input, Link as NextUILink } from '@heroui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthSchema, trpc } from '@package/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { IoEyeOffOutline, IoEyeOutline } from 'react-icons/io5';

import LoadingSpinner from '@/components/loading/LoadingSpinner';
import { showToast } from '@/components/Toast';

interface SignUpProps {
  callbackUrl: string;
}

const SignUp = ({ callbackUrl }: SignUpProps) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVisiblePassword, setIsVisiblePassword] = useState<boolean>(false);
  const [isVisiblePasswordConfirmation, setIsVisiblePasswordConfirmation] =
    useState<boolean>(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isValid, isDirty, touchedFields },
  } = useForm<AuthSchema.SignUpFormData>({
    resolver: zodResolver(AuthSchema.signUpFormSchema),
    defaultValues: {
      nickName: '',
      email: '',
      password: '',
      passwordConfirmation: '',
      isTwoFactorEnabled: false,
    },
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const signUp = trpc.auth.register.useMutation({});

  const toggleVisibilityPassword = () => setIsVisiblePassword(!isVisiblePassword);
  const toggleVisibilityPasswordConfirmation = () =>
    setIsVisiblePasswordConfirmation(!isVisiblePasswordConfirmation);

  const onSubmit = async (data: AuthSchema.SignUpFormData) => {
    setIsSubmitting(true);
    try {
      const response = await signUp.mutateAsync(data);
      if (response.success) {
        showToast.success(response.message);
        router.push(callbackUrl);
        reset();
      }
    } catch (error: any) {
      showToast.error(`${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-full flex-col items-center gap-6 md:max-w-105 md:pl-4 lg:pl-0">
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Nickname */}
        <Input
          {...register('nickName')}
          variant="bordered"
          label="Nickname*"
          placeholder="Your unique name"
          isDisabled={isSubmitting}
          isInvalid={(!!errors.nickName && touchedFields.nickName) ?? false}
          errorMessage={errors.nickName && touchedFields.nickName ? errors.nickName.message : null}
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
        />

        {/* Email */}
        <Input
          {...register('email')}
          variant="bordered"
          label="Email*"
          placeholder="mail@simple.com"
          id="email"
          type="email"
          isDisabled={isSubmitting}
          isInvalid={(!!errors.email && touchedFields.email) ?? false}
          errorMessage={errors.email && touchedFields.email ? errors.email.message : null}
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
        />

        {/* Password */}
        <Input
          {...register('password')}
          variant="bordered"
          label="Password*"
          placeholder="Min. 6 characters"
          id="password"
          type={isVisiblePassword ? 'text' : 'password'}
          isDisabled={isSubmitting}
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
        {/* Password Confirmation */}
        <Input
          {...register('passwordConfirmation')}
          variant="bordered"
          label="Confirm Password*"
          placeholder="Repeat your password"
          type={isVisiblePasswordConfirmation ? 'text' : 'password'}
          isDisabled={isSubmitting}
          isInvalid={(!!errors.passwordConfirmation && touchedFields.passwordConfirmation) ?? false}
          errorMessage={
            errors.passwordConfirmation && touchedFields.passwordConfirmation
              ? errors.passwordConfirmation.message
              : null
          }
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
              onClick={toggleVisibilityPasswordConfirmation}
              aria-label={isVisiblePasswordConfirmation ? 'Hide password' : 'Show password'}
            >
              {isVisiblePasswordConfirmation ? (
                <IoEyeOutline size={30} className="flex pb-2 text-gray-400" />
              ) : (
                <IoEyeOffOutline size={30} className="flex pb-2 text-gray-400" />
              )}
            </button>
          }
        />

        {/* 2FA Enabled */}
        <div className="mb-6 ml-1">
          <Controller
            name="isTwoFactorEnabled"
            control={control}
            render={({ field }) => (
              <Checkbox
                isSelected={field.value}
                onValueChange={field.onChange}
                classNames={{
                  label: 'text-sm font-medium text-navy-700 dark:text-white',
                }}
              >
                Enable Two-Factor Authentication (2FA)
              </Checkbox>
            )}
          />
        </div>

        <Button
          type="submit"
          disabled={!isValid || isSubmitting || !isDirty}
          isLoading={isSubmitting}
          spinner={<LoadingSpinner />}
          className="bg-brand-500 hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:hover:bg-brand-300 dark:active:bg-brand-200 w-full rounded-xl py-3 text-base font-medium text-white transition duration-200 dark:text-white"
        >
          Sign Up
        </Button>
      </form>

      <div className="mt-4 flex items-center justify-center lg:justify-start">
        <span className="text-navy-700 text-sm font-medium dark:text-gray-500">
          Already have an account?
        </span>
        <NextUILink
          as={Link}
          href="/auth/sign-in"
          className="text-brand-500 hover:text-brand-600 ml-1 text-sm font-bold dark:text-white"
        >
          Sign In
        </NextUILink>
      </div>
    </div>
  );
};

export default SignUp;
