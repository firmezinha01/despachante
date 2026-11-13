import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async listLogs(tenantId: string, limit = 50) {
    return this.prisma.auditLog.findMany({
      where: { tenantId },
      orderBy: { criadoEm: 'desc' },
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            nome: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  async recordLog(data: {
    tenantId: string;
    userId?: string;
    acao: string;
    entidade: string;
    entidadeId?: string;
    dadosAnteriores?: any;
    dadosNovos?: any;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return this.prisma.auditLog.create({
      data,
    });
  }
}
