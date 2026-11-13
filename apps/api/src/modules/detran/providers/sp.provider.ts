import { Injectable, Logger } from '@nestjs/common';
import {
  IDetranProvider,
  VeiculoConsultaResult,
  DebitosResult,
  GuiaTaxaResult,
  ProtocoloResult,
} from '../interfaces/detran-provider.interface';

@Injectable()
export class SPProvider implements IDetranProvider {
  readonly uf = 'SP';
  private readonly logger = new Logger(SPProvider.name);

  async consultarVeiculo(placa: string, renavam: string): Promise<VeiculoConsultaResult> {
    this.logger.log(`[DETRAN-SP / e-CRVsp] Consultando veículo Placa: ${placa}, Renavam: ${renavam}`);

    return {
      placa: placa.toUpperCase(),
      renavam,
      chassi: '9BRBD48E9K8' + Math.random().toString().slice(2, 8),
      marcaModelo: 'TOYOTA/COROLLA ALTIS HYBRID',
      anoFabricacao: 2024,
      anoModelo: 2024,
      cor: 'CINZA',
      combustivel: 'GASOLINA/ELETRICO (HIBRIDO)',
      categoria: 'PARTICULAR',
      uf: 'SP',
      municipio: 'SAO PAULO',
      proprietarioNome: 'CARLOS EDUARDO SILVA',
      proprietarioDocumento: '***.456.789-**',
      situacaoVeiculo: 'REGULAR',
      restricoes: ['ALIENACAO FIDUCIARIA: BANCO TOYOTA S/A'],
    };
  }

  async consultarDebitos(placa: string, renavam: string): Promise<DebitosResult> {
    this.logger.log(`[SEFAZ-SP / DETRAN-SP] Consultando débitos do veículo Placa: ${placa}`);

    return {
      placa: placa.toUpperCase(),
      renavam,
      totalDebitos: 425.50,
      temBloqueioJudicial: false,
      temComunicacaoVenda: true,
      debitos: [
        {
          id: 'SP-IPVA-2026',
          tipo: 'IPVA',
          descricao: 'IPVA Exercício 2026 (Quitado)',
          exercicio: 2026,
          valorOriginal: 0,
          jurosMulta: 0,
          valorTotal: 0,
          dataVencimento: '2026-02-15',
        },
        {
          id: 'SP-TAXA-TRANSF',
          tipo: 'TAXA_TRANSFERENCIA',
          descricao: 'Taxa Estadual de Transferência de Propriedade (e-CRVsp)',
          valorOriginal: 265.28,
          jurosMulta: 0,
          valorTotal: 265.28,
          dataVencimento: '2026-12-31',
          orgaoAutuador: 'DETRAN-SP',
        },
        {
          id: 'SP-VISTORIA-ECV',
          tipo: 'TAXA_TRANSFERENCIA',
          descricao: 'Taxa de Laudo de Vistoria de Identificação Veicular (ECV)',
          valorOriginal: 160.22,
          jurosMulta: 0,
          valorTotal: 160.22,
          dataVencimento: '2026-12-31',
        },
      ],
    };
  }

  async emitirGuiaTaxa(tipoTaxa: string, dados: any): Promise<GuiaTaxaResult> {
    const numeroGuia = `DUA-SP-${Date.now()}`;
    return {
      numeroGuia,
      codigoBarras: '85830000002160220179261234567890123456789012',
      linhaDigitavel: '85830.00000 21602.201792 61234.567890 1 23456789012',
      valor: dados.valor || 265.28,
      dataVencimento: new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString().split('T')[0],
      pdfUrl: `https://detran.sp.gov.br/guias/download/${numeroGuia}.pdf`,
    };
  }

  async transmitirProcesso(dadosProcesso: any): Promise<ProtocoloResult> {
    const numeroProtocolo = `SP-DETRAN-${new Date().getFullYear()}-${Math.floor(1000000 + Math.random() * 9000000)}`;
    return {
      numeroProtocolo,
      status: 'EM_PROCESSAMENTO',
      mensagem: 'Processo transmitido com sucesso ao sistema e-CRVsp do Detran de São Paulo.',
      dataHora: new Date().toISOString(),
    };
  }
}
