import { z } from 'zod';

export const providerType = z.enum(['google', 'facebook']);
export type ProviderType = z.infer<typeof providerType>;

export const userRole = z.enum(['USER', 'MODERATOR', 'ADMIN', 'SUPER_ADMIN']);
export type UserRole = z.infer<typeof userRole>;

export const userStatus = z.enum(['ACTIVE', 'BANNED', 'PENDING']);
export type UserStatus = z.infer<typeof userStatus>;

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
  email: z.string().email(),
  password: z.string(),
});

export type SignInData = z.infer<typeof signInSchema>;

export const signInFormSchema = z.object({
  email: z.string().email('Must be a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type SignInFormData = z.infer<typeof signInSchema>;

export const signInProviderSchema = z.object({
  email: z.string().email().min(1).nullable(),
  provider: z.string().min(1),
  providerAccountId: z.string().min(1),
  firstName: z.string().min(1).nullable(),
  lastName: z.string().min(1).nullable(),
  nickName: z.string().min(1).nullable(),
  avatarUrl: z.string().url().nullable(),
  clientId: z.string().optional(),
});

export type SignInProviderData = z.infer<typeof signInProviderSchema>;

export const signInMobileProviderSchema = z.object({
  token: z.string(),
  provider: providerType,
});

export type SignInMobileProviderData = z.infer<typeof signInMobileProviderSchema>;

export const outputVerifyOuthToken = z.object({
  email: z.string().email().min(1).nullable(),
  providerAccountId: z.string().min(1),
  firstName: z.string().min(1).nullable(),
  lastName: z.string().min(1).nullable(),
  nickName: z.string().min(1).nullable(),
  avatarUrl: z.string().url().nullable(),
});

export type OutputVerifyOuthTokenData = z.infer<typeof outputVerifyOuthToken>;

export const signUpSchema = z.object({
  email: z.string().email().min(1),
  password: z.string().min(6),
  nickName: z.string().min(3),
});

export type SignUpData = z.infer<typeof signUpSchema>;

export const signUpFormSchema = z
  .object({
    nickName: z.string().min(3, 'Nickname too short').nonempty('Enter your name'),
    email: z
      .string()
      .max(30, 'email must not exceed 30 characters')
      .email('Invalid email address')
      .nonempty('Enter your email address'),
    password: z.string().min(6, 'Minimum character count is 6').nonempty('Enter your password'),
    passwordConfirmation: z.string().nonempty('Confirm your password'),
    isTwoFactorEnabled: z.boolean(),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Passwords don't match",
    path: ['passwordConfirmation'],
  });

export type SignUpFormData = z.infer<typeof signUpFormSchema>;

export const signUpResponseSchema = z.object({
  userId: z.string().min(1),
  message: z.string().min(1),
  success: z.boolean(),
});

export type SignUpResponseData = z.infer<typeof signUpResponseSchema>;

export const signOutSchema = z.object({
  userId: z.string(),
  clientId: z.string().nullable(),
  sessionToken: z.string().nullable(),
});

export type SignOutData = z.infer<typeof signOutSchema>;

export const outputSignOutSchema = z.object({
  userId: z.string().nullable(),
  success: z.boolean(),
  message: z.string().min(1),
  isLogined: z.boolean(),
});

export type OutputSignOutData = z.infer<typeof outputSignOutSchema>;

export const resendVerificationEmailSchema = z.object({
  email: z.string().email('Incorrect email'),
});

export type ResendVerificationEmailData = z.infer<typeof resendVerificationEmailSchema>;

export const verifyEmailSchema = resendVerificationEmailSchema.extend({
  token: z.string().min(1, 'Token is required'),
});

export type VerifyEmailData = z.infer<typeof verifyEmailSchema>;

export const verifyEmailOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  userId: z.string().optional(),
});

export type VerifyEmailOutputData = z.infer<typeof verifyEmailOutputSchema>;

const userBaseSchema = z.object({
  id: z.string(),
  role: userRole,
  email: z.string().nullable(),
  nickName: z.string().nullable(),
  avatarUrl: z.string().nullable(),
  forcePasswordChange: z.boolean(),
  isTwoFactorEnabled: z.boolean().optional(),
});

export const outputAuthSchema = z.discriminatedUnion('status', [
  z.object({
    status: z.literal('SUCCESS'),
    accessToken: z.string(),
    accessTokenExp: z.date(),
    refreshToken: z.string().optional(),
    refreshTokenExp: z.date(),
    sessionToken: z.string(),
    user: userBaseSchema,
  }),

  z.object({
    status: z.literal('REQUIRES_2FA'),
    mfaToken: z.string(),
    user: userBaseSchema,
  }),
]);

export const outputAuthProviderSchema = z.object({
  status: z.literal('SUCCESS'),
  accessToken: z.string(),
  accessTokenExp: z.date(),
  refreshToken: z.string().optional(),
  refreshTokenExp: z.date(),
  sessionToken: z.string(),
  user: userBaseSchema,
});

export const inputBackendTokensSchema = z.object({
  email: z.email(),
  sub: z.string().min(1),
  timeZone: z.string().optional(),
});

export const outputAccessTokenSchema = z.object({
  accessToken: z.string(),
  accessTokenExp: z.date(),
});

export const outputBackendTokensSchema = outputAccessTokenSchema.extend({
  refreshToken: z.string(),
  refreshTokenExp: z.date(),
});

export const generateOptionsSchema = z.object({
  updateAccess: z.boolean().default(false),
  updateRefresh: z.boolean().default(false),
});

export type InputBackendTokens = z.infer<typeof inputBackendTokensSchema>;
export type OutputAccessToken = z.infer<typeof outputAccessTokenSchema>;
export type OutputBackendTokens = z.infer<typeof outputBackendTokensSchema>;
export type GenerateOptions = z.infer<typeof generateOptionsSchema>;
export type OutputAuthData = z.infer<typeof outputAuthSchema>;
export type OutputAuthProviderData = z.infer<typeof outputAuthProviderSchema>;

export const outputTokenSchema = z.object({
  id: z.string(),
  type: z.enum(['ACCESS', 'REFRESH', 'RESET']),
  expires: z.number().int(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Enter a valid email format').min(1, 'Enter email'),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const forgotPasswordOutputSchema = verifyEmailOutputSchema.extend({});

export type ForgotPasswordOutputData = z.infer<typeof forgotPasswordOutputSchema>;

export const resetPasswordFormSchema = z
  .object({
    password: z.string().min(6, 'Minimum character count is 6').nonempty('Enter your password'),
    passwordConfirmation: z.string().nonempty('Confirm your password'),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Passwords don't match",
    path: ['passwordConfirmation'],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordFormSchema>;

export const changeForcedPasswordSchema = z.object({
  password: z.string().min(6),
});

export type ChangeForcedPasswordData = z.infer<typeof changeForcedPasswordSchema>;

export const outputChangeForcedPasswordSchema = verifyEmailOutputSchema.extend({});

export type OutputChangeForcedPasswordData = z.infer<typeof outputChangeForcedPasswordSchema>;

export const resetPasswordSchema = changeForcedPasswordSchema.extend({
  token: z.string().min(1, 'Token is required'),
  email: z.string().email('Incorrect email'),
});

export type ResetPasswordData = z.infer<typeof resetPasswordSchema>;

export const resetPasswordOutputSchema = verifyEmailOutputSchema.extend({});

export type ResetPasswordOutputData = z.infer<typeof resetPasswordOutputSchema>;

export const inviteUserSchema = z.object({
  email: z.email(),
  role: userRole,
  adminId: z.string(),
});

export type InviteUserData = z.infer<typeof inviteUserSchema>;

export const outputInviteSchema = z.object({
  message: z.string().min(1),
  success: z.boolean(),
});

export type OutputInviteData = z.infer<typeof outputInviteSchema>;

export const twoFactorSetupSchema = z.object({
  id: z.string(),
  email: z.email(),
});

export type TwoFactorData = z.infer<typeof twoFactorSetupSchema>;

export const outputSetupTwoFatorSchema = z.object({
  secret: z.string(),
  qrCodeUrl: z.string(),
});

export type OutputSetupTwoFatorData = z.infer<typeof outputSetupTwoFatorSchema>;

export const activeTwoFatorSchema = z.object({
  code: z.string().length(6),
});

export type ActiveTwoFatorData = z.infer<typeof activeTwoFatorSchema>;

export const verifyTwoFatorSchema = activeTwoFatorSchema.extend({
  mfaToken: z.string(),
});

export type VerifyTwoFatorData = z.infer<typeof verifyTwoFatorSchema>;

export const outputActiveTwoFatorSchema = z.object({
  success: z.boolean(),
  backupCodes: z.array(z.string()),
});

export type OutputActiveTwoFatorData = z.infer<typeof outputActiveTwoFatorSchema>;
