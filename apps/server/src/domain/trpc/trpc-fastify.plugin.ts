import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { FastifyInstance } from 'fastify';

@Injectable()
export class FastifyTRPCPlugin implements OnModuleInit {
  constructor(@Inject('FASTIFY_INSTANCE') private readonly fastify: FastifyInstance) {}

  async onModuleInit() {
    console.log('✅ Fastify tRPC initialized (HTTP + WS)');
  }
}
