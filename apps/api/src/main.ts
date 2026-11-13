import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger, ValidationPipe } from '@nestjs/common';
import { GlobalHttpExceptionFilter } from './common/filters/http-exception.filter';
import { TenancyInterceptor } from './common/interceptors/tenancy.interceptor';

async function bootstrap() {
  const logger = new Logger('DespachanteERP-Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Prefixo Global da API
  app.setGlobalPrefix('api/v1');

  // CORS habilitado para Next.js, Portal do Cliente e App Flutter
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Filtros e Interceptors Globais
  app.useGlobalFilters(new GlobalHttpExceptionFilter());
  app.useGlobalInterceptors(new TenancyInterceptor());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  // Configuração do Swagger / OpenAPI
  const config = new DocumentBuilder()
    .setTitle('DESPACHANTE ERP BRASIL - API Enterprise')
    .setDescription(
      'Plataforma SaaS Multiempresa e Multitenant de Missão Crítica para Despachantes Veiculares, Redes, Frotistas e Concessionárias. Suporte a DETRAN, SENATRAN, Workflow Veicular, NFS-e/NF-e e Motor PIX.',
    )
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'DESPACHANTE ERP BRASIL - Documentação Swagger',
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);
  logger.log(`🚀 DESPACHANTE ERP BRASIL API operacional na porta ${port}`);
  logger.log(`📚 Documentação Swagger disponível em http://localhost:${port}/api/docs`);
}

bootstrap();
