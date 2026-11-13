import { Module } from '@nestjs/common';
import { DetranService } from './detran.service';
import { DetranController } from './detran.controller';
import { SPProvider } from './providers/sp.provider';
import { RJProvider } from './providers/rj.provider';
import { MGProvider } from './providers/mg.provider';
import { PRProvider } from './providers/pr.provider';
import { SenatranProvider } from './providers/senatran.provider';

@Module({
  controllers: [DetranController],
  providers: [
    DetranService,
    SPProvider,
    RJProvider,
    MGProvider,
    PRProvider,
    SenatranProvider,
  ],
  exports: [DetranService],
})
export class DetranModule {}
