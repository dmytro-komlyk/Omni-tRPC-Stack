import fastifyCors, { FastifyCorsOptions } from '@fastify/cors';
import fastifyHelmet from '@fastify/helmet';
import fastifyRateLimit from '@fastify/rate-limit';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import { fastifyWebsocket } from '@fastify/websocket';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { fastifyTRPCPlugin, FastifyTRPCPluginOptions } from '@trpc/server/adapters/fastify';
import * as dotenv from 'dotenv';
import { Logger, PinoLogger } from 'nestjs-pino';

import { AppModule } from './domain/app.module';
import { openApiDocument } from './domain/trpc/openapi.plugin';
import { createContext } from './domain/trpc/trpc.context';
import { appRouter } from './domain/trpc/trpc.router';

dotenv.config();

async function bootstrap() {
  const logger = new PinoLogger({ renameContext: 'bootstrap' });
  const port = process.env.APP_PORT as string;

  try {
    const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter(), {
      bufferLogs: true,
    });

    app.useLogger(app.get(Logger));

    await app.register(fastifyRateLimit, {
      max: 1000,
      timeWindow: '15 minutes',
    });

    logger.info('Rate limit middleware registered');

    await app.register<FastifyCorsOptions>(fastifyCors, {
      origin: [process.env.APP_WEBSITE_URL as string, process.env.APP_ADMIN_URL as string].filter(
        Boolean
      ),
      methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
      credentials: true,
    });

    logger.info('CORS middleware registered');

    await app.register(fastifyHelmet, {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          connectSrc: [
            "'self'",
            'ws:',
            process.env.APP_WEBSITE_URL as string,
            process.env.APP_ADMIN_URL as string,
            process.env.APP_HTTP_URL as string,
            process.env.APP_SOCKET_URL as string,
          ].filter(Boolean),
        },
      },
    });
    logger.info('Helmet middleware registered with CSP');

    await app.register(fastifyWebsocket, {
      options: {
        maxPayload: 1048576,
        clientTracking: true,
        perMessageDeflate: false,
        verifyClient: (info, cb) => {
          const allowedOrigins = [
            process.env.APP_WEBSITE_URL as string,
            process.env.APP_ADMIN_URL as string,
          ].filter(Boolean);

          if (allowedOrigins.some((origin) => info.origin.startsWith(origin as string))) {
            cb(true);
          } else {
            cb(false, 401, 'Unauthorized origin');
          }
        },
      },
    });

    logger.info('WebSocket middleware registered');

    await app.register(fastifyTRPCPlugin, {
      prefix: '/trpc',
      useWSS: true,
      trpcOptions: {
        router: appRouter,
        createContext: (opts) => createContext({ ...opts, app, logger }),
      },
    } satisfies FastifyTRPCPluginOptions<typeof appRouter>);

    logger.info('tRPC middleware registered');

    await app.register(fastifySwagger, {
      openapi: {
        info: {
          title: 'tRPC OpenAPI',
          description: 'tRPC + OpenAPI documentation',
          version: '1.0.0',
        },
        servers: [{ url: process.env.APP_HTTP_URL as string }],
      },
      hideUntagged: true,
    });

    await app.register(fastifySwaggerUi, {
      routePrefix: `/${process.env.APP_SWAGGER}`,
      transformSpecification: () => {
        return openApiDocument;
      },
      uiConfig: {
        docExpansion: 'list',
        deepLinking: true,
        tryItOutEnabled: true,
        url: `/${process.env.APP_SWAGGER}/json`,
      },
      staticCSP: true,
    });

    logger.info(`Swagger UI available at ${process.env.APP_BASE_URL}/${process.env.APP_SWAGGER}`);
    logger.info(
      `OpenAPI JSON available at ${process.env.APP_BASE_URL}/${process.env.APP_SWAGGER}/json`
    );

    const staticPath = `${process.cwd()}/${process.env.APP_STATIC_ASSETS as string}`;
    const staticPrefix = `/${process.env.APP_STATIC_ASSETS as string}`;

    app.useStaticAssets({
      root: staticPath,
      prefix: staticPrefix,
      setHeaders: (res) => {
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      },
      decorateReply: false,
    });

    logger.info(`Static assets served from "${staticPath}" at prefix "${staticPrefix}"`);

    await app.listen(port, '0.0.0.0');
    logger.info(`Fastify Server is running on port ${port}`);

    const shutdown = async (signal: string) => {
      logger.info(`Received ${signal}. Closing server...`);
      await app.close();
      logger.info('Server closed');
      process.exit(0);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error: any) {
    logger.error(`Failed to start server on port ${port}: ${error.message}`, error.stack);
    process.exit(1);
  }
}

bootstrap().catch((err) => {
  const logger = new PinoLogger({ renameContext: 'bootstrap' });
  logger.error(`Bootstrap error: ${err.message}`, err.stack);
  process.exit(1);
});
