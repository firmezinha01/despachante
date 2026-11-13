import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ServiceTypeEnum, ProcessStatusEnum, ProcessPriorityEnum } from '@despachante/shared';

@Injectable()
export class ProcessesService {
  constructor(private prisma: PrismaService) {}

  async listProcesses(
    tenantId: string,
    filters?: {
      status?: string;
      tipoServico?: string;
      prioridade?: string;
      search?: string;
      branchId?: string;
    },
  ) {
    const where: any = {
      tenantId,
      deletadoEm: null,
    };

    if (filters?.status) where.status = filters.status;
    if (filters?.tipoServico) where.tipoServico = filters.tipoServico;
    if (filters?.prioridade) where.prioridade = filters.prioridade;
    if (filters?.branchId) where.branchId = filters.branchId;

    if (filters?.search) {
      const search = filters.search.trim();
      where.OR = [
        { protocolo: { contains: search, mode: 'insensitive' } },
        { protocoloDetran: { contains: search, mode: 'insensitive' } },
        { veiculo: { placa: { contains: search.replace(/[^a-zA-Z0-9]/g, '').toUpperCase() } } },
        { cliente: { nome: { contains: search, mode: 'insensitive' } } },
        { cliente: { razaoSocial: { contains: search, mode: 'insensitive' } } },
        { cliente: { cpf: { contains: search } } },
      ];
    }

    return this.prisma.process.findMany({
      where,
      orderBy: { criadoEm: 'desc' },
      include: {
        cliente: {
          select: {
            id: true,
            nome: true,
            razaoSocial: true,
            cpf: true,
            cnpj: true,
            telefone: true,
            whatsapp: true,
          },
        },
        veiculo: {
          select: {
            id: true,
            placa: true,
            modelo: true,
            marca: true,
            anoModelo: true,
            renavam: true,
          },
        },
        responsavel: {
          select: {
            id: true,
            nome: true,
            cargo: true,
          },
        },
        _count: {
          select: {
            documents: true,
            checklists: true,
          },
        },
      },
    });
  }

  async getProcessById(tenantId: string, id: string) {
    const process = await this.prisma.process.findFirst({
      where: { id, tenantId, deletadoEm: null },
      include: {
        cliente: true,
        veiculo: {
          include: {
            restrictions: true,
          },
        },
        responsavel: {
          select: {
            id: true,
            nome: true,
            email: true,
            cargo: true,
          },
        },
        stages: {
          orderBy: { dataEntrada: 'asc' },
        },
        checklists: {
          orderBy: { descricao: 'asc' },
        },
        documents: {
          include: {
            ocr: true,
          },
          orderBy: { criadoEm: 'desc' },
        },
        signatures: true,
        financialTx: {
          orderBy: { criadoEm: 'desc' },
        },
        pixCharges: {
          orderBy: { criadoEm: 'desc' },
        },
      },
    });

    if (!process) {
      throw new NotFoundException('Processo não encontrado.');
    }

    return process;
  }

  async createProcess(
    tenantId: string,
    userId: string,
    data: {
      tipoServico: ServiceTypeEnum;
      prioridade?: ProcessPriorityEnum;
      clienteId: string;
      veiculoId: string;
      responsavelId?: string;
      branchId?: string;
      valorHonorarios?: number;
      valorTaxas?: number;
      observacoes?: string;
      prazoDiasSla?: number;
    },
  ) {
    // Gera protocolo sequencial único
    const count = await this.prisma.process.count({ where: { tenantId } });
    const ano = new Date().getFullYear();
    const sequencial = String(count + 1).padStart(4, '0');
    const protocolo = `PROC-${ano}-${sequencial}`;

    const honorarios = Number(data.valorHonorarios || 0);
    const taxas = Number(data.valorTaxas || 0);
    const valorTotal = honorarios + taxas;

    const diasSla = data.prazoDiasSla || 5;
    const prazoSla = new Date(Date.now() + diasSla * 24 * 60 * 60 * 1000);

    const process = await this.prisma.process.create({
      data: {
        tenantId,
        branchId: data.branchId,
        clienteId: data.clienteId,
        veiculoId: data.veiculoId,
        responsavelId: data.responsavelId || userId,
        criadoPorId: userId,
        protocolo,
        tipoServico: data.tipoServico,
        status: ProcessStatusEnum.TRIAGEM,
        prioridade: data.prioridade || ProcessPriorityEnum.NORMAL,
        prazoSla,
        valorHonorarios: honorarios,
        valorTaxas: taxas,
        valorTotal,
        observacoes: data.observacoes,
      },
    });

    // Registra primeira etapa no histórico do workflow
    await this.prisma.processStage.create({
      data: {
        processId: process.id,
        nomeEtapa: 'Abertura & Triagem Inicial',
        statusNovo: ProcessStatusEnum.TRIAGEM,
        comentarios: 'Processo aberto no sistema.',
      },
    });

    // Gera Checklist padrão dinâmico baseado no serviço
    const checklistItems = this.getDefaultChecklist(data.tipoServico);
    if (checklistItems.length > 0) {
      await this.prisma.processChecklist.createMany({
        data: checklistItems.map((item) => ({
          processId: process.id,
          descricao: item.descricao,
          obrigatorio: item.obrigatorio,
        })),
      });
    }

    return this.getProcessById(tenantId, process.id);
  }

