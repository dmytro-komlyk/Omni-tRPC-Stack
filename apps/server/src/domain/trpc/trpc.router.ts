import { authRouter } from '../auth/auth.router';
import { notificationRouter } from '../notification/notification.router';
import { healthCheckerRouter } from './health.router';
import { createCallerFactory, router } from './trpc.server';

export const appRouter = router({
  health: healthCheckerRouter,
  auth: authRouter,
  notification: notificationRouter,
  // other routers
});

// SSR Helper for tRPC calls
export const createCaller = createCallerFactory(appRouter);

export type AppRouter = typeof appRouter;
