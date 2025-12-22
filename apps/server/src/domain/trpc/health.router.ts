import { observable } from '@trpc/server/observable';
import { z } from 'zod';

import { procedure, router } from './trpc.server';

export const healthCheckerRouter = router({
  http: procedure
    .meta({
      openapi: {
        enabled: true,
        method: 'GET',
        path: '/health.http',
        summary: 'Checking the HTTP availability of a server',
        tags: ['health'],
        protect: false,
      },
    })
    .output(
      z.object({
        status: z.literal('success'),
        message: z.string(),
      })
    )
    .query(() => {
      return {
        status: 'success',
        message: 'Welcome to trpc with Next.js 14 and React Query',
      };
    }),
  ws: procedure.input(z.void()).subscription(() => {
    console.log('✅ WebSocket подписка установлена');
    return observable<string>((emit) => {
      emit.next('🔥 WebSocket подключен!');

      const interval = setInterval(() => {
        console.log('📡 Send ping...');
        emit.next(`🔥 WebSocket ping at ${new Date().toISOString()}`);
      }, 2000);

      return () => {
        console.log('🔴 WebSocket отключен');
        clearInterval(interval);
      };
    });
  }),
}) as any;
