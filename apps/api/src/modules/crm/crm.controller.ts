import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CrmService } from './crm.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CustomerType } from '@prisma/client';

@ApiTags('CRM & Clientes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('crm/customers')
export class CrmController {
  constructor(private crmService: CrmService) {}

  @Get()
  @ApiOperation({ summary: 'Listar clientes (PF e PJ) com filtro de busca e tipo' })
  @ApiQuery({ name: 'search', required: false, description: 'Busca por Nome, CPF, CNPJ ou E-mail' })
  @ApiQuery({ name: 'tipo', required: false, enum: CustomerType })
  async list(
    @CurrentTenant() tenantId: string,
    @Query('search') search?: string,
    @Query('tipo') tipo?: CustomerType,
  ) {
    return this.crmService.listCustomers(tenantId, search, tipo);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhes completos do cliente, histórico de veículos e processos' })
  async getById(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.crmService.getCustomerById(tenantId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Cadastrar novo cliente (Pessoa Física ou Jurídica)' })
  async create(
    @CurrentTenant() tenantId: string,
    @Body() body: any,
  ) {
    return this.crmService.createCustomer(tenantId, body);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar dados cadastrais do cliente' })
  async update(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.crmService.updateCustomer(tenantId, id, body);
  }
}
