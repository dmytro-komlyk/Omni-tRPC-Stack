import { z } from 'zod';

export const tokenType = z.enum(['access', 'refresh', 'reset']);
export type TokenJWT = z.infer<typeof tokenType>;

export const checkTokenSchema = z.object({
  token: z.string().min(1),
  type: tokenType,
});

export const outputCheckAuthSchema = z.object({
  email: z.string().email(),
});

export type CheckTokenData = z.infer<typeof checkTokenSchema>;
export type OutputCheckAuthData = z.infer<typeof outputCheckAuthSchema>;

export const signInSchema = z.object({
  email: z
    .string()
    .email('Введите корректный формат электронной почты')
    .min(1, 'Введите адрес электронной почты'),
  password: z.string().min(1, 'Введите свой пароль'),
});

export type SignInFormData = z.infer<typeof signInSchema>;

export const signUpSchema = z
  .object({
    nickName: z
      .string()
      .min(3, 'Минимальное ник имя состоит из 3 символов')
      .nonempty('Введите свое имя'),
    email: z
      .string()
      .max(30, 'email не должен превышать 30 символов')
      .email('Неверный адрес электронной почты')
      .nonempty('Введите адрес электронной почты'),
    password: z
      .string()
      .min(6, 'Минимальное количество символов 6')
      .nonempty('Введите свой пароль'),
    passwordConfirmation: z.string().nonempty('Подтвердите свой пароль'),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: 'Пароль не совпадает',
    path: ['passwordConfirmation'],
  });

export type SignUpFormData = z.infer<typeof signUpSchema>;

export const outputAuthSchema = z.object({
  id: z.string(),
  nickName: z.string(),
  email: z.string(),
  isLogined: z.boolean(),
  accessToken: z.string(),
  accessTokenExp: z.number(),
  refreshToken: z.string(),
  refreshTokenExp: z.number(),
});

export const inputBackendTokensSchema = z.object({
  email: z.string().email(),
  sub: z.string().min(1),
  timeZone: z.string().optional(),
});

export const outputAccessTokenSchema = z.object({
  accessToken: z.string(),
  accessTokenExp: z.number(),
});

export const outputBackendTokensSchema = outputAccessTokenSchema.extend({
  refreshToken: z.string(),
  refreshTokenExp: z.number(),
});

export type InputBackendTokens = z.infer<typeof inputBackendTokensSchema>;
export type OutputAccessToken = z.infer<typeof outputAccessTokenSchema>;
export type OutputBackendTokens = z.infer<typeof outputBackendTokensSchema>;
export type OutputAuthData = z.infer<typeof outputAuthSchema>;

export const outputTokenSchema = z.object({
  id: z.string(),
  type: z.enum(['ACCESS', 'REFRESH', 'RESET']),
  expires: z.number().int(),
});
