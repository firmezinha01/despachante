import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import * as QRCode from 'qrcode';

@Injectable()
export class PixService {
  constructor(private prisma: PrismaService) {}

  async createCharge(
    tenantId: string,
    data: {
      valor: number;
      processId?: string;
      transactionId?: string;
      chavePix?: string;
      descricao?: string;
    },
  ) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
    const chavePix = data.chavePix || tenant?.email || 'financeiro@despachante.com.br';
    const txid = `PIX${Date.now()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // Monta payload EMVCo padronizado pelo BACEN
    const copiaECola = this.generateEmvCoPayload({
      chave: chavePix,
      nomeRecebedor: tenant?.nomeFantasia || 'DESPACHANTE ERP',
      cidadeRecebedor: tenant?.cidade || 'SAO PAULO',
      valor: data.valor,
      txid,
      descricao: data.descricao || 'Taxas e Honorarios de Despachante',
    });

    // Gera imagem QR Code em Base64
    const qrCodeBase64 = await QRCode.toDataURL(copiaECola, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 320,
    });

    const expiraEm = new Date(Date.now() + 2 * 3600 * 1000); // 2 horas

    const pixCharge = await this.prisma.pixCharge.create({
      data: {
        txid,
        valor: data.valor,
        chavePix,
        copiaECola,
        qrCodeBase64,
        status: 'PENDENTE',
        expiraEm,
        processId: data.processId,
        transactionId: data.transactionId,
      },
    });

    return pixCharge;
  }

  async getChargeByTxid(txid: string) {
    const charge = await this.prisma.pixCharge.findUnique({
      where: { txid },
      include: {
        process: {
          select: {
            protocolo: true,
            status: true,
            tipoServico: true,
          },
        },
      },
    });

    if (!charge) {
      throw new NotFoundException('Cobrança PIX não encontrada.');
    }

    return charge;
  }

  async handleWebhookNotification(payload: { txid: string; endToEndId?: string; valor?: number }) {
    const charge = await this.prisma.pixCharge.findUnique({
      where: { txid: payload.txid },
    });

    if (!charge) {
      return { sucesso: false, mensagem: 'Cobrança não localizada' };
    }

    const agora = new Date();

    // 1. Atualiza Cobrança PIX
    await this.prisma.pixCharge.update({
      where: { txid: payload.txid },
      data: {
        status: 'CONCLUIDA',
        endToEndId: payload.endToEndId || `E${Date.now()}`,
        pagoEm: agora,
      },
    });

    // 2. Se houver transação vinculada, baixa automaticamente
    if (charge.transactionId) {
      await this.prisma.financialTransaction.update({
        where: { id: charge.transactionId },
        data: {
          status: 'PAGO',
          dataPagamento: agora,
        },
      });
    }

    // 3. Se houver processo veicular vinculado, marca como pago
    if (charge.processId) {
      await this.prisma.process.update({
        where: { id: charge.processId },
        data: {
          pago: true,
        },
      });
    }

    return { sucesso: true, mensagem: 'Baixa efetuada com sucesso via PIX.' };
  }

  private generateEmvCoPayload(params: {
    chave: string;
    nomeRecebedor: string;
    cidadeRecebedor: string;
    valor: number;
    txid: string;
    descricao?: string;
  }): string {
    const formatField = (id: string, value: string): string => {
      const len = String(value.length).padStart(2, '0');
      return `${id}${len}${value}`;
    };

    // Formata campos EMVCo
    const payloadFormat = formatField('00', '01');
    const merchantAccountInfo = formatField(
      '26',
      `${formatField('00', 'BR.GOV.BCB.PIX')}${formatField('01', params.chave)}${params.descricao ? formatField('02', params.descricao.slice(0, 40)) : ''}`,
    );
    const merchantCategoryCode = formatField('52', '0000');
    const transactionCurrency = formatField('53', '986'); // BRL
    const transactionAmount = formatField('54', params.valor.toFixed(2));
    const countryCode = formatField('58', 'BR');
    const merchantName = formatField('59', params.nomeRecebedor.substring(0, 25).toUpperCase());
    const merchantCity = formatField('60', params.cidadeRecebedor.substring(0, 15).toUpperCase());
    const additionalDataField = formatField('62', formatField('05', params.txid.substring(0, 25)));

    const rawPayload = `${payloadFormat}${merchantAccountInfo}${merchantCategoryCode}${transactionCurrency}${transactionAmount}${countryCode}${merchantName}${merchantCity}${additionalDataField}6304`;
    const crc = this.calculateCrc16(rawPayload);

    return `${rawPayload}${crc}`;
  }

  private calculateCrc16(str: string): string {
    let crc = 0xffff;
    const strlen = str.length;
    for (let c = 0; c < strlen; c++) {
      crc ^= str.charCodeAt(c) << 8;
      for (let i = 0; i < 8; i++) {
        if (crc & 0x8000) {
          crc = (crc << 1) ^ 0x1021;
        } else {
          crc = crc << 1;
        }
      }
    }
    const hex = (crc & 0xffff).toString(16).toUpperCase();
    return hex.padStart(4, '0');
  }
}
