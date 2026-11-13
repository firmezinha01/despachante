import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async login(email: string, senha: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        tenant: true,
        branch: true,
      },
    });

    if (!user || !user.ativo) {
      throw new UnauthorizedException('Credenciais inválidas ou usuário inativo.');
    }

    const senhaValida = await bcrypt.compare(senha, user.senhaHash);
    if (!senhaValida) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    // Atualiza último acesso
    await this.prisma.user.update({
      where: { id: user.id },
      data: { ultimoAcesso: new Date() },
    });

    const secret = process.env.JWT_SECRET || 'super-secret-despachante-jwt-key-2026';
    const payload = {
      sub: user.id,
      email: user.email,
      nome: user.nome,
      role: user.role,
      tenantId: user.tenantId,
      branchId: user.branchId,
    };

    const token = jwt.sign(payload, secret, { expiresIn: '8h' });
    const refreshToken = jwt.sign(payload, secret, { expiresIn: '7d' });

    return {
      token,
      refreshToken,
      usuario: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        cargo: user.cargo,
        role: user.role,
        branchId: user.branchId,
        filial: user.branch?.nome,
      },
      empresa: {
        id: user.tenant.id,
        razaoSocial: user.tenant.razaoSocial,
        nomeFantasia: user.tenant.nomeFantasia,
        cnpj: user.tenant.cnpj,
        uf: user.tenant.uf,
        corPrimaria: user.tenant.corPrimaria,
      },
    };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        tenant: true,
        branch: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado.');
    }

    return {
      id: user.id,
      nome: user.nome,
      email: user.email,
      cargo: user.cargo,
      role: user.role,
      filial: user.branch?.nome,
      empresa: {
        id: user.tenant.id,
        razaoSocial: user.tenant.razaoSocial,
        nomeFantasia: user.tenant.nomeFantasia,
        cnpj: user.tenant.cnpj,
        uf: user.tenant.uf,
        corPrimaria: user.tenant.corPrimaria,
      },
    };
  }
}
