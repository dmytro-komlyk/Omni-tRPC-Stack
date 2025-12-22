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
  logger,
  req,
  connection,
}: FastifyContextOptions): Promise<FullServerContext> {
  const getAuthHeader = (): string | null => {
    const header = req?.headers.authorization ?? connection?.headers.authorization;

    if (!header) return null;

    return Array.isArray(header) ? (header[0] ?? null) : header;
  };

  const authHeader = getAuthHeader();
  let session: ServerContext['session'] = null;

  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);

    try {
      const payload: JwtPayload = await verifyToken({
        type: 'access',
        token,
      });
      if (payload.sub) {
        session = { id: payload.sub, accessToken: token };
      }
    } catch (error: any) {
      logger.warn(`Invalid token in tRPC context: ${error.message}`);
    }
  }

  return {
    session,
    logger,
  };
}

// ---- Context ----
export type Context = inferAsyncReturnType<typeof createContext>;
