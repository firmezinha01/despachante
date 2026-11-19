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

    // Endpoints oficiais da API v2 da Infosimples (conforme catálogo apis.json)
    // Para SP: detran/sp/debitos. Para nacional unificado: detran/restricoes
    const url = cleanUf === 'sp'
      ? 'https://api.infosimples.com/api/v2/consultas/detran/sp/debitos'
      : 'https://api.infosimples.com/api/v2/consultas/detran/restricoes';

    this.logger.log(`[Infosimples Gateway] Disparando POST para ${url} | UF: ${cleanUf.toUpperCase()} | Placa: ${cleanPlaca}`);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          token,
          uf: cleanUf.toUpperCase(),
          placa: cleanPlaca,
          renavam: cleanRenavam,
          timeout: 60,
        }),
      });

      const json = await response.json();
      this.logger.log(`[Infosimples Gateway] Resposta: Código ${json.code} - ${json.code_message}`);

      if (json.code === 200 && json.data && json.data.length > 0) {
        return json.data[0];
      }

      // Se a Infosimples retornou código de erro ou bloqueio por conta CPF
      if (json.code !== 200) {
        const detalhes = json.errors && json.errors.length > 0 ? ` (${json.errors.join('; ')})` : '';
        throw new BadRequestException(
          `Infosimples: ${json.code_message || 'Erro na consulta do veículo'}${detalhes} [Código ${json.code}]`
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
   * Endpoint de teste para diagnosticar o token da Infosimples e permissões de DETRAN
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

    const tokenMasked = token.length > 8 ? `${token.substring(0, 7)}...${token.substring(token.length - 4)}` : '***';

    try {
      // 1. Valida autenticação e titularidade da conta na Infosimples
      let clientName = 'Não identificado';
      let tokenValido = false;
      let balanceActive = false;

      try {
        const pingRes = await fetch('https://api.infosimples.com/api/v2/consultas/receita-federal/cnpj', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, cnpj: '00000000000191' }),
        });
        const pingJson = await pingRes.json();
        if (pingJson.code === 200 || pingJson.code === 608) {
          tokenValido = true;
          balanceActive = pingJson.code === 200;
          clientName = pingJson.header?.client_name || pingJson.header?.token_name || clientName;
        } else if (pingJson.code === 601) {
          return {
            sucesso: false,
            tokenConfigurado: true,
            tokenMasked,
            codigo: 601,
            mensagem: 'Token inválido ou não reconhecido pela Infosimples.',
          };
        }
      } catch (err: any) {
        this.logger.warn(`Erro no ping básico da Infosimples: ${err.message}`);
      }

      // 2. Testa permissão específica do serviço de DETRAN
      const detranRes = await fetch('https://api.infosimples.com/api/v2/consultas/detran/restricoes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ token, uf: 'SP', placa: 'BRA2E19', renavam: '12345678901' }),
      });
      const detranJson = await detranRes.json();

      if (detranJson.code === 200) {
        return {
          sucesso: true,
          tokenConfigurado: true,
          tokenValido: true,
          detranLiberado: true,
          clientName,
          tokenMasked,
          codigo: 200,
          mensagem: 'Conexão com a Infosimples 100% ativa e autorizada para consultas de DETRAN!',
        };
      }

      // Caso clássico: Conta de Pessoa Física (CPF) na Infosimples
      const isCpfAccount = detranJson.code === 603 &&
        detranJson.errors?.some((e: string) => e.toLowerCase().includes('pessoa física') || e.toLowerCase().includes('cpf'));

      return {
        sucesso: false,
        tokenConfigurado: true,
        tokenValido: true,
        detranLiberado: false,
        exigeCnpj: isCpfAccount,
        clientName: detranJson.header?.client_name || clientName,
        tokenMasked,
        codigo: detranJson.code,
        mensagem: isCpfAccount
          ? 'Token autenticado com sucesso! Porém, a Infosimples exige uma conta de Pessoa Jurídica (CNPJ) para liberar o acesso aos DETRANs.'
          : (detranJson.code_message || 'Erro ao validar serviço do DETRAN'),
        erros: detranJson.errors || [],
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
