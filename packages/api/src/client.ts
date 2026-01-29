import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '../../../apps/server/src/domain/trpc/trpc.router';

export type ExportedAppRouter = AppRouter;

export const trpc: ReturnType<typeof createTRPCReact<AppRouter>> = createTRPCReact<AppRouter>();
