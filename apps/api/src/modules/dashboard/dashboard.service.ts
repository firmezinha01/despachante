import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getSummary(tenantId: string) {
    const agora = new Date();

    // 1. Processos por status
    const processes = await this.prisma.process.findMany({
      where: { tenantId, deletadoEm: null },
      select: {
        id: true,
        status: true,
        tipoServico: true,
        prazoSla: true,
        valorHonorarios: true,
        valorTaxas: true,
        valorTotal: true,
        pago: true,
        concluidoEm: true,
      },
    });

    const totalProcessos = processes.length;
    const processosAtivos = processes.filter((p) => p.status !== 'CONCLUIDO' && p.status !== 'CANCELADO').length;
    const processosConcluidos = processes.filter((p) => p.status === 'CONCLUIDO').length;

    // Alertas de SLA
    const processosSlaAtrasados = processes.filter((p) => {
      return (
        p.status !== 'CONCLUIDO' &&
        p.status !== 'CANCELADO' &&
        p.prazoSla &&
        new Date(p.prazoSla) < agora
      );
    }).length;

    // Faturamento e Segregação
    let faturamentoHonorarios = 0;
    let repasseTaxasDetran = 0;

    processes.forEach((p) => {
      if (p.pago) {
        faturamentoHonorarios += Number(p.valorHonorarios);
        repasseTaxasDetran += Number(p.valorTaxas);
      }
    });

    const ticketMedio = processosConcluidos > 0 ? faturamentoHonorarios / processosConcluidos : 0;

    // Agrupamento por status
    const statusCounts: Record<string, number> = {};
    processes.forEach((p) => {
      statusCounts[p.status] = (statusCounts[p.status] || 0) + 1;
    });

    // Agrupamento por serviço
    const serviceCounts: Record<string, number> = {};
    processes.forEach((p) => {
      serviceCounts[p.tipoServico] = (serviceCounts[p.tipoServico] || 0) + 1;
    });

    // Contagem de Clientes e Veículos
    const totalClientes = await this.prisma.customer.count({
      where: { tenantId, deletadoEm: null },
    });

    const totalVeiculos = await this.prisma.vehicle.count({
      where: { tenantId, deletadoEm: null },
    });

    return {
      kpis: {
        processosAtivos,
        processosConcluidos,
        processosSlaAtrasados,
        totalProcessos,
        totalClientes,
        totalVeiculos,
        faturamentoHonorarios,
        repasseTaxasDetran,
        faturamentoTotalGeral: faturamentoHonorarios + repasseTaxasDetran,
        ticketMedio: Number(ticketMedio.toFixed(2)),
      },
      processosPorStatus: Object.entries(statusCounts).map(([status, quantidade]) => ({
        status,
        quantidade,
      })),
      processosPorServico: Object.entries(serviceCounts).map(([servico, quantidade]) => ({
        servico,
        quantidade,
      })),
    };
  }
}
