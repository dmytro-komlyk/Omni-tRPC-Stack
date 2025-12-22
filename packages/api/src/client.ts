import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from 'server/domain/trpc/trpc.router';

export const trpc: ReturnType<typeof createTRPCReact<AppRouter>> = createTRPCReact<AppRouter>();
