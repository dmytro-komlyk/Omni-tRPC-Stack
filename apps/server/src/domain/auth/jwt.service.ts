import { prisma } from '@package/prisma';
import { addDays, addHours } from 'date-fns';
import jwt from 'jsonwebtoken';

import { GenerateOptions, InputBackendTokens, OutputBackendTokens } from './auth.schema';

export const verifyToken = async ({
  type,
  token,
}: {
  type: 'access' | 'refresh' | 'reset';
  token: string;
}): Promise<jwt.JwtPayload> => {
  const secret =
    type === 'access'
      ? (process.env.JWT_ACCESS_TOKEN as string)
      : type === 'refresh'
        ? (process.env.JWT_REFRESH_TOKEN as string)
        : (process.env.JWT_RESET_TOKEN as string);

  try {
    const decoded: jwt.JwtPayload = jwt.verify(token, secret) as jwt.JwtPayload;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      console.error('Token expired at:', error.expiredAt);
      throw new Error('Token has expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      console.error('JWT error:', error.message);
      throw new Error('Invalid token');
    }
    console.error('Unexpected error:', error);
    throw new Error('Invalid or expired token');
  }
};

export async function generateBackendTokens(
  payload: InputBackendTokens,
  options: GenerateOptions = { updateAccess: true, updateRefresh: false }
): Promise<OutputBackendTokens> {
  const now = new Date();
  const result: Partial<OutputBackendTokens> = {};

  // 1. Access token
  if (options.updateAccess) {
    const accessExpDate = addHours(now, 1);
    const accessExpUnix = Math.floor(accessExpDate.getTime() / 1000);

    const accessPayload = {
      ...payload,
      iat: Math.floor(now.getTime() / 1000),
      exp: accessExpUnix,
    };

    const accessToken = jwt.sign(accessPayload, process.env.JWT_ACCESS_TOKEN as string);

    await prisma.token.upsert({
      where: { userId_type: { userId: payload.sub, type: 'ACCESS' } },
      update: { token: accessToken, expiresAt: accessExpDate },
      create: {
        userId: payload.sub,
        type: 'ACCESS',
        token: accessToken,
        expiresAt: accessExpDate,
      },
    });

    result.accessToken = accessToken;
    result.accessTokenExp = accessExpDate;
  }

  // 2. Refresh token
  if (options.updateRefresh) {
    const refreshExpDate = addDays(now, 7);
    const refreshExpUnix = Math.floor(refreshExpDate.getTime() / 1000);

    const refreshPayload = {
      ...payload,
      iat: Math.floor(now.getTime() / 1000),
      exp: refreshExpUnix,
    };

    const refreshToken = jwt.sign(refreshPayload, process.env.JWT_REFRESH_TOKEN as string);

    await prisma.token.upsert({
      where: { userId_type: { userId: payload.sub, type: 'REFRESH' } },
      update: { token: refreshToken, expiresAt: refreshExpDate },
      create: {
        userId: payload.sub,
        type: 'REFRESH',
        token: refreshToken,
        expiresAt: refreshExpDate,
      },
    });

    result.refreshToken = refreshToken;
    result.refreshTokenExp = refreshExpDate;
  }

  return result as OutputBackendTokens;
}
