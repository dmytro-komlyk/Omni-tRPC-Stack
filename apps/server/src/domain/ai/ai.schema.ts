import { z } from 'zod';

export const promptSchema = z.object({
  prompt: z.string(),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant', 'system']),
        content: z.string(),
      })
    )
    .optional()
    .default([]),
  locale: z.string().optional().default('ru'),
});
