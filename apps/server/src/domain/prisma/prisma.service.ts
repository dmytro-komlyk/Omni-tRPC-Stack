import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { connectPrisma, disconnectPrisma } from '@package/prisma';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await connectPrisma();
  }

  async onModuleDestroy() {
    await disconnectPrisma();
  }
}
