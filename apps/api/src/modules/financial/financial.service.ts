import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class FinancialService {
  constructor(private prisma: PrismaService) {}

  async listTransactions(
    tenantId: string,
    filters?: {
      tipo?: string;
      categoria?: string;
      status?: string;
      isTaxaTerceiro?: boolean;
      dataInicio?: Date;
      dataFim?: Date;
      processId?: string;
    },
  ) {
    const where: any = {
      tenantId,
      deletadoEm: null,
    };

    if (filters?.tipo) where.tipo = filters.tipo;
    if (filters?.categoria) where.categoria = filters.categoria;
    if (filters?.status) where.status = filters.status;
    if (filters?.processId) where.processId = filters.processId;
    if (filters?.isTaxaTerceiro !== undefined) where.isTaxaTerceiro = filters.isTaxaTerceiro;

    if (filters?.dataInicio || filters?.dataFim) {
      where.dataVencimento = {};
      if (filters.dataInicio) where.dataVencimento.gte = new Date(filters.dataInicio);
      if (filters.dataFim) where.dataVencimento.lte = new Date(filters.dataFim);
    }

    return this.prisma.financialTransaction.findMany({
      where,
      orderBy: { dataVencimento: 'desc' },
      include: {
        cliente: {
          select: {
            id: true,
            nome: true,
            razaoSocial: true,
            cpf: true,
            cnpj: true,
          },
        },
        process: {
          select: {
            id: true,
            protocolo: true,
            tipoServico: true,
            veiculo: {
              select: {
                placa: true,
                modelo: true,
              },
            },
          },
        },
        pixCharge: true,
      },
    });
  }

  async createTransaction(
    tenantId: string,
    data: {
      tipo: 'RECEITA' | 'DESPESA';
      categoria: string;
      descricao: string;
      valor: number;
      formaPagamento?: string;
      status?: string;
      dataVencimento: Date | string;
      processId?: string;
      clienteId?: string;
      isTaxaTerceiro?: boolean;
    },
  ) {
    return this.prisma.financialTransaction.create({
      data: {
        tenantId,
        tipo: data.tipo,
        categoria: data.categoria,
        descricao: data.descricao,
        valor: data.valor,
        formaPagamento: data.formaPagamento || 'PIX',
        status: data.status || 'PENDENTE',
        dataVencimento: new Date(data.dataVencimento),
        processId: data.processId,
        clienteId: data.clienteId,
        isTaxaTerceiro: data.isTaxaTerceiro || false,
      },
    });
  }

  async markAsPaid(tenantId: string, id: string) {
    const tx = await this.prisma.financialTransaction.findFirst({
      where: { id, tenantId },
    });

    if (!tx) {
      throw new NotFoundException('Lançamento financeiro não encontrado.');
    }

    return this.prisma.financialTransaction.update({
      where: { id },
      data: {
        status: 'PAGO',
        dataPagamento: new Date(),
      },
    });
  }

  async getDre(tenantId: string) {
    // Busca transações pagas
    const transactions = await this.prisma.financialTransaction.findMany({
      where: {
        tenantId,
        status: 'PAGO',
        deletadoEm: null,
      },
    });

    let receitaHonorarios = 0;
    let repasseTaxasTerceiros = 0;
    let despesasOperacionais = 0;
    let comissoesPagas = 0;

    for (const tx of transactions) {
      const valor = Number(tx.valor);
      if (tx.tipo === 'RECEITA') {
        if (tx.isTaxaTerceiro) {
          repasseTaxasTerceiros += valor;
        } else {
          receitaHonorarios += valor;
        }
      } else if (tx.tipo === 'DESPESA') {
        if (tx.categoria.includes('COMISSAO')) {
          comissoesPagas += valor;
        } else {
          despesasOperacionais += valor;
        }
      }
    }

    const totalDespesas = despesasOperacionais + comissoesPagas;
    const resultadoOperacional = receitaHonorarios - totalDespesas;
    const margemLiquida = receitaHonorarios > 0 ? (resultadoOperacional / receitaHonorarios) * 100 : 0;

    return {
      periodo: 'Ano Corrente',
      receitaHonorarios,
      repasseTaxasTerceiros,
      totalMovimentadoGeral: receitaHonorarios + repasseTaxasTerceiros,
      despesasOperacionais,
      comissoesPagas,
      totalDespesas,
      resultadoOperacional,
      margemLiquida: Number(margemLiquida.toFixed(2)),
    };
  }
}
