import { prisma } from '@package/prisma';
import { TRPCError } from '@trpc/server';
import { compare, hash } from 'bcryptjs';

import { OutputAuthData, SignInFormData, SignUpFormData } from '../auth/auth.schema';
import { generateBackendTokens } from '../auth/jwt.service';
import type { OutputUserData, UpdateUserData } from './user.schema';

export const findUserByEmail = async (email: string): Promise<OutputUserData> => {
  const user = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });

  if (!user) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: `User with email ${email} not found`,
      cause: `User with email ${email} not found`,
    });
  }

  return user;
};

export async function findUserById(id: string): Promise<OutputUserData> {
  const user = await prisma.user.findUnique({
    where: {
      id: id,
    },
  });

  if (!user) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: `User with ID ${id} not found`,
      cause: `User with ID ${id} not found`,
    });
  }

  return user;
}

export async function validateUser(data: SignInFormData): Promise<OutputAuthData> {
  const user = await prisma.user.findUnique({
    where: {
      email: data.email,
    },
  });

  if (!user) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: `User with email ${data.email} not found`,
      cause: `User with email ${data.email} not found`,
    });
  }

  const payload = { email: user.email, sub: user.id };
  const backendTokens = await generateBackendTokens(payload);

  const accessToken = await prisma.token.upsert({
    where: { type_userId: { userId: user.id, type: 'ACCESS' } },
    update: {
      token: backendTokens.accessToken,
      expires: backendTokens.accessTokenExp,
    },
    create: {
      userId: user.id,
      type: 'ACCESS',
      token: backendTokens.accessToken,
      expires: backendTokens.accessTokenExp,
    },
  });

  const refreshToken = await prisma.token.upsert({
    where: { type_userId: { userId: user.id, type: 'REFRESH' } },
    update: {
      token: backendTokens.refreshToken,
      expires: backendTokens.refreshTokenExp,
    },
    create: {
      userId: user.id,
      type: 'REFRESH',
      token: backendTokens.refreshToken,
      expires: backendTokens.refreshTokenExp,
    },
  });

  if (user && (await compare(data.password, user.password as string))) {
    return {
      ...user,
      accessToken: accessToken.token,
      accessTokenExp: accessToken.expires,
      refreshToken: refreshToken.token,
      refreshTokenExp: refreshToken.expires,
    };
  }

  throw new TRPCError({
    code: 'UNAUTHORIZED',
    message: 'Invalid email or password',
    cause: 'Authentication failed',
  });
}

export async function createUser(data: SignUpFormData): Promise<OutputUserData> {
  const user = await prisma.user.findUnique({
    where: {
      email: data.email,
    },
  });

  if (user) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: `User "${data.email}" already exists`,
      cause: `User "${data.email}" already exists`,
    });
  }

  const { password, nickName, email } = data;
  const newUser = await prisma.user.create({
    data: {
      nickName: nickName,
      email: email,
      password: await hash(password, 10),
    },
  });

  return newUser;
}

export async function updateUser(newData: UpdateUserData): Promise<OutputUserData> {
  const { id, ...restData } = newData;

  await findUserById(id);

  const filteredData = Object.fromEntries(
    Object.entries(restData).filter(([, value]) => value !== undefined)
  );

  const updatedUser = await prisma.user.update({
    where: { id },
    data: filteredData,
    select: {
      id: true,
      email: true,
      nickName: true,
      isLogined: true,
    },
  });

  return updatedUser;
}
