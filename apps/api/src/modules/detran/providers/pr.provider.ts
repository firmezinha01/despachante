import { Injectable, Logger } from '@nestjs/common';
import {
  IDetranProvider,
  VeiculoConsultaResult,
  DebitosResult,
  GuiaTaxaResult,
  ProtocoloResult,
} from '../interfaces/detran-provider.interface';

@Injectable()
export class PRProvider implements IDetranProvider {
  readonly uf = 'PR';
  private readonly logger = new Logger(PRProvider.name);

  async consultarVeiculo(placa: string, renavam: string): Promise<VeiculoConsultaResult> {
    this.logger.log(`[DETRAN-PR] Consultando veículo Placa: ${placa}, Renavam: ${renavam}`);
    return {
      placa: placa.toUpperCase(),
      renavam,
      chassi: '9BWDB41J28P' + Math.random().toString().slice(2, 8),
      marcaModelo: 'VOLKSWAGEN/POLO TRACK',
      anoFabricacao: 2024,
      anoModelo: 2024,
      cor: 'PRATA',
      combustivel: 'FLEX',
      categoria: 'PARTICULAR',
      uf: 'PR',
      municipio: 'CURITIBA',
      proprietarioNome: 'BEATRIZ FONSECA',
      proprietarioDocumento: '***.777.666-**',
      situacaoVeiculo: 'REGULAR',
      restricoes: [],
    };
  }

  async consultarDebitos(placa: string, renavam: string): Promise<DebitosResult> {
    return {
      placa: placa.toUpperCase(),
      renavam,
      totalDebitos: 90.00,
      temBloqueioJudicial: false,
      temComunicacaoVenda: false,
      debitos: [
        {
          id: 'PR-LICENCIAMENTO',
          tipo: 'LICENCIAMENTO',
          descricao: 'Taxa Anual de Licenciamento de Veículos (Detran-PR)',
          valorOriginal: 90.00,
          jurosMulta: 0,
          valorTotal: 90.00,
          dataVencimento: '2026-08-30',
        },
      ],
    };
  }

  async emitirGuiaTaxa(tipoTaxa: string, dados: any): Promise<GuiaTaxaResult> {
    return {
      numeroGuia: `GR-PR-${Date.now()}`,
      codigoBarras: '8584000000090000179261234567890123456789012',
      linhaDigitavel: '85840.00000 09000.017926 61234.567890 1 23456789012',
      valor: dados.valor || 90.00,
      dataVencimento: new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString().split('T')[0],
    };
  }

  async transmitirProcesso(dadosProcesso: any): Promise<ProtocoloResult> {
    return {
      numeroProtocolo: `PR-DETRAN-${new Date().getFullYear()}-${Math.floor(1000000 + Math.random() * 9000000)}`,
      status: 'EM_PROCESSAMENTO',
      mensagem: 'Processo transmitido ao Detran-PR com sucesso.',
      dataHora: new Date().toISOString(),
    };
  }
}
