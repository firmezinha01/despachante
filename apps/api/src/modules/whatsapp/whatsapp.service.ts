import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger(WhatsAppService.name);

  constructor(private prisma: PrismaService) {}

  async listInstances(tenantId: string) {
    return this.prisma.whatsAppInstance.findMany({
      where: { tenantId },
    });
  }

  async createInstance(tenantId: string, nomeInstancia: string) {
    return this.prisma.whatsAppInstance.create({
      data: {
        tenantId,
        nomeInstancia,
        status: 'QRCODE',
        qrCodeBase64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        webhookToken: `wh_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        iaAtiva: true,
      },
    });
  }

  async sendProcessUpdateNotification(
    tenantId: string,
    params: {
      telefone: string;
      clienteNome: string;
      protocolo: string;
      novoStatus: string;
      linkAcompanhamento?: string;
    },
  ) {
    this.logger.log(
      `[WHATSAPP NOTIFICATION] Disparo para ${params.telefone}: "Olá ${params.clienteNome}, seu processo ${params.protocolo} avançou para ${params.novoStatus}."`,
    );

    return {
      sucesso: true,
      mensagemId: `msg_${Date.now()}`,
      status: 'ENVIADO',
      timestamp: new Date().toISOString(),
    };
  }
}
