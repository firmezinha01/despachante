import { Injectable, Logger } from '@nestjs/common';
import {
  IDetranProvider,
  VeiculoConsultaResult,
  DebitosResult,
  GuiaTaxaResult,
  ProtocoloResult,
} from '../interfaces/detran-provider.interface';

@Injectable()
export class RJProvider implements IDetranProvider {
  readonly uf = 'RJ';
  private readonly logger = new Logger(RJProvider.name);

  async consultarVeiculo(placa: string, renavam: string): Promise<VeiculoConsultaResult> {
    this.logger.log(`[DETRAN-RJ] Consultando veículo Placa: ${placa}, Renavam: ${renavam}`);
    return {
      placa: placa.toUpperCase(),
      renavam,
      chassi: '9BG116DW4M0' + Math.random().toString().slice(2, 8),
      marcaModelo: 'CHEVROLET/ONIX PLUS PREMIER',
      anoFabricacao: 2023,
      anoModelo: 2024,
      cor: 'BRANCO',
      combustivel: 'ALCOOL/GASOLINA',
      categoria: 'PARTICULAR',
      uf: 'RJ',
      municipio: 'RIO DE JANEIRO',
      proprietarioNome: 'MARCOS VINICIUS COSTA',
      proprietarioDocumento: '***.888.999-**',
      situacaoVeiculo: 'REGULAR',
      restricoes: [],
    };
  }

  async consultarDebitos(placa: string, renavam: string): Promise<DebitosResult> {
    return {
      placa: placa.toUpperCase(),
      renavam,
      totalDebitos: 312.40,
      temBloqueioJudicial: false,
      temComunicacaoVenda: false,
      debitos: [
        {
          id: 'RJ-TAXA-GRT',
          tipo: 'LICENCIAMENTO',
          descricao: 'Guia de Regularização de Taxas (GRT Detran-RJ)',
          valorOriginal: 183.18,
          jurosMulta: 0,
          valorTotal: 183.18,
          dataVencimento: '2026-11-30',
        },
        {
          id: 'RJ-MULTA-PREFEITURA',
          tipo: 'MULTA',
          descricao: 'Avanço de Sinal Vermelho - Radar Municipal',
          valorOriginal: 129.22,
          jurosMulta: 0,
          valorTotal: 129.22,
          dataVencimento: '2026-12-10',
          orgaoAutuador: 'SMTR RIO',
          codigoInfracao: '605-03',
        },
      ],
    };
  }

  async emitirGuiaTaxa(tipoTaxa: string, dados: any): Promise<GuiaTaxaResult> {
    return {
      numeroGuia: `GRT-RJ-${Date.now()}`,
      codigoBarras: '8587000000183180179261234567890123456789012',
      linhaDigitavel: '85870.00000 18318.017926 61234.567890 1 23456789012',
      valor: dados.valor || 183.18,
      dataVencimento: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().split('T')[0],
    };
  }

  async transmitirProcesso(dadosProcesso: any): Promise<ProtocoloResult> {
    return {
      numeroProtocolo: `RJ-DETRAN-${new Date().getFullYear()}-${Math.floor(1000000 + Math.random() * 9000000)}`,
      status: 'EM_PROCESSAMENTO',
      mensagem: 'Processo transmitido ao Portal de Serviços do Detran-RJ com sucesso.',
      dataHora: new Date().toISOString(),
    };
  }
}
