import { Injectable, Logger } from '@nestjs/common';
import {
  IDetranProvider,
  VeiculoConsultaResult,
  DebitosResult,
  GuiaTaxaResult,
  ProtocoloResult,
} from '../interfaces/detran-provider.interface';

@Injectable()
export class MGProvider implements IDetranProvider {
  readonly uf = 'MG';
  private readonly logger = new Logger(MGProvider.name);

  async consultarVeiculo(placa: string, renavam: string): Promise<VeiculoConsultaResult> {
    this.logger.log(`[DETRAN-MG / SIAEX] Consultando veículo Placa: ${placa}, Renavam: ${renavam}`);
    return {
      placa: placa.toUpperCase(),
      renavam,
      chassi: '9BD15802W9' + Math.random().toString().slice(2, 8),
      marcaModelo: 'FIAT/STRADA FREEDOM',
      anoFabricacao: 2023,
      anoModelo: 2024,
      cor: 'VERMELHO',
      combustivel: 'FLEX',
      categoria: 'PARTICULAR',
      uf: 'MG',
      municipio: 'BELO HORIZONTE',
      proprietarioNome: 'LUCAS AGUIAR PEREIRA',
      proprietarioDocumento: '***.333.222-**',
      situacaoVeiculo: 'REGULAR',
      restricoes: [],
    };
  }

  async consultarDebitos(placa: string, renavam: string): Promise<DebitosResult> {
    return {
      placa: placa.toUpperCase(),
      renavam,
      totalDebitos: 236.80,
      temBloqueioJudicial: false,
      temComunicacaoVenda: false,
      debitos: [
        {
          id: 'MG-TAXA-TRLAV',
          tipo: 'LICENCIAMENTO',
          descricao: 'Taxa de Renovação do Licenciamento Anual de Veículo (TRLAV-MG)',
          valorOriginal: 33.66,
          jurosMulta: 0,
          valorTotal: 33.66,
          dataVencimento: '2026-03-31',
        },
        {
          id: 'MG-TAXA-TRANSFERENCIA',
          tipo: 'TAXA_TRANSFERENCIA',
          descricao: 'Taxa de Transferência Veicular Detran-MG',
          valorOriginal: 203.14,
          jurosMulta: 0,
          valorTotal: 203.14,
          dataVencimento: '2026-12-31',
        },
      ],
    };
  }

  async emitirGuiaTaxa(tipoTaxa: string, dados: any): Promise<GuiaTaxaResult> {
    return {
      numeroGuia: `DAE-MG-${Date.now()}`,
      codigoBarras: '8581000000203140179261234567890123456789012',
      linhaDigitavel: '85810.00000 20314.017926 61234.567890 1 23456789012',
      valor: dados.valor || 203.14,
      dataVencimento: new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString().split('T')[0],
    };
  }

  async transmitirProcesso(dadosProcesso: any): Promise<ProtocoloResult> {
    return {
      numeroProtocolo: `MG-SIAEX-${new Date().getFullYear()}-${Math.floor(1000000 + Math.random() * 9000000)}`,
      status: 'EM_PROCESSAMENTO',
      mensagem: 'Processo transmitido ao sistema SIAEX Detran de Minas Gerais com sucesso.',
      dataHora: new Date().toISOString(),
    };
  }
}
