import crypto from 'node:crypto';

import { prisma } from '@package/prisma';
import { TRPCError } from '@trpc/server';
import { compare, hash } from 'bcryptjs';

import { sendEmail } from '../../utils/nodemailer/sendEmail';
import { Domain } from '../trpc/trpc.context';
import {
  ForgotPasswordFormData,
  ForgotPasswordOutputData,
  InputBackendTokens,
  InviteUserData,
  OutputAccessToken,
  OutputAuthData,
  OutputAuthProviderData,
  OutputInviteData,
  OutputSignOutData,
  ResendVerificationEmailData,
  ResetPasswordData,
  ResetPasswordOutputData,
  SignInData,
  SignInProviderData,
  SignOutData,
  SignUpData,
  SignUpResponseData,
  UserRole,
  VerifyEmailOutputData,
} from './auth.schema';
import { generateBackendTokens, verifyToken } from './jwt.service';
import { verifyTwoFactorToken } from './two-factor.service';

export async function signIn({
  data,
  domain,
}: {
  data: SignInData;
  domain: Domain;
}): Promise<OutputAuthData> {
  const user = await prisma.user.findUnique({
    where: { email: data.email },
    include: { accounts: true },
  });

  if (!user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Invalid email or password',
      cause: 'User not found',
    });
  }

  const isAdminHost = domain.origin?.includes('admin');
  const isAdminRole = ['ADMIN', 'SUPER_ADMIN'].includes(user.role);

  if (isAdminHost && !isAdminRole) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Access denied. This area is for administrative personnel only.',
    });
  }

  if (!isAdminHost && isAdminRole) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Admins must log in through the administrative console.',
    });
  }

  if (!user.password) {
    const providerNames = user.accounts
      .map(({ provider }: { provider: string }) => {
        return provider.charAt(0).toUpperCase() + provider.slice(1);
      })
      .join(', ');

    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: `It looks like you previously signed up with ${providerNames}. Please use that method to log in.`,
    });
  }

  if (!user.emailVerified) {
    await prisma.verificationToken.deleteMany({
      where: {
        identifier: data.email,
        type: 'EMAIL_VERIFICATION',
      },
    });

    const token = crypto.randomUUID();

    await prisma.verificationToken.create({
      data: {
        identifier: data.email,
        token,
        type: 'EMAIL_VERIFICATION',
        expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours
        userId: user.id,
      },
    });

    const link = `${domain.origin || process.env.APP_WEBSITE_URL}/auth/verify-email?token=${token}&email=${encodeURIComponent(data.email)}`;

    await sendEmail({
      email: data.email,
      payload: { link, name: user.nickName, appName: process.env.APP_NAME },
      template: '/templates/verifyEmail.handlebars',
      subject: 'Verify your email',
    });

    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Email is not verified. Please check your email.',
    });
  }

  const isPasswordValid = await compare(data.password, user.password);

  if (!isPasswordValid) {
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const remainingMs = user.lockedUntil.getTime() - Date.now();
      const remainingMinutes = Math.ceil(remainingMs / 1000 / 60);

      throw new TRPCError({
        code: 'FORBIDDEN',
        message: `Your account has been temporarily suspended due to too many failed login attempts. Please try again in ${remainingMinutes} minutes.`,
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: { increment: 1 },
      },
      select: {
        failedLoginAttempts: true,
      },
    });

    const attempts = updatedUser.failedLoginAttempts;

    if (attempts >= 5) {
      const minutes = Math.min(15 * Math.pow(2, attempts - 5), 1440);
      const lockedUntil = new Date(Date.now() + minutes * 60 * 1000);

      await prisma.user.update({
        where: { id: user.id },
        data: { lockedUntil },
      });

      throw new TRPCError({
        code: 'FORBIDDEN',
        message: `Too many failed attempts. Account suspended for ${minutes} minutes.`,
      });
    }

    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: `Incorrect email or password. Remaining attempts: ${5 - updatedUser.failedLoginAttempts}`,
    });
  }

  if (user.isTwoFactorEnabled) {
    const { accessToken: mfaToken } = await generateBackendTokens(
      {
        sub: user.id,
        email: user.email as string,
        type: '2FA_PENDING',
      },
      {
        updateAccess: true,
        updateRefresh: false,
        clientId: domain.clientId ?? 'unknown',
      }
    );

    return {
      status: 'REQUIRES_2FA',
      mfaToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        nickName: user.nickName,
        avatarUrl: user.avatarUrl,
        forcePasswordChange: user.forcePasswordChange,
      },
    };
  }

  const isWeb = !!domain.origin;

  await prisma.user.update({
    where: { id: user.id },
    data: {
      lastActiveAt: new Date(),
      isOnline: true,
      failedLoginAttempts: 0,
      lockedUntil: null,
    },
  });

  const { accessToken, refreshToken, accessTokenExp, refreshTokenExp } =
    await generateBackendTokens(
      {
        sub: user.id,
        email: user.email as string,
      },
      {
        updateAccess: true,
        updateRefresh: true,
        clientId: domain.clientId ?? 'unknown',
        userAgent: domain.userAgent ?? undefined,
      }
    );

  const sessionToken = isWeb ? crypto.randomUUID() : refreshToken;
  const sessionExpires = isWeb ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : refreshTokenExp;

  await prisma.session.create({
    data: {
      sessionToken,
      userId: user.id,
      expiresAt: sessionExpires,
      clientId: domain.clientId,
      userAgent: domain.userAgent,
    },
  });

  return {
    status: 'SUCCESS',
    accessToken,
    refreshToken,
    accessTokenExp,
    refreshTokenExp,
    sessionToken,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      nickName: user.nickName,
      avatarUrl: user.avatarUrl,
      forcePasswordChange: user.forcePasswordChange,
    },
  };
}

