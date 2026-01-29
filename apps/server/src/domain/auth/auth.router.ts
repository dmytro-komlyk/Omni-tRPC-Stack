import { JwtPayload } from 'jsonwebtoken';
import z from 'zod';

import { procedure, protectedProcedure, router } from '../trpc/trpc.server';
import { outputUserSchema } from '../user/user.schema';
import {
  checkTokenSchema,
  inputBackendTokensSchema,
  outputAccessTokenSchema,
  outputAuthSchema,
  outputCheckAuthSchema,
  signInSchema,
  signUpSchema,
} from './auth.schema';
import { signIn, signOut, signUp, updateAccessBackendToken } from './auth.service';
import { verifyToken } from './jwt.service';

export const authRouter = router({
  checkToken: procedure
    .meta({
      openapi: {
        enabled: true,
        method: 'POST',
        path: '/auth.checkToken',
        summary: 'Checking the auth token',
        tags: ['auth'],
        protect: false,
      },
    })
    .input(checkTokenSchema)
    .output(outputCheckAuthSchema)
    .mutation(async ({ input }) => {
      try {
        const token: JwtPayload = await verifyToken({
          token: input.token,
          type: input.type,
        });
        return { email: token.email };
      } catch (error) {
        console.error('Error in checkToken:', error);
        throw error;
      }
    }),
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
    .mutation(async ({ input }) => {
      try {
        return await signIn({ ...input });
      } catch (error) {
        console.error('Error in login:', error);
        throw error;
      }
    }),
  logout: protectedProcedure
    .input(z.void())
    .output(z.object({ isLogined: z.boolean() }))
    .mutation(async ({ ctx }) => {
      try {
        const isLogined: boolean = await signOut(ctx.session.id);
        return { isLogined };
      } catch (error) {
        console.error('Error in logout:', error);
        throw error;
      }
    }),
  register: procedure
    .meta({
      openapi: {
        enabled: true,
        method: 'POST',
        path: '/auth.register',
        summary: 'Register a new user',
        tags: ['auth'],
        protect: true,
      },
    })
    .input(signUpSchema)
    .output(outputUserSchema)
    .mutation(async ({ input }) => {
      try {
        return await signUp(input);
      } catch (error) {
        console.error('Error in register:', error);
        throw error;
      }
    }),
  updateAccessBackendToken: protectedProcedure
    .meta({
      openapi: {
        enabled: true,
        method: 'POST',
        path: '/auth.updateAccessBackendToken',
        summary: 'Update access backend token',
        tags: ['auth'],
        protect: true,
      },
    })
    .input(inputBackendTokensSchema)
    .output(outputAccessTokenSchema)
    .mutation(async ({ input }) => {
      try {
        return await updateAccessBackendToken({ ...input });
      } catch (error) {
        console.error('Error in updateAccessBackendToken:', error);
        throw error;
      }
    }),
});
