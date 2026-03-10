import { Module } from '@nestjs/common';
import { prisma } from '@package/prisma';

import { PrismaService } from './prisma.service';

@Module({
  providers: [
    {
      provide: 'PRISMA',
      useValue: prisma,
    },
    PrismaService,
  ],
  exports: ['PRISMA', PrismaService],
})
export class PrismaModule {}
