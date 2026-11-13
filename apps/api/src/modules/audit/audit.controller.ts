import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('Auditoria & LGPD')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('audit')
export class AuditController {
  constructor(private auditService: AuditService) {}

  @Get('logs')
  @Roles('SUPER_ADMIN', 'PROPRIETARIO', 'GERENTE')
  @ApiOperation({ summary: 'Consultar trilha de auditoria completa e logs de acesso LGPD' })
  async list(
    @CurrentTenant() tenantId: string,
    @Query('limit') limit?: number,
  ) {
    return this.auditService.listLogs(tenantId, limit ? Number(limit) : 50);
  }
}
