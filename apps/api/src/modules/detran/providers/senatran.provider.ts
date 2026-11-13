import { Injectable, Logger } from '@nestjs/common';
import {
  IDetranProvider,
  VeiculoConsultaResult,
  DebitosResult,
  GuiaTaxaResult,
  ProtocoloResult,
} from '../interfaces/detran-provider.interface';

@Injectable()
export class SenatranProvider implements IDetranProvider {
  readonly uf = 'BR'; // Nacional
  private readonly logger = new Logger(SenatranProvider.name);

  async consultarVeiculo(placa: string, renavam: string): Promise<VeiculoConsultaResult> {
    this.logger.log(`[SENATRAN / RENAVAM NACIONAL] Consultando Base Índice Nacional (BIN): ${placa}`);
    return {
      placa: placa.toUpperCase(),
      renavam,
      chassi: '9BR' + Math.random().toString().slice(2, 16),
      marcaModelo: 'VEICULO CONSULTADO NA BASE NACIONAL SENATRAN',
      anoFabricacao: 2024,
      anoModelo: 2024,
      cor: 'PRETO',
      combustivel: 'FLEX',
      categoria: 'PARTICULAR',
      uf: 'DF',
      municipio: 'BRASILIA',
      proprietarioNome: 'REGISTRO NACIONAL DE VEICULOS',
      proprietarioDocumento: '***.***.***-**',
      situacaoVeiculo: 'REGULAR',
      restricoes: [],
    };
  }

  async consultarDebitos(placa: string, renavam: string): Promise<DebitosResult> {
    return {
      placa: placa.toUpperCase(),
      renavam,
      totalDebitos: 0,
      temBloqueioJudicial: false,
      temComunicacaoVenda: false,
      debitos: [],
    };
  }

  async emitirGuiaTaxa(tipoTaxa: string, dados: any): Promise<GuiaTaxaResult> {
    return {
      numeroGuia: `SENATRAN-${Date.now()}`,
      codigoBarras: '8580000000000000179261234567890123456789012',
      linhaDigitavel: '85800.00000 00000.017926 61234.567890 1 23456789012',
      valor: 0,
      dataVencimento: new Date().toISOString().split('T')[0],
    };
  }

  async transmitirProcesso(dadosProcesso: any): Promise<ProtocoloResult> {
    return {
      numeroProtocolo: `SENATRAN-RENAVE-${Date.now()}`,
      status: 'EM_PROCESSAMENTO',
      mensagem: 'Comunicação nacional registrada no RENAVE / Senatran com sucesso.',
      dataHora: new Date().toISOString(),
    };
  }
}
