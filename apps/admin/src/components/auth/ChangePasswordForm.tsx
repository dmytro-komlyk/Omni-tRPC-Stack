'use client';

import { showToast } from '@/components/Toast';
import { Button, Input } from '@heroui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthSchema, trpc } from '@package/api';
import { useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';

const ChangePasswordForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const { update, data: session } = useSession();
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(AuthSchema.resetPasswordFormSchema),
  });

  const changeForcedPassword = trpc.auth.changeForcedPassword.useMutation({});

  const onSubmit = async (data: AuthSchema.ResetPasswordFormData) => {
    try {
      const response = await changeForcedPassword.mutateAsync({
        password: data.password,
      });

      if (response.success) {
        await update({
          ...session,
          user: {
            ...session?.user,
            forcePasswordChange: false,
          },
        });
        showToast.success(response.message);
        onSuccess();
      }
    } catch (error: any) {
      showToast.error(`${error.message}`);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Input
        {...register('password')}
        type="password"
        label="New Admin Password"
        variant="bordered"
        errorMessage={errors.password?.message as string}
        isInvalid={!!errors.password}
      />
      <Input
        {...register('passwordConfirmation')}
        type="password"
        label="Confirm Password"
        variant="bordered"
        errorMessage={errors.passwordConfirmation?.message as string}
        isInvalid={!!errors.passwordConfirmation}
      />
      <Button
        type="submit"
        color="primary"
        isLoading={changeForcedPassword.isPending}
        isDisabled={changeForcedPassword.isPending || !isValid}
        className="bg-navy-700 dark:bg-brand-600 font-bold h-12 rounded-xl"
      >
        Initialize Security
      </Button>
    </form>
  );
};

export default ChangePasswordForm;
