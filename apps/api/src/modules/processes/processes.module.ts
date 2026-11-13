import { Module } from '@nestjs/common';
import { ProcessesService } from './processes.service';
import { ProcessesController } from './processes.controller';
import { PrismaService } from '../../common/prisma/prisma.service';

@Module({
  controllers: [ProcessesController],
  providers: [ProcessesService, PrismaService],
  exports: [ProcessesService],
})
export class ProcessesModule {}
