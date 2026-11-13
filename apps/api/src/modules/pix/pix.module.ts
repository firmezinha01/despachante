import { Module } from '@nestjs/common';
import { PixService } from './pix.service';
import { PixController } from './pix.controller';
import { PrismaService } from '../../common/prisma/prisma.service';

@Module({
  controllers: [PixController],
  providers: [PixService, PrismaService],
  exports: [PixService],
})
export class PixModule {}
