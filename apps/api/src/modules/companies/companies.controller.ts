import { Controller, Get, Put, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CompaniesService } from './companies.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('Empresas & Filiais')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('companies')
export class CompaniesController {
  constructor(private companiesService: CompaniesService) {}

  @Get('current')
  @ApiOperation({ summary: 'Obter dados da empresa atual do despachante' })
  async getCurrent(@CurrentTenant() tenantId: string) {
    return this.companiesService.getCompanyInfo(tenantId);
  }

  @Put('settings')
  @Roles('SUPER_ADMIN', 'PROPRIETARIO', 'GERENTE')
  @ApiOperation({ summary: 'Atualizar configurações de marca (cor roxa, logo, dados de contato)' })
  async updateSettings(
    @CurrentTenant() tenantId: string,
    @Body() body: any,
  ) {
    return this.companiesService.updateCompanySettings(tenantId, body);
  }

  @Get('branches')
  @ApiOperation({ summary: 'Listar filiais da rede de despachantes' })
  async listBranches(@CurrentTenant() tenantId: string) {
    return this.companiesService.listBranches(tenantId);
  }

  @Post('branches')
  @Roles('SUPER_ADMIN', 'PROPRIETARIO', 'GERENTE')
  @ApiOperation({ summary: 'Cadastrar nova filial ou posto de atendimento' })
  async createBranch(
    @CurrentTenant() tenantId: string,
    @Body() body: any,
  ) {
    return this.companiesService.createBranch(tenantId, body);
  }
}
