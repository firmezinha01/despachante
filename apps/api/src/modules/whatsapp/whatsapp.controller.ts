import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WhatsAppService } from './whatsapp.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';

@ApiTags('WhatsApp Multicanal')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('whatsapp')
export class WhatsAppController {
  constructor(private whatsAppService: WhatsAppService) {}

  @Get('instances')
  @ApiOperation({ summary: 'Listar instâncias e números de WhatsApp conectados ao escritório' })
  async list(@CurrentTenant() tenantId: string) {
    return this.whatsAppService.listInstances(tenantId);
  }

  @Post('instances')
  @ApiOperation({ summary: 'Criar nova instância e obter QR Code para conexão' })
  async create(
    @CurrentTenant() tenantId: string,
    @Body('nomeInstancia') nomeInstancia: string,
  ) {
    return this.whatsAppService.createInstance(tenantId, nomeInstancia || 'Atendimento Principal');
  }

  @Post('notify-status')
  @ApiOperation({ summary: 'Disparar notificação de atualização de processo veicular ao cliente' })
  async notify(
    @CurrentTenant() tenantId: string,
    @Body() body: any,
  ) {
    return this.whatsAppService.sendProcessUpdateNotification(tenantId, body);
  }
}