  async changeStage(
    tenantId: string,
    processId: string,
    operadorNome: string,
    novoStatus: ProcessStatusEnum,
    comentarios?: string,
  ) {
    const process = await this.getProcessById(tenantId, processId);

    // Se estiver avançando para protocolo ou emissão, verifica checklist obrigatório
    if (novoStatus === ProcessStatusEnum.PROTOCOLO_DETRAN || novoStatus === ProcessStatusEnum.EMISSAO) {
      const pendencias = process.checklists.filter((c) => c.obrigatorio && !c.concluido);
      if (pendencias.length > 0) {
        throw new BadRequestException(
          `Não é possível avançar a etapa. Existem itens obrigatórios pendentes no checklist: ${pendencias.map((p) => p.descricao).join('; ')}`,
        );
      }
    }

    const dataSaida = new Date();

    // Fecha etapa anterior
    const ultimaEtapa = process.stages[process.stages.length - 1];
    if (ultimaEtapa) {
      await this.prisma.processStage.update({
        where: { id: ultimaEtapa.id },
        data: { dataSaida },
      });
    }

    // Registra nova etapa
    await this.prisma.processStage.create({
      data: {
        processId: process.id,
        nomeEtapa: `Transição para ${novoStatus}`,
        statusOrigem: process.status,
        statusNovo: novoStatus,
        comentarios,
        operadorNome,
      },
    });

    const updateData: any = {
      status: novoStatus,
    };

    if (novoStatus === ProcessStatusEnum.CONCLUIDO) {
      updateData.concluidoEm = new Date();
    }

    return this.prisma.process.update({
      where: { id: processId },
      data: updateData,
      include: {
        stages: true,
        checklists: true,
      },
    });
  }

  async toggleChecklist(
    tenantId: string,
    processId: string,
    checklistId: string,
    concluido: boolean,
    operadorNome: string,
  ) {
    await this.getProcessById(tenantId, processId);

    return this.prisma.processChecklist.update({
      where: { id: checklistId },
      data: {
        concluido,
        concluidoPor: concluido ? operadorNome : null,
        concluidoEm: concluido ? new Date() : null,
      },
    });
  }

  private getDefaultChecklist(tipo: ServiceTypeEnum): { descricao: string; obrigatorio: boolean }[] {
    switch (tipo) {
      case ServiceTypeEnum.TRANSFERENCIA:
        return [
          { descricao: 'Conferência do Laudo de Vistoria ECV Aprovado', obrigatorio: true },
          { descricao: 'Validação da ATPV-e ou CRV com assinaturas autenticadas/Gov.br', obrigatorio: true },
          { descricao: 'Certidão Negativa de Débitos, Multas e IPVA', obrigatorio: true },
          { descricao: 'Comprovante de pagamento da Guia DUA/Taxa de Transferência', obrigatorio: true },
          { descricao: 'Emissão e Entrega do CRLV-e Digital Final', obrigatorio: true },
        ];
      case ServiceTypeEnum.LICENCIAMENTO:
        return [
          { descricao: 'Consulta de débitos de IPVA, DPVAT e Multas ativas', obrigatorio: true },
          { descricao: 'Pagamento da Taxa de Licenciamento Anual DETRAN', obrigatorio: true },
          { descricao: 'Emissão do CRLV-e atualizado no SENATRAN', obrigatorio: true },
        ];
      case ServiceTypeEnum.PRIMEIRO_EMPLACAMENTO:
        return [
          { descricao: 'Nota Fiscal da Concessionária/Montadora (DANFE)', obrigatorio: true },
          { descricao: 'Decalque de Chassi e Motor ou Laudo de Identificação', obrigatorio: true },
          { descricao: 'Guia de Recolhimento do IPVA Proporcional paga', obrigatorio: true },
          { descricao: 'Autorização de Estampagem de Placa Mercosul', obrigatorio: true },
          { descricao: 'Emissão do primeiro CRV/CRLV-e', obrigatorio: true },
        ];
      default:
        return [
          { descricao: 'Conferência de Documentos Pessoais (RG/CNH e Comprovante de Endereço)', obrigatorio: true },
          { descricao: 'Consulta Completa RENAVAM / Histórico de Débitos', obrigatorio: true },
          { descricao: 'Pagamento de Taxas Estaduais', obrigatorio: true },
          { descricao: 'Conclusão e Entrega do Documento Final', obrigatorio: true },
        ];
    }
  }
}
