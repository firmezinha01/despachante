import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FiscalService, EmitirNfseParams } from './fiscal.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';

@ApiTags('Fiscal Brasileiro')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('fiscal')
export class FiscalController {
  constructor(private fiscalService: FiscalService) {}

  @Get('documents')
  @ApiOperation({ summary: 'Listar notas fiscais (NFS-e / NF-e) emitidas' })
  async list(@CurrentTenant() tenantId: string) {
    return this.fiscalService.listDocuments(tenantId);
  }

  @Post('nfse')
  @ApiOperation({ summary: 'Emitir NFS-e de serviços de despachante com segregação de taxas dedutíveis' })
  async emitirNfse(
    @CurrentTenant() tenantId: string,
    @Body() body: EmitirNfseParams,
  ) {
    return this.fiscalService.emitirNfse(tenantId, body);
  }

  @Post('documents/:id/cancel')
  @ApiOperation({ summary: 'Cancelar documento fiscal emitido' })
  async cancelar(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body('motivo') motivo: string,
  ) {
    return this.fiscalService.cancelarDocumento(tenantId, id, motivo);
  }
}