export async function verify2FALogin({
  data,
  domain,
}: {
  data: { mfaToken: string; code: string };
  domain: Domain;
}): Promise<OutputAuthData> {
  const payload = await verifyToken({ type: '2fa', token: data.mfaToken });

  if (!payload.sub) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'User ID is missing in token',
    });
  }

  if (payload.type !== '2FA_PENDING') {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid token type' });
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
  });

  if (!user || !user.twoFactorSecret) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: '2FA not configured' });
  }

  const isValid = await verifyTwoFactorToken(data.code, user.twoFactorSecret);

  if (!isValid) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid 2FA code' });
  }

  const isWeb = !!domain.origin;
  const { accessToken, refreshToken, accessTokenExp, refreshTokenExp } =
    await generateBackendTokens(
      { sub: user.id, email: user.email as string },
      {
        updateAccess: true,
        updateRefresh: true,
        clientId: domain.clientId ?? 'unknown',
        userAgent: domain.userAgent ?? undefined,
      }
    );

  const sessionToken = isWeb ? crypto.randomUUID() : refreshToken;
  const sessionExpires = isWeb ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : refreshTokenExp;

  await prisma.session.create({
    data: {
      sessionToken,
      userId: user.id,
      expiresAt: sessionExpires,
      isTwoFactorVerified: true,
      clientId: domain.clientId,
      userAgent: domain.userAgent,
    },
  });

  return {
    status: 'SUCCESS',
    accessToken,
    refreshToken,
    accessTokenExp,
    refreshTokenExp,
    sessionToken,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      nickName: user.nickName,
      avatarUrl: user.avatarUrl,
      forcePasswordChange: user.forcePasswordChange,
    },
  };
}

export async function verifyEmail(input: { token: string; email: string }) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (!user) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'User not found',
    });
  }

  if (user.emailVerified) {
    return { success: true, message: 'Email already verified', userId: user.id };
  }

  const verificationToken = await prisma.verificationToken.findFirst({
    where: {
      identifier: input.email,
      token: input.token,
      type: 'EMAIL_VERIFICATION',
      expiresAt: { gt: new Date() },
    },
    include: { user: true },
  });

  if (!verificationToken || !verificationToken.user) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Invalid or expired verification token',
    });
  }

  await prisma.user.update({
    where: { id: verificationToken.user.id },
    data: { emailVerified: new Date() },
  });

  await prisma.verificationToken.deleteMany({
    where: {
      token: input.token,
      identifier: input.email,
      type: 'EMAIL_VERIFICATION',
    },
  });

  return {
    success: true,
    message: 'Email successfully verified',
    userId: verificationToken.user.id,
  };
}

