import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { VehiclesService } from './vehicles.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';

@ApiTags('Veículos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('vehicles')
export class VehiclesController {
  constructor(private vehiclesService: VehiclesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar frota e veículos com busca por Placa, Renavam ou Modelo' })
  @ApiQuery({ name: 'search', required: false, description: 'Placa Mercosul, Renavam ou Modelo' })
  @ApiQuery({ name: 'clienteId', required: false, description: 'ID do cliente proprietário' })
  async list(
    @CurrentTenant() tenantId: string,
    @Query('search') search?: string,
    @Query('clienteId') clienteId?: string,
  ) {
    return this.vehiclesService.listVehicles(tenantId, search, clienteId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter detalhes do veículo, débitos, restrições e processos' })
  async getById(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.vehiclesService.getVehicleById(tenantId, id);
  }

  @Get('placa/:placa')
  @ApiOperation({ summary: 'Consultar veículo cadastrado pela Placa' })
  async getByPlaca(
    @CurrentTenant() tenantId: string,
    @Param('placa') placa: string,
  ) {
    return this.vehiclesService.getVehicleByPlaca(tenantId, placa);
  }

  @Post()
  @ApiOperation({ summary: 'Cadastrar novo veículo' })
  async create(
    @CurrentTenant() tenantId: string,
    @Body() body: any,
  ) {
    return this.vehiclesService.createVehicle(tenantId, body);
  }

  @Post(':id/restrictions')
  @ApiOperation({ summary: 'Registrar restrição veicular (Alienação, Bloqueio Judicial, Sinistro)' })
  async addRestriction(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() body: { tipo: string; descricao: string; orgao?: string },
  ) {
    return this.vehiclesService.addRestriction(tenantId, id, body);
  }
}
