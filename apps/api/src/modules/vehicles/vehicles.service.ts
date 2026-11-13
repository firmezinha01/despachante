import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class VehiclesService {
  constructor(private prisma: PrismaService) {}

  async listVehicles(tenantId: string, search?: string, clienteId?: string) {
    const where: any = {
      tenantId,
      deletadoEm: null,
    };

    if (clienteId) {
      where.clienteId = clienteId;
    }

    if (search) {
      const cleanSearch = search.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
      where.OR = [
        { placa: { contains: cleanSearch, mode: 'insensitive' } },
        { renavam: { contains: cleanSearch } },
        { chassi: { contains: cleanSearch, mode: 'insensitive' } },
        { modelo: { contains: search, mode: 'insensitive' } },
        { marca: { contains: search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.vehicle.findMany({
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
          },
        },
        restrictions: {
          where: { ativo: true },
        },
        _count: {
          select: {
            processes: true,
          },
        },
      },
    });
  }

  async getVehicleById(tenantId: string, id: string) {
    const vehicle = await this.prisma.vehicle.findFirst({
      where: { id, tenantId, deletadoEm: null },
      include: {
        cliente: true,
        restrictions: true,
        processes: {
          orderBy: { criadoEm: 'desc' },
        },
      },
    });

    if (!vehicle) {
      throw new NotFoundException('Veículo não encontrado.');
    }

    return vehicle;
  }

  async getVehicleByPlaca(tenantId: string, placa: string) {
    const cleanPlaca = placa.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    return this.prisma.vehicle.findFirst({
      where: {
        tenantId,
        placa: cleanPlaca,
        deletadoEm: null,
      },
      include: {
        cliente: true,
        restrictions: true,
      },
    });
  }

  async createVehicle(tenantId: string, data: any) {
    const cleanPlaca = data.placa ? data.placa.replace(/[^a-zA-Z0-9]/g, '').toUpperCase() : '';
    const cleanRenavam = data.renavam ? data.renavam.replace(/\D/g, '') : '';
    const cleanChassi = data.chassi ? data.chassi.toUpperCase() : '';

    return this.prisma.vehicle.create({
      data: {
        tenantId,
        ...data,
        placa: cleanPlaca,
        renavam: cleanRenavam,
        chassi: cleanChassi,
      },
    });
  }

  async addRestriction(tenantId: string, vehicleId: string, data: { tipo: string; descricao: string; orgao?: string }) {
    await this.getVehicleById(tenantId, vehicleId);
    return this.prisma.vehicleRestriction.create({
      data: {
        vehicleId,
        ...data,
      },
    });
  }
}
