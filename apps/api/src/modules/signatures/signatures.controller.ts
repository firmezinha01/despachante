import { Controller, Get, Post, Body, Param, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SignaturesService } from './signatures.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { Request } from 'express';

@ApiTags('Assinatura Eletrônica')
@Controller('signatures')
export class SignaturesController {
  constructor(private signaturesService: SignaturesService) {}

  @Post('process/:processId/envelope')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar envelope de assinatura para procuração ou ATPV-e' })
  async createEnvelope(
    @CurrentTenant() tenantId: string,
    @Param('processId') processId: string,
    @Body() body: any,
  ) {
    return this.signaturesService.createEnvelope(tenantId, processId, body);
  }

  @Get('envelope/:token')
  @ApiOperation({ summary: 'Consultar dados do documento para assinatura (Público / Portal do Cliente)' })
  async getByToken(@Param('token') token: string) {
    return this.signaturesService.getEnvelopeByToken(token);
  }

  @Post('envelope/:token/sign')
  @ApiOperation({ summary: 'Assinar documento eletronicamente com registro de IP e Carimbo de Tempo' })
  async sign(
    @Param('token') token: string,
    @Req() req: Request,
  ) {
    const ip = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';
    return this.signaturesService.signEnvelope(token, String(ip));
  }
}
