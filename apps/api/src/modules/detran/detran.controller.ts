import { Controller, Get, Post, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { DetranService } from './detran.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('DETRAN & SENATRAN')
@Controller('detran')
export class DetranController {
  constructor(private detranService: DetranService) {}

  @Get('consultar-veiculo')
  @ApiOperation({ summary: 'Consultar dados cadastrais do veículo no DETRAN estadual / SENATRAN' })
  @ApiQuery({ name: 'placa', required: true })
  @ApiQuery({ name: 'renavam', required: false })
  @ApiQuery({ name: 'uf', required: false, description: 'UF do DETRAN (SP, RJ, MG, PR, BR)' })
  async consultarVeiculo(
    @Query('placa') placa: string,
    @Query('renavam') renavam?: string,
    @Query('uf') uf?: string,
  ) {
    return this.detranService.consultarVeiculo(uf || 'SP', placa, renavam || '');
  }

  @Get('consultar-debitos')
  @ApiOperation({ summary: 'Consultar débitos, IPVA, multas, restrições e comunicação de venda no DETRAN' })
  @ApiQuery({ name: 'placa', required: true })
  @ApiQuery({ name: 'renavam', required: false })
  @ApiQuery({ name: 'uf', required: false })
  async consultarDebitos(
    @Query('placa') placa: string,
    @Query('renavam') renavam?: string,
    @Query('uf') uf?: string,
  ) {
    return this.detranService.consultarDebitos(uf || 'SP', placa, renavam || '');
  }

  @Post('emitir-guia')
  @ApiOperation({ summary: 'Emitir guia oficial de recolhimento de taxa estadual (DUA, DAE, GRT, etc.)' })
  async emitirGuia(
    @Body() body: { uf: string; tipoTaxa: string; dados: any },
  ) {
    return this.detranService.emitirGuiaTaxa(body.uf || 'SP', body.tipoTaxa, body.dados);
  }

  @Post('transmitir-processo')
  @ApiOperation({ summary: 'Transmitir processo eletrônico ao sistema do DETRAN (e-CRVsp, SIAEX, etc.)' })
  async transmitirProcesso(
    @Body() body: { uf: string; dadosProcesso: any },
  ) {
    return this.detranService.transmitirProcesso(body.uf || 'SP', body.dadosProcesso);
  }

  @Get('status')
  @ApiOperation({ summary: 'Consultar status dos provedores DETRAN e credenciais de integração' })
  async getStatus() {
    return this.detranService.getStatus();
  }
}
