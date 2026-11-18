import { Injectable, BadRequestException } from '@nestjs/common';
import { IDetranProvider } from './interfaces/detran-provider.interface';
import { SPProvider } from './providers/sp.provider';
import { RJProvider } from './providers/rj.provider';
import { MGProvider } from './providers/mg.provider';
import { PRProvider } from './providers/pr.provider';
import { SenatranProvider } from './providers/senatran.provider';

@Injectable()
export class DetranService {
  private providers: Map<string, IDetranProvider> = new Map();

  constructor(
    private spProvider: SPProvider,
    private rjProvider: RJProvider,
    private mgProvider: MGProvider,
    private prProvider: PRProvider,
    private senatranProvider: SenatranProvider,
  ) {
    this.providers.set('SP', spProvider);
    this.providers.set('RJ', rjProvider);
    this.providers.set('MG', mgProvider);
    this.providers.set('PR', prProvider);
    this.providers.set('BR', senatranProvider);
  }

  getProvider(uf: string): IDetranProvider {
    const cleanUf = (uf || 'SP').toUpperCase();
    const provider = this.providers.get(cleanUf);
    if (!provider) {
      // Se não houver integração estadual implementada para a UF específica, usa Senatran/SP como fallback
      return this.providers.get('SP') || this.senatranProvider;
    }
    return provider;
  }

  async consultarVeiculo(uf: string, placa: string, renavam: string) {
    if (!placa) {
      throw new BadRequestException('Placa do veículo é obrigatória.');
    }
    const provider = this.getProvider(uf);
    return provider.consultarVeiculo(placa, renavam || '');
  }

  async consultarDebitos(uf: string, placa: string, renavam: string) {
    if (!placa) {
      throw new BadRequestException('Placa do veículo é obrigatória.');
    }
    const provider = this.getProvider(uf);
    return provider.consultarDebitos(placa, renavam || '');
  }

  async emitirGuiaTaxa(uf: string, tipoTaxa: string, dados: any) {
    const provider = this.getProvider(uf);
    return provider.emitirGuiaTaxa(tipoTaxa, dados);
  }

  async transmitirProcesso(uf: string, dadosProcesso: any) {
    const provider = this.getProvider(uf);
    return provider.transmitirProcesso(dadosProcesso);
  }

  async getStatus() {
    const hasGatewayToken = !!(process.env.DETRAN_GATEWAY_TOKEN || process.env.INFOSIMPLES_TOKEN);
    const hasSerproToken = !!(process.env.SERPRO_TOKEN || (process.env.SERPRO_CONSUMER_KEY && process.env.SERPRO_CONSUMER_SECRET));
    const hasProdespCert = !!process.env.PRODESP_CERT_PFX;

    return {
      statusGeral: 'OPERACIONAL',
      modoOperacao: hasGatewayToken || hasSerproToken ? 'PRODUCAO_REAL' : 'HOMOLOGACAO_SANDBOX',
      gatewayConectado: hasGatewayToken || hasSerproToken,
      provedores: [
        { uf: 'SP', orgao: 'DETRAN-SP / e-CRVsp (Prodesp)', status: 'ONLINE', autenticacao: hasProdespCert ? 'CERTIFICADO_A1' : (hasGatewayToken ? 'GATEWAY_ATIVO' : 'HOMOLOGACAO') },
        { uf: 'RJ', orgao: 'DETRAN-RJ / Proderj', status: 'ONLINE', autenticacao: hasGatewayToken ? 'GATEWAY_ATIVO' : 'HOMOLOGACAO' },
        { uf: 'MG', orgao: 'DETRAN-MG / SIAEX (Prodemge)', status: 'ONLINE', autenticacao: hasGatewayToken ? 'GATEWAY_ATIVO' : 'HOMOLOGACAO' },
        { uf: 'PR', orgao: 'DETRAN-PR / Celepar', status: 'ONLINE', autenticacao: hasGatewayToken ? 'GATEWAY_ATIVO' : 'HOMOLOGACAO' },
        { uf: 'BR', orgao: 'SENATRAN / Base Índice Nacional (BIN / RENAVE)', status: 'ONLINE', autenticacao: hasSerproToken ? 'SERPRO_OFICIAL' : 'HOMOLOGACAO' },
      ],
      instrucoesAtivacaoProducao: {
        opcaoRecomendada: 'Defina a variável DETRAN_GATEWAY_TOKEN no painel do Render com sua chave da Infosimples, Infocar ou Assertiva para habilitar consultas reais em todas as 27 UFs.',
        opcaoFederal: 'Para consultas federais diretas no SERPRO, defina SERPRO_CONSUMER_KEY e SERPRO_CONSUMER_SECRET.',
      },
    };
  }
}
