import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { FastifyInstance } from 'fastify';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class FastifyTRPCPlugin implements OnModuleInit {
  constructor(
    @Inject('FASTIFY_INSTANCE') private readonly fastify: FastifyInstance,
    private readonly logger: PinoLogger
  ) {
    this.logger.setContext(FastifyTRPCPlugin.name);
  }

  async onModuleInit() {
    this.logger.info('Fastify tRPC initialized (HTTP + WS)');
  }
}
