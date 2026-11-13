import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class CompaniesService {
  constructor(private prisma: PrismaService) {}

  async getCompanyInfo(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        branches: {
          where: { deletadoEm: null },
        },
        subscription: {
          include: {
            plan: true,
          },
        },
      },
    });

    if (!tenant) {
      throw new NotFoundException('Empresa/Tenant não encontrada.');
    }

    return tenant;
  }

  async updateCompanySettings(
    tenantId: string,
    data: {
      nomeFantasia?: string;
      email?: string;
      telefone?: string;
      whatsapp?: string;
      corPrimaria?: string;
      corSecundaria?: string;
      logotipoUrl?: string;
      assinaturaEmail?: string;
    },
  ) {
    return this.prisma.tenant.update({
      where: { id: tenantId },
      data,
    });
  }

  async listBranches(tenantId: string) {
    return this.prisma.branch.findMany({
      where: { tenantId, deletadoEm: null },
      orderBy: { isMatriz: 'desc' },
    });
  }

  async createBranch(
    tenantId: string,
    data: {
      nome: string;
      codigo?: string;
      cnpj?: string;
      cidade: string;
      uf: string;
      isMatriz?: boolean;
    },
  ) {
    return this.prisma.branch.create({
      data: {
        tenantId,
        ...data,
      },
    });
  }
}
