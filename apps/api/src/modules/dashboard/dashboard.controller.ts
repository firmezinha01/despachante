import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';

@ApiTags('Dashboards & Indicadores')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Obter resumo consolidado de KPIs executivos, financeiros e operacionais' })
  async getSummary(@CurrentTenant() tenantId: string) {
    return this.dashboardService.getSummary(tenantId);
  }
}
