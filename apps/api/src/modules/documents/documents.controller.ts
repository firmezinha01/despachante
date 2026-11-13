import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DocumentsService } from './documents.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';

@ApiTags('Gestão Documental & OCR')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('documents')
export class DocumentsController {
  constructor(private documentsService: DocumentsService) {}

  @Get('process/:processId')
  @ApiOperation({ summary: 'Listar documentos e resultados de OCR de um processo' })
  async listByProcess(
    @CurrentTenant() tenantId: string,
    @Param('processId') processId: string,
  ) {
    return this.documentsService.listByProcess(tenantId, processId);
  }

  @Post('process/:processId/attach')
  @ApiOperation({ summary: 'Anexar documento veicular ao processo e executar OCR automático' })
  async attach(
    @CurrentTenant() tenantId: string,
    @Param('processId') processId: string,
    @Body() body: any,
  ) {
    return this.documentsService.attachDocument(tenantId, processId, body);
  }
}
