import { prisma } from '@package/prisma';
import { TRPCError } from '@trpc/server';
import { compare, hash } from 'bcryptjs';

import { sendEmail } from '../../utils/nodemailer/sendEmail';
import { Domain } from '../trpc/trpc.context';
import {
  ForgotPasswordFormData,
  ForgotPasswordOutputData,
  InputBackendTokens,
  OutputAccessToken,
  OutputAuthData,
  OutputBackendTokens,
  OutputSignOutData,
  ResendVerificationEmailData,
  ResetPasswordData,
  ResetPasswordOutputData,
  SignInData,
  SignInProviderData,
  SignUpData,
  SignUpResponseData,
  VerifyEmailOutputData,
} from './auth.schema';
import { generateBackendTokens } from './jwt.service';

export async function signIn({
  data,
  domain,
}: {
  data: SignInData;
  domain: Domain;
}): Promise<OutputAuthData> {
  const user = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (!user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Invalid email or password',
      cause: 'User not found',
    });
  }

  if (!user.password) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'User registered via provider. Please use provider login.',
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

    const link = `${domain.origin}/auth/verify-email?token=${token}&email=${encodeURIComponent(data.email)}`;

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

  await prisma.user.update({
    where: { id: user.id },
    data: {
      lastActiveAt: new Date(),
      isOnline: true,
      failedLoginAttempts: 0,
      lockedUntil: null,
    },
  });

  const { accessToken, accessTokenExp, refreshTokenExp } = await generateBackendTokens(
    {
      sub: user.id,
      email: user.email as string,
    },
    { updateAccess: true, updateRefresh: true }
  );

  const sessionToken = crypto.randomUUID();
  const sessionExpires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  await prisma.session.create({
    data: {
      sessionToken,
      userId: user.id,
      expiresAt: sessionExpires,
    },
  });

  return {
    accessToken,
    accessTokenExp,
    refreshTokenExp,
    sessionToken,
    user: {
      id: user.id,
      email: user.email,
      nickName: user.nickName,
      avatarUrl: user.avatarUrl,
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

  const link = `${domain.origin}/auth/verify-email?token=${token}&email=${encodeURIComponent(data.email)}`;

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

export async function signInProvider(data: SignInProviderData): Promise<OutputAuthData> {
  let user = await prisma.user.findFirst({
    where: {
      accounts: {
        some: {
          provider: data.provider,
          providerAccountId: data.providerAccountId,
        },
      },
    },
  });

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
        avatarUrl: data.avatarUrl,
        emailVerified: data.provider === 'google' ? new Date() : null,
      },
    });
  } else {
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        firstName: data.firstName || user.firstName,
        lastName: data.lastName || user.lastName,
        nickName: data.nickName || user.nickName,
        avatarUrl: data.avatarUrl || user.avatarUrl,
      },
    });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { lastActiveAt: new Date(), isOnline: true },
  });

  const { accessToken, accessTokenExp, refreshTokenExp } = await generateBackendTokens({
    sub: user.id,
    email: user.email || '',
  });

  const sessionToken = crypto.randomUUID();
  const sessionExpires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  await prisma.session.create({
    data: {
      sessionToken,
      userId: user.id,
      expiresAt: sessionExpires,
    },
  });

  return {
    accessToken,
    accessTokenExp,
    refreshTokenExp,
    sessionToken,
    user: {
      id: user.id,
      email: user.email,
      nickName: user.nickName,
      avatarUrl: user.avatarUrl,
    },
  };
}

export async function signUp({
  domain,
  data,
}: {
  domain: Domain;
  data: SignUpData;
}): Promise<SignUpResponseData> {
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

    const link = `${domain.origin}/auth/verify-email?token=${token}&email=${encodeURIComponent(data.email)}`;

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

  const link = `${domain.origin}/auth/verify-email?token=${token}&email=${encodeURIComponent(data.email)}`;

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

export async function signOut(sessionToken: string): Promise<OutputSignOutData> {
  const session = await prisma.session.findUnique({
    where: { sessionToken },
    include: { user: true },
  });

  if (!session) {
    return {
      userId: null,
      success: true,
      message: 'Session already terminated',
      isLogined: false,
    };
  }

  const userId = session.userId;

  await prisma.session.delete({
    where: { sessionToken },
  });

  await prisma.token.deleteMany({
    where: {
      userId,
      type: {
        in: ['ACCESS', 'REFRESH'],
      },
    },
  });

  await prisma.user.update({
    where: { id: userId },
    data: {
      isOnline: false,
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
}: {
  data: ForgotPasswordFormData;
  domain: Domain;
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

  const SUCCESS_MESSAGE =
    'If an account exists for that email, a reset link has been sent. Please check your inbox and spam folder.';

  if (!user) {
    return {
      success: true,
      message: SUCCESS_MESSAGE,
    };
  }

  const lastToken = user.verificationTokens?.[0];

  if (lastToken) {
    const cooldownInMinutes = 2;
    const now = new Date();
    const diffInMs = now.getTime() - lastToken.createdAt.getTime();
    const diffInMinutes = diffInMs / (1000 * 60);

    if (diffInMinutes < cooldownInMinutes) {
      console.warn(`[RateLimit] Password reset attempt too frequent for: ${data.email}`);
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

  const link = `${domain.origin}/auth/reset-password?token=${token}&email=${encodeURIComponent(data.email)}`;

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

export async function updateAccessBackendToken(
  payload: InputBackendTokens
): Promise<OutputAccessToken> {
  const { accessToken, accessTokenExp } = await generateBackendTokens(payload);

  return {
    accessToken: accessToken,
    accessTokenExp: accessTokenExp,
  };
}

export async function updateRefreshBackendToken(
  payload: InputBackendTokens
): Promise<OutputBackendTokens> {
  const { accessToken, accessTokenExp, refreshToken, refreshTokenExp } =
    await generateBackendTokens(payload, {
      updateAccess: true,
      updateRefresh: true,
    });

  return {
    accessToken: accessToken,
    accessTokenExp: accessTokenExp,
    refreshToken: refreshToken,
    refreshTokenExp: refreshTokenExp,
  };
}
