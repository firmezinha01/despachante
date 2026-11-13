import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { FinancialService } from './financial.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';

@ApiTags('Financeiro')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('financial')
export class FinancialController {
  constructor(private financialService: FinancialService) {}

  @Get('transactions')
  @ApiOperation({ summary: 'Listar contas a pagar e receber com filtros avançados' })
  @ApiQuery({ name: 'tipo', required: false, enum: ['RECEITA', 'DESPESA'] })
  @ApiQuery({ name: 'categoria', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'isTaxaTerceiro', required: false, type: Boolean })
  @ApiQuery({ name: 'dataInicio', required: false })
  @ApiQuery({ name: 'dataFim', required: false })
  async listTransactions(
    @CurrentTenant() tenantId: string,
    @Query('tipo') tipo?: string,
    @Query('categoria') categoria?: string,
    @Query('status') status?: string,
    @Query('isTaxaTerceiro') isTaxaTerceiro?: string,
    @Query('dataInicio') dataInicio?: string,
    @Query('dataFim') dataFim?: string,
  ) {
    return this.financialService.listTransactions(tenantId, {
      tipo,
      categoria,
      status,
      isTaxaTerceiro: isTaxaTerceiro !== undefined ? isTaxaTerceiro === 'true' : undefined,
      dataInicio: dataInicio ? new Date(dataInicio) : undefined,
      dataFim: dataFim ? new Date(dataFim) : undefined,
    });
  }

  @Post('transactions')
  @ApiOperation({ summary: 'Cadastrar nova despesa ou receita segregando honorários vs taxas' })
  async createTransaction(
    @CurrentTenant() tenantId: string,
    @Body() body: any,
  ) {
    return this.financialService.createTransaction(tenantId, body);
  }

  @Put('transactions/:id/pay')
  @ApiOperation({ summary: 'Baixar lançamento financeiro manualmente como pago' })
  async markAsPaid(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.financialService.markAsPaid(tenantId, id);
  }

  @Get('dre')
  @ApiOperation({ summary: 'Obter DRE Gerencial com segregação de receita própria e repasses' })
  async getDre(@CurrentTenant() tenantId: string) {
    return this.financialService.getDre(tenantId);
  }
}
