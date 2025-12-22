import { Module } from '@nestjs/common';
import fastify, { FastifyInstance } from 'fastify';

import { FastifyTRPCPlugin } from './trpc-fastify.plugin';

const fastifyInstance: FastifyInstance = fastify({ logger: true });

@Module({
  providers: [
    {
      provide: 'FASTIFY_INSTANCE',
      useValue: fastifyInstance,
    },
    FastifyTRPCPlugin,
  ],
  exports: ['FASTIFY_INSTANCE', FastifyTRPCPlugin],
})
export class TrpcModule {}