export async function resendVerification({
  data,
  domain,
}: {
  data: ResendVerificationEmailData;
  domain: Domain;
}): Promise<VerifyEmailOutputData> {
  const user = await prisma.user.findUnique({
    where: { email: data.email },
    include: {
      verificationTokens: {
        where: { type: 'EMAIL_VERIFICATION' },
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  });

  const isAdminHost = domain.origin?.includes('admin');

  if (user && isAdminHost && user.role === 'USER') {
    return { success: true, message: 'Verification email sent again' };
  }

  if (!user) {
    return { success: true, message: 'Verification email sent again' };
  }

  if (user.emailVerified) {
    return { success: false, message: 'Email already verified' };
  }

  const lastToken = user.verificationTokens?.[0];

  if (lastToken) {
    const cooldownInMinutes = 2;
    const now = new Date();
    const diffInMs = now.getTime() - lastToken.createdAt.getTime();
    const diffInMinutes = diffInMs / (1000 * 60);

    if (diffInMinutes < cooldownInMinutes) {
      console.warn(`[RateLimit] Verification reset attempt too frequent for: ${data.email}`);
      const waitSeconds = Math.ceil((cooldownInMinutes - diffInMinutes) * 60);
      throw new TRPCError({
        code: 'TOO_MANY_REQUESTS',
        message: `Please wait ${waitSeconds} seconds before sending a new request.`,
      });
    }
  }

  const token = crypto.randomUUID();

  await prisma.verificationToken.deleteMany({
    where: {
      identifier: data.email,
      type: 'EMAIL_VERIFICATION',
    },
  });

  await prisma.verificationToken.create({
    data: {
      identifier: data.email,
      token,
      type: 'EMAIL_VERIFICATION',
      expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
      userId: user.id,
    },
  });

  const link = `${domain.origin || process.env.APP_WEBSITE_URL}/auth/verify-email?token=${token}&email=${encodeURIComponent(data.email)}`;

  await sendEmail({
    email: data.email,
    payload: { link, name: user.nickName, appName: process.env.APP_NAME },
    template: '/templates/verifyEmail.handlebars',
    subject: 'Verify your email',
  });

  return {
    success: true,
    message: 'Verification email sent again',
  };
}

export async function signInProvider({
  data,
  domain,
}: {
  data: SignInProviderData;
  domain: Domain;
}): Promise<OutputAuthProviderData> {
  const existingAccount = await prisma.account.findUnique({
    where: {
      provider_providerAccountId: {
        provider: data.provider,
        providerAccountId: data.providerAccountId,
      },
    },
    include: { user: true },
  });

  let user = existingAccount?.user || null;

  if (!user && data.email) {
    user = await prisma.user.findUnique({ where: { email: data.email } });
  }

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        nickName: data.nickName,
        emailVerified: new Date(),
      },
    });
  }

  if (!existingAccount) {
    await prisma.account.create({
      data: {
        userId: user.id,
        type: 'oauth',
        provider: data.provider,
        providerAccountId: data.providerAccountId,
        avatarUrl: data.avatarUrl,
      },
    });
  } else {
    await prisma.account.update({
      where: { id: existingAccount.id },
      data: { avatarUrl: data.avatarUrl },
    });
  }

  user = await prisma.user.update({
    where: { id: user.id },
    data: {
      firstName: user.firstName ?? data.firstName,
      lastName: user.lastName ?? data.lastName,
      lastActiveAt: new Date(),
      isOnline: true,
    },
  });

  const isWeb = !!domain.origin;
  const finalClientId = data.clientId || domain.clientId || 'unknown';

  const { accessToken, refreshToken, accessTokenExp, refreshTokenExp } =
    await generateBackendTokens(
      {
        sub: user.id,
        email: user.email || '',
      },
      {
        updateAccess: true,
        updateRefresh: true,
        clientId: finalClientId,
        userAgent: domain.userAgent ?? undefined,
      }
    );

  const sessionToken = isWeb ? crypto.randomUUID() : refreshToken;
  const sessionExpires = isWeb ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : refreshTokenExp;

  await prisma.session.create({
    data: {
      sessionToken,
      userId: user.id,
      expiresAt: sessionExpires,
      clientId: finalClientId,
      userAgent: domain.userAgent,
    },
  });

  return {
    status: 'SUCCESS',
    accessToken,
    refreshToken,
    accessTokenExp,
    refreshTokenExp,
    sessionToken,
    user: {
      id: user.id,
      role: user.role,
      email: user.email,
      nickName: user.nickName,
      avatarUrl: user.avatarUrl || data.avatarUrl,
      forcePasswordChange: user.forcePasswordChange,
    },
  };
}

