import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { PrismaService } from './common/prisma/prisma.service';
import { RedisService } from './common/redis/redis.service';
import { AuthModule } from './modules/auth/auth.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { CrmModule } from './modules/crm/crm.module';
import { VehiclesModule } from './modules/vehicles/vehicles.module';
import { ProcessesModule } from './modules/processes/processes.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { SignaturesModule } from './modules/signatures/signatures.module';
import { FinancialModule } from './modules/financial/financial.module';
import { PixModule } from './modules/pix/pix.module';
import { FiscalModule } from './modules/fiscal/fiscal.module';
import { DetranModule } from './modules/detran/detran.module';
import { WhatsAppModule } from './modules/whatsapp/whatsapp.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { AuditModule } from './modules/audit/audit.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    CompaniesModule,
    CrmModule,
    VehiclesModule,
    ProcessesModule,
    DocumentsModule,
    SignaturesModule,
    FinancialModule,
    PixModule,
    FiscalModule,
    DetranModule,
    WhatsAppModule,
    DashboardModule,
    AuditModule,
  ],
  controllers: [AppController],
  providers: [PrismaService, RedisService],
  exports: [PrismaService, RedisService],
})
export class AppModule {}
