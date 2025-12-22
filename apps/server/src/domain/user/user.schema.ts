import { z } from 'zod';

export const updateUserSchema = z.object({
  id: z.string(),
  nickName: z.string().optional(),
  email: z.string().optional(),
  password: z.string().optional(),
  isLogined: z.boolean().optional(),
});

export type UpdateUserData = z.infer<typeof updateUserSchema>;

export const outputUserSchema = z.object({
  id: z.string(),
  nickName: z.string(),
  email: z.string(),
  isLogined: z.boolean(),
});

export type OutputUserData = z.infer<typeof outputUserSchema>;
