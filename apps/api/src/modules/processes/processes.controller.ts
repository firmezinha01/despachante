import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ProcessesService } from './processes.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser, RequestUser } from '../../common/decorators/current-user.decorator';
import { ProcessStatusEnum } from '@despachante/shared';

@ApiTags('Processos & Workflow')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('processes')
export class ProcessesController {
  constructor(private processesService: ProcessesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar processos veiculares com filtros para Kanban e Tabela' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'tipoServico', required: false })
  @ApiQuery({ name: 'prioridade', required: false })
  @ApiQuery({ name: 'search', required: false, description: 'Protocolo, Placa, Renavam ou Cliente' })
  async list(
    @CurrentTenant() tenantId: string,
    @Query('status') status?: string,
    @Query('tipoServico') tipoServico?: string,
    @Query('prioridade') prioridade?: string,
    @Query('search') search?: string,
  ) {
    return this.processesService.listProcesses(tenantId, {
      status,
      tipoServico,
      prioridade,
      search,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhes completos do processo (Etapas, Checklist, Docs OCR, Assinaturas, PIX)' })
  async getById(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.processesService.getProcessById(tenantId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Abrir novo processo veicular (gera protocolo, checklist automático e SLA)' })
  async create(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: RequestUser,
    @Body() body: any,
  ) {
    return this.processesService.createProcess(tenantId, user.id, body);
  }

  @Put(':id/stage')
  @ApiOperation({ summary: 'Avançar ou alterar etapa do workflow com validação de checklist' })
  async changeStage(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() body: { novoStatus: ProcessStatusEnum; comentarios?: string },
  ) {
    return this.processesService.changeStage(
      tenantId,
      id,
      user.nome,
      body.novoStatus,
      body.comentarios,
    );
  }

  @Put(':id/checklist/:checklistId')
  @ApiOperation({ summary: 'Marcar ou desmarcar item do checklist de conferência documental' })
  async toggleChecklist(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Param('checklistId') checklistId: string,
    @Body() body: { concluido: boolean },
  ) {
    return this.processesService.toggleChecklist(
      tenantId,
      id,
      checklistId,
      body.concluido,
      user.nome,
    );
  }
}
