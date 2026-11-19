import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    let retries = 5;
    while (retries > 0) {
      try {
        await this.$connect();
        this.logger.log('✅ Conectado com sucesso ao banco PostgreSQL do Supabase!');
        return;
      } catch (err: any) {
        retries--;
        this.logger.warn(`Aviso de conexão inicial ao banco (${err.message}). Tentando novamente em 2s (restam ${retries})...`);
        if (retries === 0) {
          this.logger.error('A conexão inicial esgotou as tentativas no bootstrap. O Prisma conectará sob demanda na primeira requisição.');
          return;
        }
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
