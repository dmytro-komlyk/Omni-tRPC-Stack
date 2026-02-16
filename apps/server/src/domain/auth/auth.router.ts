import { JwtPayload } from 'jsonwebtoken';

import { procedure, protectedProcedure, router } from '../trpc/trpc.server';
import {
  checkTokenSchema,
  ForgotPasswordOutputData,
  forgotPasswordOutputSchema,
  forgotPasswordSchema,
  inputBackendTokensSchema,
  OutputAccessToken,
  outputAccessTokenSchema,
  OutputAuthData,
  outputAuthSchema,
  outputCheckAuthSchema,
  OutputSignOutData,
  outputSignOutSchema,
  resendVerificationEmailSchema,
  ResetPasswordOutputData,
  resetPasswordOutputSchema,
  resetPasswordSchema,
  signInProviderSchema,
  signInSchema,
  SignUpResponseData,
  signUpResponseSchema,
  signUpSchema,
  VerifyEmailOutputData,
  verifyEmailOutputSchema,
  verifyEmailSchema,
} from './auth.schema';
import {
  receivePasswordResetLink,
  resendVerification,
  resetPassword,
  signIn,
  signInProvider,
  signOut,
  signUp,
  updateAccessBackendToken,
  verifyEmail,
} from './auth.service';
import { verifyToken } from './jwt.service';

export const authRouter = router({
  login: procedure
    .meta({
      openapi: {
        enabled: true,
        method: 'POST',
        path: '/auth.login',
        summary: 'Login the user',
        tags: ['auth'],
        protect: false,
      },
    })
    .input(signInSchema)
    .output(outputAuthSchema)
    .mutation(async ({ input, ctx }) => {
      const response: OutputAuthData = await signIn({ data: input, domain: ctx.domain });
      ctx.logger.log({ email: response.user.email, path: 'auth.login' }, 'Login successfully');
      return response;
    }),
  loginProvider: procedure
    .meta({
      openapi: {
        enabled: true,
        method: 'POST',
        path: '/auth.loginProvider',
        summary: 'Login the user via provider',
        tags: ['auth'],
        protect: false,
      },
    })
    .input(signInProviderSchema)
    .output(outputAuthSchema)
    .mutation(async ({ input, ctx }) => {
      const response = await signInProvider({ ...input });
      ctx.logger.log(
        { userId: response.user.id, path: 'auth.loginProvider' },
        'Login provider successfully'
      );
      return response;
    }),
  logout: protectedProcedure
    .meta({
      openapi: {
        enabled: true,
        method: 'POST',
        path: '/auth.logout',
        summary: 'Logout the user',
        tags: ['auth'],
        protect: true,
      },
    })
    .output(outputSignOutSchema)
    .mutation(async ({ ctx }) => {
      const response: OutputSignOutData = await signOut(ctx.sessionToken as string);
      ctx.logger.log({ userId: response.userId, path: 'auth.logout' }, response.message);
      return response;
    }),
  register: procedure
    .meta({
      openapi: {
        enabled: true,
        method: 'POST',
        path: '/auth.register',
        summary: 'Register a new user',
        tags: ['auth'],
        protect: false,
      },
    })
    .input(signUpSchema)
    .output(signUpResponseSchema)
    .mutation(async ({ input, ctx }) => {
      const response: SignUpResponseData = await signUp({ data: input, domain: ctx.domain });
      ctx.logger.log({ userId: response.userId, path: 'auth.register' }, response.message);
      return response;
    }),
  checkToken: procedure
    .meta({
      openapi: {
        enabled: true,
        method: 'POST',
        path: '/auth.checkToken',
        summary: 'Checking the auth token',
        tags: ['auth'],
        protect: true,
      },
    })
    .input(checkTokenSchema)
    .output(outputCheckAuthSchema)
    .mutation(async ({ input, ctx }) => {
      const token: JwtPayload = await verifyToken({
        token: input.token,
        type: input.type,
      });
      ctx.logger.log({ input, path: 'auth.checkToken' }, 'Check token successfully');
      return { email: token.email };
    }),
  refresh: protectedProcedure
    .meta({
      openapi: {
        enabled: true,
        method: 'POST',
        path: '/auth.refresh',
        summary: 'Update access backend token',
        tags: ['auth'],
        protect: true,
      },
    })
    .input(inputBackendTokensSchema)
    .output(outputAccessTokenSchema)
    .mutation(async ({ input, ctx }) => {
      const response: OutputAccessToken = await updateAccessBackendToken({ ...input });
      ctx.logger.log({ input, path: 'auth.refresh' }, 'Refresh token successfully');
      return response;
    }),
  verifyEmail: procedure
    .meta({
      openapi: {
        enabled: true,
        method: 'POST',
        path: '/auth.verifyEmail',
        summary: 'Verify the email of a user using the token from email',
        tags: ['auth'],
        protect: false,
      },
    })
    .input(verifyEmailSchema)
    .output(verifyEmailOutputSchema)
    .mutation(async ({ input, ctx }) => {
      const response: VerifyEmailOutputData = await verifyEmail(input);
      ctx.logger.log(
        { email: input.email, path: 'auth.verifyEmail' },
        'Email verified successfully'
      );
      return response;
    }),
  resendVerification: procedure
    .meta({
      openapi: {
        enabled: true,
        method: 'POST',
        path: '/auth.resendVerification',
        summary: 'Resend the verification email',
        tags: ['auth'],
        protect: false,
      },
    })
    .input(resendVerificationEmailSchema)
    .output(verifyEmailOutputSchema)
    .mutation(async ({ input, ctx }) => {
      const response: VerifyEmailOutputData = await resendVerification({
        data: input,
        domain: ctx.domain,
      });
      ctx.logger.log({ email: input.email, path: 'auth.resendVerification' }, response.message);
      return response;
    }),
  forgotPassword: procedure
    .meta({
      openapi: {
        enabled: true,
        method: 'POST',
        path: '/auth.forgotPassword',
        summary: 'Receive a password reset link',
        tags: ['auth'],
        protect: false,
      },
    })
    .input(forgotPasswordSchema)
    .output(forgotPasswordOutputSchema)
    .mutation(async ({ input, ctx }) => {
      const response: ForgotPasswordOutputData = await receivePasswordResetLink({
        data: input,
        domain: ctx.domain,
      });
      ctx.logger.log({ email: input.email, path: 'auth.forgotPassword' }, response.message);
      return response;
    }),
  resetPassword: procedure
    .meta({
      openapi: {
        enabled: true,
        method: 'POST',
        path: '/auth.resetPassword',
        summary: 'Update user password',
        tags: ['auth'],
        protect: false,
      },
    })
    .input(resetPasswordSchema)
    .output(resetPasswordOutputSchema)
    .mutation(async ({ input, ctx }) => {
      const response: ResetPasswordOutputData = await resetPassword({
        data: input,
        domain: ctx.domain,
      });
      ctx.logger.log({ email: input.email, path: 'auth.resetPassword' }, response.message);
      return response;
    }),
});
