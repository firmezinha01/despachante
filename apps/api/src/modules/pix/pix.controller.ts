import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PixService } from './pix.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';

@ApiTags('Motor PIX')
@Controller('pix')
export class PixController {
  constructor(private pixService: PixService) {}

  @Post('charge')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Gerar cobrança dinâmica PIX com QR Code e Copia e Cola EMVCo' })
  async createCharge(
    @CurrentTenant() tenantId: string,
    @Body() body: { valor: number; processId?: string; transactionId?: string; descricao?: string },
  ) {
    return this.pixService.createCharge(tenantId, body);
  }

  @Get('charge/:txid')
  @ApiOperation({ summary: 'Consultar status e payload da cobrança PIX pelo txid (Acesso público para Portal do Cliente)' })
  async getCharge(@Param('txid') txid: string) {
    return this.pixService.getChargeByTxid(txid);
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Webhook de confirmação bancária do BACEN / Gateway para baixa automática instantânea' })
  async handleWebhook(@Body() body: any) {
    return this.pixService.handleWebhookNotification(body);
  }
}
