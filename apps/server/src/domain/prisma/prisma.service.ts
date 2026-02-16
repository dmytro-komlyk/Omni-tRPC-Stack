import { Inject, Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { connectPrisma, disconnectPrisma, PrismaClient } from '@package/prisma';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  constructor(
    @Inject('PRISMA') private readonly prisma: PrismaClient,
    private readonly logger: PinoLogger
  ) {
    this.logger.setContext('Prisma');
  }

  async onModuleInit() {
    await connectPrisma();

    (this.prisma as any).$on('query', (e: any) => {
      this.logger.info(
        {
          sql: e.query,
          params: e.params,
          duration: `${e.duration}ms`,
        },
        'Database Query'
      );
    });
  }

  async onModuleDestroy() {
    await disconnectPrisma();
  }
}