export async function signUp({
  domain,
  data,
}: {
  domain: Domain;
  data: SignUpData & { inviteToken?: string };
}): Promise<SignUpResponseData> {
  const isAdminHost = domain.origin?.includes('admin');
  let assignedRole: UserRole = 'USER';

  if (isAdminHost) {
    if (!data.inviteToken) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Registration on this domain requires an invitation.',
      });
    }

    const invite = await prisma.invite.findUnique({
      where: {
        token: data.inviteToken,
        email: data.email,
        isAccepted: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (!invite) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Invalid, expired, or already used invitation.',
      });
    }

    assignedRole = invite.role;
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    if (existingUser.emailVerified) {
      throw new TRPCError({
        code: 'CONFLICT',
        message: 'User with this email already exists',
      });
    }

    await prisma.verificationToken.deleteMany({
      where: {
        identifier: data.email,
        type: 'EMAIL_VERIFICATION',
      },
    });

    const token = crypto.randomUUID();

    await prisma.verificationToken.create({
      data: {
        identifier: data.email,
        token,
        type: 'EMAIL_VERIFICATION',
        expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours
        userId: existingUser.id,
      },
    });

    const link = `${domain.origin || process.env.APP_WEBSITE_URL}/auth/verify-email?token=${token}&email=${encodeURIComponent(data.email)}`;

    await sendEmail({
      email: data.email,
      payload: { link, name: existingUser.nickName, appName: process.env.APP_NAME },
      template: '/templates/verifyEmail.handlebars',
      subject: 'Verify your email',
    });

    return {
      success: true,
      message: 'Verification email sent again',
      userId: existingUser.id,
    };
  }

  const hashedPassword = await hash(data.password, 12);

  const user = await prisma.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      nickName: data.nickName,
      role: assignedRole,
      emailVerified: null,
    },
  });

  const token = crypto.randomUUID();

  await prisma.verificationToken.create({
    data: {
      identifier: data.email,
      token: token,
      type: 'EMAIL_VERIFICATION',
      expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours
      userId: user.id,
    },
  });

  const link = `${domain.origin || process.env.APP_WEBSITE_URL}/auth/verify-email?token=${token}&email=${encodeURIComponent(data.email)}`;

  await sendEmail({
    email: data.email,
    payload: { link, name: user.nickName, appName: process.env.APP_NAME },
    template: '/templates/verifyEmail.handlebars',
    subject: 'Verify your email',
  });

  return {
    success: true,
    message: 'Registration successful. Please check your email for verification.',
    userId: user.id,
  };
}

export async function signOut({
  userId,
  clientId,
  sessionToken,
}: SignOutData): Promise<OutputSignOutData> {
  if (sessionToken) {
    await prisma.session.deleteMany({
      where: { sessionToken },
    });
  }

  if (clientId) {
    await prisma.token.deleteMany({
      where: {
        userId,
        clientId,
        type: {
          in: ['ACCESS', 'REFRESH'],
        },
      },
    });
  }

  const activeSessionsCount = await prisma.session.count({
    where: {
      userId,
      expiresAt: { gt: new Date() },
    },
  });

  await prisma.user.update({
    where: { id: userId },
    data: {
      isOnline: activeSessionsCount > 0,
      lastActiveAt: new Date(),
    },
  });

  return {
    userId,
    success: true,
    message: 'You have been successfully logged out',
    isLogined: false,
  };
}

