import { observable } from '@trpc/server/observable';

import { procedure, router } from '../trpc/trpc.server';
import { promptSchema } from './ai.schema';
import { createSubscriptionStream } from './ai.service';

export const aiRouter = router({
  askAdminAssistant: procedure.input(promptSchema).subscription(({ input }) => {
    return observable<string>((emit) => {
      createSubscriptionStream({
        ...input,
        isAdmin: true,
        onToken: (token) => emit.next(token),
        onComplete: () => emit.complete(),
      });
    });
  }),
  askPublicAssistant: procedure.input(promptSchema).subscription(({ input }) => {
    return observable<string>((emit) => {
      createSubscriptionStream({
        ...input,
        isAdmin: false,
        onToken: (token) => emit.next(token),
        onComplete: () => emit.complete(),
      });
    });
  }),
});
