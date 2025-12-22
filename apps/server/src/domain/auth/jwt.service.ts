import jwt from 'jsonwebtoken';

import { InputBackendTokens, OutputBackendTokens } from './auth.schema';

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
  payload: InputBackendTokens
): Promise<OutputBackendTokens> {
  const now = new Date();

  const accessTokenPayload = {
    ...payload,
    iat: Math.floor(now.getTime() / 1000),
    exp: Math.floor(now.getTime() / 1000) + 60 * 60,
  };

  const refreshTokenPayload = {
    ...payload,
    iat: Math.floor(now.getTime() / 1000),
    exp: Math.floor(now.getTime() / 1000) + 7 * 24 * 60 * 60,
  };

  return {
    accessToken: jwt.sign(accessTokenPayload, process.env.JWT_ACCESS_TOKEN as string),
    accessTokenExp: accessTokenPayload.exp,
    refreshToken: jwt.sign(refreshTokenPayload, process.env.JWT_REFRESH_TOKEN as string),
    refreshTokenExp: refreshTokenPayload.exp,
  };
}
