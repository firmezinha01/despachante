import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CustomerType } from '@prisma/client';

@Injectable()
export class CrmService {
  constructor(private prisma: PrismaService) {}

  async listCustomers(tenantId: string, search?: string, tipo?: CustomerType) {
    const where: any = {
      tenantId,
      deletadoEm: null,
    };

    if (tipo) {
      where.tipo = tipo;
    }

    if (search) {
      where.OR = [
        { nome: { contains: search, mode: 'insensitive' } },
        { razaoSocial: { contains: search, mode: 'insensitive' } },
        { cpf: { contains: search } },
        { cnpj: { contains: search } },
        { email: { contains: search, mode: 'insensitive' } },
        { telefone: { contains: search } },
      ];
    }

    return this.prisma.customer.findMany({
      where,
      orderBy: { criadoEm: 'desc' },
      include: {
        _count: {
          select: {
            vehicles: true,
            processes: true,
          },
        },
      },
    });
  }

  async getCustomerById(tenantId: string, id: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id, tenantId, deletadoEm: null },
      include: {
        vehicles: true,
        processes: {
          orderBy: { criadoEm: 'desc' },
          take: 10,
        },
        financialTx: {
          orderBy: { criadoEm: 'desc' },
          take: 10,
        },
      },
    });

    if (!customer) {
      throw new NotFoundException('Cliente não encontrado.');
    }

    return customer;
  }

  async createCustomer(tenantId: string, data: any) {
    return this.prisma.customer.create({
      data: {
        tenantId,
        ...data,
      },
    });
  }

  async updateCustomer(tenantId: string, id: string, data: any) {
    await this.getCustomerById(tenantId, id);
    return this.prisma.customer.update({
      where: { id },
      data,
    });
  }
}