export async function receivePasswordResetLink({
  data,
  domain,
  logger,
}: {
  data: ForgotPasswordFormData;
  domain: Domain;
  logger?: any;
}): Promise<ForgotPasswordOutputData> {
  const user = await prisma.user.findUnique({
    where: { email: data.email },
    include: {
      verificationTokens: {
        where: { type: 'PASSWORD_RESET' },
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  });

  if (!user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Invalid email',
      cause: 'User not found',
    });
  }

  const isAdminHost = domain.origin?.includes('admin');
  const isAdminRole = ['ADMIN', 'SUPER_ADMIN'].includes(user.role);

  const SUCCESS_MESSAGE =
    'If an account exists for that email, a reset link has been sent. Please check your inbox and spam folder.';

  if (!user) {
    return {
      success: true,
      message: SUCCESS_MESSAGE,
    };
  }

  if (user && isAdminRole && !isAdminHost) {
    logger.warn(`[Security] Admin ${user.email} tried to reset password via public website.`);
    return { success: true, message: SUCCESS_MESSAGE };
  }

  if (user && !isAdminRole && isAdminHost) {
    logger.warn(`[Security] User ${user.email} tried to reset password via admin panel.`);
    return { success: true, message: SUCCESS_MESSAGE };
  }

  const lastToken = user.verificationTokens?.[0];

  if (lastToken) {
    const cooldownInMinutes = 2;
    const now = new Date();
    const diffInMs = now.getTime() - lastToken.createdAt.getTime();
    const diffInMinutes = diffInMs / (1000 * 60);

    if (diffInMinutes < cooldownInMinutes) {
      logger.warn(`[RateLimit] Password reset attempt too frequent for: ${data.email}`);
      const waitSeconds = Math.ceil((cooldownInMinutes - diffInMinutes) * 60);
      throw new TRPCError({
        code: 'TOO_MANY_REQUESTS',
        message: `Please wait ${waitSeconds} seconds before sending a new request.`,
      });
    }
  }

  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000);

  await prisma.verificationToken.deleteMany({
    where: {
      identifier: data.email,
      type: 'PASSWORD_RESET',
    },
  });

  await prisma.verificationToken.create({
    data: {
      identifier: data.email,
      token,
      type: 'PASSWORD_RESET',
      expiresAt,
      userId: user.id,
    },
  });

  const link = `${domain.origin || process.env.APP_WEBSITE_URL}/auth/reset-password?token=${token}&email=${encodeURIComponent(data.email)}`;

  await sendEmail({
    email: data.email,
    payload: { link, name: user.nickName, appName: process.env.APP_NAME },
    template: '/templates/forgotPasswordEmail.handlebars',
    subject: 'Reset your password',
  });

  return {
    success: true,
    message: SUCCESS_MESSAGE,
  };
}

export async function resetPassword({
  data,
  domain,
}: {
  data: ResetPasswordData;
  domain: Domain;
}): Promise<ResetPasswordOutputData> {
  const user = await prisma.user.findUnique({
    where: { email: data.email },
    include: {
      verificationTokens: {
        where: {
          token: data.token,
          type: 'PASSWORD_RESET',
        },
      },
    },
  });

  const isAdminHost = domain.origin?.includes('admin');

  if (user && isAdminHost && user.role === 'USER') {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Access denied.',
    });
  }

  const tokenRecord = user?.verificationTokens[0];

  if (!user || !tokenRecord || tokenRecord.expiresAt < new Date()) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Invalid or expired password reset link.',
    });
  }

  const hashedPassword = await hash(data.password, 12);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      failedLoginAttempts: 0,
      lockedUntil: null,
    },
  });

  await prisma.verificationToken.deleteMany({
    where: {
      identifier: data.email,
      type: 'PASSWORD_RESET',
    },
  });

  const loginLink = `${domain.origin}/auth/sign-in`;

  await sendEmail({
    email: data.email,
    payload: {
      link: loginLink,
      name: user.nickName || user.firstName,
      appName: process.env.APP_NAME,
    },
    template: '/templates/passwordUpdatedConfirmation.handlebars',
    subject: 'Security Notice: Your password has been changed',
  });

  return {
    success: true,
    message:
      'Your password has been successfully updated. You can now log in with your new credentials.',
  };
}

export async function updateAccessBackendToken({
  payload,
  domain,
}: {
  payload: InputBackendTokens;
  domain: Domain;
}): Promise<OutputAccessToken> {
  const { accessToken, accessTokenExp } = await generateBackendTokens(payload, {
    updateAccess: true,
    updateRefresh: false,
    clientId: domain.clientId ?? 'unknown',
    userAgent: domain.userAgent ?? undefined,
  });

  return {
    accessToken: accessToken,
    accessTokenExp: accessTokenExp,
  };
}

export async function createInvite({
  data,
}: {
  data: InviteUserData;
  domain: Domain;
}): Promise<OutputInviteData> {
  const existingUser = await prisma.user.findUnique({ where: { email: data.email } });

  if (existingUser) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'User with this email already exists.',
    });
  }

  await prisma.invite.deleteMany({
    where: { email: data.email },
  });

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const invite = await prisma.invite.create({
    data: {
      email: data.email,
      token,
      role: data.role,
      invitedById: data.adminId,
      expiresAt,
    },
  });

  const link = `${process.env.APP_ADMIN_URL}/auth/sign-up?token=${token}&email=${encodeURIComponent(invite.email)}`;

  await sendEmail({
    email: invite.email,
    payload: {
      link,
      role: invite.role,
      appName: process.env.APP_NAME,
    },
    template: '/templates/inviteEmail.handlebars',
    subject: `Invitation to join ${process.env.APP_NAME}`,
  });

  return {
    success: true,
    message: 'Invitation sent successfully',
  };
}
