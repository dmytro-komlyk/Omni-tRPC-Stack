import { initTRPC, TRPCError } from '@trpc/server';
import { OpenApiMeta } from 'trpc-to-openapi';

import type { Context } from './trpc.context';

const trpc = initTRPC
  .meta<OpenApiMeta>()
  .context<Context>()
  .create({
    errorFormatter({ shape }) {
      return shape;
    },
    allowOutsideOfServer: true,
    isDev: process.env.NODE_ENV === 'development',
  });

export const procedure = trpc.procedure;
const enforceUserIsAuthed = trpc.middleware(({ ctx, next }) => {
  if (!ctx.session) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You need to log in to access this resource.',
    });
  }
  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
    },
  });
});
export const protectedProcedure = trpc.procedure.use(enforceUserIsAuthed);
export const router = trpc.router;
export const createCallerFactory = trpc.createCallerFactory;
export const mergeRouters = trpc.mergeRouters;
