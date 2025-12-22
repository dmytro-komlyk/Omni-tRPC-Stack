import { Module } from '@nestjs/common';
import { prisma } from '@package/prisma';

@Module({
  providers: [
    {
      provide: 'PRISMA',
      useValue: prisma,
    },
  ],
  exports: ['PRISMA'],
})
export class PrismaModule {}
