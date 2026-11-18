import { Controller, Get, Head } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Health')
@Controller()
export class AppController {
  @Get()
  @Head()
  @ApiOperation({ summary: 'Health check da API e status do sistema' })
  getRoot() {
    return {
      status: 'online',
      system: 'DESPACHANTE ERP BRASIL API',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      docs: '/api/docs',
    };
  }

  @Get('healthz')
  @Head('healthz')
  getHealth() {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
    };
  }
}
