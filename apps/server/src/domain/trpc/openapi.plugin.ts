import { generateOpenApiDocument } from 'trpc-to-openapi';

import { appRouter } from './trpc.router';

export const openApiDocument = generateOpenApiDocument(appRouter, {
  title: 'tRPC OpenAPI',
  description: 'tRPC + OpenAPI documentation',
  version: '1.0.0',
  baseUrl: process.env.APP_HTTP_URL as string,
  docsUrl: `/${process.env.APP_SWAGGER}`,
  tags: ['health', 'auth', 'users'],
  openApiVersion: '3.0.3',
});
