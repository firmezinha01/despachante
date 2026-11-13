import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class SignaturesService {
  constructor(private prisma: PrismaService) {}

  async createEnvelope(
    tenantId: string,
    processId: string,
    data: {
      signatarioNome: string;
      signatarioCpf: string;
      signatarioEmail: string;
      provedor?: string;
    },
  ) {
    const tokenAssinatura = crypto.randomBytes(24).toString('hex');
    const hashDocumento = crypto.createHash('sha256').update(`${processId}-${Date.now()}`).digest('hex');

    return this.prisma.signatureEnvelope.create({
      data: {
        processId,
        provedor: data.provedor || 'INTERNO_QUALIFICADO',
        signatarioNome: data.signatarioNome,
        signatarioCpf: data.signatarioCpf,
        signatarioEmail: data.signatarioEmail,
        tokenAssinatura,
        hashDocumento,
        status: 'PENDENTE',
      },
    });
  }

  async getEnvelopeByToken(token: string) {
    const envelope = await this.prisma.signatureEnvelope.findUnique({
      where: { tokenAssinatura: token },
      include: {
        process: {
          include: {
            veiculo: true,
            cliente: true,
          },
        },
      },
    });

    if (!envelope) {
      throw new NotFoundException('Envelope de assinatura não encontrado ou expirado.');
    }

    return envelope;
  }

  async signEnvelope(token: string, ipAddress: string) {
    const envelope = await this.getEnvelopeByToken(token);

    return this.prisma.signatureEnvelope.update({
      where: { id: envelope.id },
      data: {
        status: 'ASSINADO',
        assinadoEm: new Date(),
        ipSignatario: ipAddress || '127.0.0.1',
      },
    });
  }
}
