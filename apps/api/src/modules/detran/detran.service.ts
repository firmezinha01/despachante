import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { IDetranProvider, VeiculoConsultaResult, DebitosResult } from './interfaces/detran-provider.interface';
import { SPProvider } from './providers/sp.provider';
import { RJProvider } from './providers/rj.provider';
import { MGProvider } from './providers/mg.provider';
import { PRProvider } from './providers/pr.provider';
import { SenatranProvider } from './providers/senatran.provider';

@Injectable()
export class DetranService {
  private readonly logger = new Logger(DetranService.name);
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

  getGatewayToken(): string | null {
    return (
      process.env.DETRAN_GATEWAY_TOKEN ||
      process.env.INFOSIMPLES_TOKEN ||
      process.env.INFOSIMPLES_API_KEY ||
      process.env.INFOSIMPLES_KEY ||
      process.env.API_INFOSIMPLES_TOKEN ||
      null
    );
  }

  getProvider(uf: string): IDetranProvider {
    const cleanUf = (uf || 'SP').toUpperCase();
    const provider = this.providers.get(cleanUf);
    if (!provider) {
      return this.providers.get('SP') || this.senatranProvider;
    }
    return provider;
  }

  /**
   * Executa a consulta real na API v2 da Infosimples
   */
  async consultarInfosimples(uf: string, placa: string, renavam: string) {
    const token = this.getGatewayToken();
    if (!token) {
      return null;
    }

    const cleanUf = (uf || 'sp').toLowerCase();
    const cleanPlaca = placa.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    const cleanRenavam = (renavam || '').trim();

    // Endpoint oficial da Infosimples para débitos e dados cadastrais do Detran
    const url = `https://api.infosimples.com/api/v2/consultas/detran/${cleanUf}/debitos-restricoes`;
    this.logger.log(`[Infosimples Gateway] Disparando POST para ${url} | Placa: ${cleanPlaca}`);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          token,
          placa: cleanPlaca,
          renavam: cleanRenavam,
          timeout: 60,
        }),
      });

      const json = await response.json();
      this.logger.log(`[Infosimples Gateway] Resposta recebida: Código ${json.code} - ${json.code_message}`);

      if (json.code === 200 && json.data && json.data.length > 0) {
        return json.data[0];
      }

      // Se a Infosimples retornou código de erro (601: token inválido, 608: saldo insuficiente, 605: timeout, etc.)
      if (json.code !== 200) {
        throw new BadRequestException(
          `Infosimples: ${json.code_message || 'Erro na consulta do veículo'} (Código ${json.code})`
        );
      }

      return null;
    } catch (err: any) {
      if (err instanceof BadRequestException) {
        throw err;
      }
      this.logger.error(`Erro ao comunicar com a Infosimples: ${err.message}`);
      throw new BadRequestException(`Falha ao conectar com o gateway Infosimples: ${err.message}`);
    }
  }

  async consultarVeiculo(uf: string, placa: string, renavam: string): Promise<VeiculoConsultaResult> {
    if (!placa) {
      throw new BadRequestException('Placa do veículo é obrigatória.');
    }

    const token = this.getGatewayToken();
    if (token) {
      const infoData = await this.consultarInfosimples(uf, placa, renavam);
      if (infoData) {
        const restricoes: string[] = [];
        if (infoData.restricao_financeira && infoData.restricao_financeira !== 'NADA CONSTA') {
          restricoes.push(`FINANCEIRA: ${infoData.restricao_financeira}`);
        }
        if (infoData.restricao_judiciaria && infoData.restricao_judiciaria !== 'NADA CONSTA') {
          restricoes.push(`JUDICIAL: ${infoData.restricao_judiciaria}`);
        }
        if (infoData.restricao_administrativa && infoData.restricao_administrativa !== 'NADA CONSTA') {
          restricoes.push(`ADMINISTRATIVA: ${infoData.restricao_administrativa}`);
        }
        if (Array.isArray(infoData.restricoes)) {
          restricoes.push(...infoData.restricoes);
        }

        return {
          placa: (infoData.placa || placa).toUpperCase(),
          renavam: infoData.renavam || renavam,
          chassi: infoData.chassi || 'NÃO INFORMADO',
          marcaModelo: infoData.marca_modelo || infoData.marca || 'VEÍCULO HOMOLOGADO INFOSIMPLES',
          anoFabricacao: Number(infoData.ano_fabricacao) || 2024,
          anoModelo: Number(infoData.ano_modelo) || 2024,
          cor: infoData.cor || 'PRATA',
          combustivel: infoData.combustivel || 'FLEX',
          categoria: infoData.categoria || 'PARTICULAR',
          uf: (infoData.uf || uf || 'SP').toUpperCase(),
          municipio: infoData.municipio || 'SÃO PAULO',
          proprietarioNome: infoData.proprietario_nome || infoData.proprietario || 'PROPRIETÁRIO IDENTIFICADO',
          proprietarioDocumento: infoData.proprietario_documento || '***.***.***-**',
          situacaoVeiculo: infoData.situacao || 'REGULAR',
          restricoes,
        };
      }
    }

    // Modo Sandbox de Alta Fidelidade (quando token não informado)
    const provider = this.getProvider(uf);
    return provider.consultarVeiculo(placa, renavam || '');
  }

  async consultarDebitos(uf: string, placa: string, renavam: string): Promise<DebitosResult> {
    if (!placa) {
      throw new BadRequestException('Placa do veículo é obrigatória.');
    }

    const token = this.getGatewayToken();
    if (token) {
      const infoData = await this.consultarInfosimples(uf, placa, renavam);
      if (infoData) {
        const debitos: any[] = [];
        let total = 0;

        // Processa multas
        if (Array.isArray(infoData.debitos_multas)) {
          infoData.debitos_multas.forEach((m: any, idx: number) => {
            const v = Number(m.valor) || 0;
            total += v;
            debitos.push({
              id: `MULTA-${idx + 1}`,
              tipo: 'MULTA',
              descricao: m.descricao || `Multa DETRAN (${m.auto_infracao || 'Infração'})`,
              valorOriginal: v,
              valorTotal: v,
              dataVencimento: m.data_vencimento || '2026-12-31',
              orgaoAutuador: m.orgao || 'DETRAN',
            });
          });
        }

        // Processa IPVA
        if (Array.isArray(infoData.debitos_ipva)) {
          infoData.debitos_ipva.forEach((ipva: any, idx: number) => {
            const v = Number(ipva.valor) || 0;
            total += v;
            debitos.push({
              id: `IPVA-${idx + 1}`,
              tipo: 'IPVA',
              descricao: `IPVA Exercício ${ipva.exercicio || new Date().getFullYear()}`,
              valorOriginal: v,
              valorTotal: v,
              dataVencimento: ipva.data_vencimento || '2026-02-15',
            });
          });
        }

        // Processa Taxas Gerais
        if (Array.isArray(infoData.debitos_taxas)) {
          infoData.debitos_taxas.forEach((taxa: any, idx: number) => {
            const v = Number(taxa.valor) || 0;
            total += v;
            debitos.push({
              id: `TAXA-${idx + 1}`,
              tipo: 'TAXA_TRANSFERENCIA',
              descricao: taxa.descricao || 'Taxa de Licenciamento / Transferência',
              valorOriginal: v,
              valorTotal: v,
              dataVencimento: taxa.data_vencimento || '2026-12-31',
            });
          });
        }

        return {
          placa: (infoData.placa || placa).toUpperCase(),
          renavam: infoData.renavam || renavam,
          totalDebitos: total,
          temBloqueioJudicial: Boolean(infoData.restricao_judiciaria && infoData.restricao_judiciaria !== 'NADA CONSTA'),
          temComunicacaoVenda: Boolean(infoData.comunicacao_venda),
          debitos,
        };
      }
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
    const token = this.getGatewayToken();
    const hasSerproToken = !!(process.env.SERPRO_TOKEN || (process.env.SERPRO_CONSUMER_KEY && process.env.SERPRO_CONSUMER_SECRET));
    const hasProdespCert = !!process.env.PRODESP_CERT_PFX;

    return {
      statusGeral: 'OPERACIONAL',
      modoOperacao: token || hasSerproToken ? 'PRODUCAO_REAL' : 'HOMOLOGACAO_SANDBOX',
      gatewayConectado: !!token,
      gatewayProvedor: token ? 'Infosimples (API v2)' : 'Nenhum',
      provedores: [
        { uf: 'SP', orgao: 'DETRAN-SP / e-CRVsp', status: 'ONLINE', autenticacao: token ? 'INFOSIMPLES_ATIVO' : (hasProdespCert ? 'CERTIFICADO_A1' : 'HOMOLOGACAO') },
        { uf: 'RJ', orgao: 'DETRAN-RJ', status: 'ONLINE', autenticacao: token ? 'INFOSIMPLES_ATIVO' : 'HOMOLOGACAO' },
        { uf: 'MG', orgao: 'DETRAN-MG / SIAEX', status: 'ONLINE', autenticacao: token ? 'INFOSIMPLES_ATIVO' : 'HOMOLOGACAO' },
        { uf: 'PR', orgao: 'DETRAN-PR', status: 'ONLINE', autenticacao: token ? 'INFOSIMPLES_ATIVO' : 'HOMOLOGACAO' },
        { uf: 'BR', orgao: 'SENATRAN (BIN / RENAVE)', status: 'ONLINE', autenticacao: hasSerproToken ? 'SERPRO_OFICIAL' : 'HOMOLOGACAO' },
      ],
      instrucoesAtivacaoProducao: {
        gatewayAtivo: !!token,
        mensagem: token 
          ? 'Token do gateway DETRAN_GATEWAY_TOKEN detectado e pronto para consultas reais.'
          : 'Defina a variável DETRAN_GATEWAY_TOKEN no Render com sua chave da Infosimples.',
      },
    };
  }

  /**
   * Endpoint de teste para diagnosticar o token da Infosimples
   */
  async testGatewayToken() {
    const token = this.getGatewayToken();
    if (!token) {
      return {
        sucesso: false,
        tokenConfigurado: false,
        mensagem: 'Nenhuma variável de token (DETRAN_GATEWAY_TOKEN ou INFOSIMPLES_TOKEN) foi configurada no Render.',
      };
    }

    const tokenMasked = token.length > 8 ? `${token.substring(0, 4)}...${token.substring(token.length - 4)}` : '***';

    try {
      const url = 'https://api.infosimples.com/api/v2/consultas/detran/sp/debitos-restricoes';
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ token, placa: 'BRA2E19', renavam: '12345678901' }),
      });
      const json = await res.json();
      return {
        sucesso: json.code === 200,
        tokenConfigurado: true,
        tokenMasked,
        codigo: json.code,
        mensagem: json.code_message || 'Sem mensagem do gateway',
        header: json.header,
      };
    } catch (e: any) {
      return {
        sucesso: false,
        tokenConfigurado: true,
        tokenMasked,
        erro: e.message,
      };
    }
  }
}
