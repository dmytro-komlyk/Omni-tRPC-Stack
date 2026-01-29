import type { FullServerContext } from '../../../apps/server/src/domain/trpc/trpc.context';
import { appRouter } from '../../../apps/server/src/domain/trpc/trpc.router';
import { createCallerFactory } from '../../../apps/server/src/domain/trpc/trpc.server';

const ctx: FullServerContext = {
  session: null,
  logger: {} as any,
};

export const serverClient = createCallerFactory(appRouter)(ctx);
