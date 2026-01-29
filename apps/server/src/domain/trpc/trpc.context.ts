import { INestApplicationContext } from '@nestjs/common';
import { inferAsyncReturnType } from '@trpc/server';
import { FastifyReply, FastifyRequest } from 'fastify';
import { JwtPayload } from 'jsonwebtoken';
import { PinoLogger } from 'nestjs-pino';

import { verifyToken } from '../auth/jwt.service';

// ---- Context SSR / Next.js ----
export type ServerContext = {
  session: { id: string; accessToken: string } | null;
};

// ---- Context NestJS ----
export type FullServerContext = ServerContext & {
  logger: PinoLogger;
};

// ---- NestJS / Fastify ----
export interface FastifyContextOptions {
  app: INestApplicationContext;
  logger: PinoLogger;
  req?: FastifyRequest;
  res?: FastifyReply;
  connection?: {
    headers: Record<string, string | string[] | undefined>;
  };
}

export async function createContext({
  req,
  connection,
  logger,
}: FastifyContextOptions): Promise<FullServerContext> {
  const getAuthHeader = (): string | null => {
    if (req?.headers.authorization) {
      const header = req.headers.authorization;
      return Array.isArray(header) ? (header[0] ?? null) : header;
    }

    if (connection?.headers.authorization) {
      const header = connection.headers.authorization;
      return Array.isArray(header) ? (header[0] ?? null) : header;
    }

    return null;
  };
  const authHeader = getAuthHeader();
  let session: FullServerContext['session'] = null;

  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);

    logger.debug({ token: token.substring(0, 10) + '...' }, 'Attempting to verify access token');

    try {
      const payload: JwtPayload = await verifyToken({
        type: 'access',
        token,
      });
      if (payload.sub) {
        session = { id: payload.sub, accessToken: token };
        logger.info({ userId: payload.sub }, 'User authenticated via token');
      }
    } catch (error: any) {
      logger.warn(`Invalid token in tRPC context: ${error.message}`);
    }
  } else {
    logger.debug('No Authorization header found');
  }

  return {
    session,
    logger,
  };
}

// ---- Context ----
export type Context = inferAsyncReturnType<typeof createContext>;
