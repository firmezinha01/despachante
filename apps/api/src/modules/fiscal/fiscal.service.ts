import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

export interface EmitirNfseParams {
  processId?: string;
  clienteNome: string;
  clienteCpfCnpj: string;
  clienteEmail: string;
  valorServicos: number; // Apenas honorários!
  valorDeducoesTaxas?: number; // Repasses de taxas de Detran (dedutíveis de ISS)
  discriminacao: string;
  aliquotaIss?: number;
}

@Injectable()
export class FiscalService {
  private readonly logger = new Logger(FiscalService.name);

  constructor(private prisma: PrismaService) {}

  async listDocuments(tenantId: string) {
    return this.prisma.fiscalDocument.findMany({
      where: { tenantId },
      orderBy: { criadoEm: 'desc' },
    });
  }

  async emitirNfse(tenantId: string, params: EmitirNfseParams) {
    this.logger.log(`[MÓDULO FISCAL] Emitindo NFS-e para ${params.clienteNome} (Honorários: R$ ${params.valorServicos})`);

    const aliquota = params.aliquotaIss || 2.5; // Alíquota média ISS de despachante
    const valorIss = Number(((params.valorServicos * aliquota) / 100).toFixed(2));
    const numero = Math.floor(1000 + Math.random() * 9000);
    const chaveAcesso = `NFSE${Date.now()}${numero}`;
    const protocolo = `PROT-PREF-${Date.now()}`;

    // Registra documento fiscal emitido
    const doc = await this.prisma.fiscalDocument.create({
      data: {
        tenantId,
        tipoDocumento: 'NFSE',
        status: 'AUTORIZADO',
        numero,
        serie: 'E',
        chaveAcesso,
        protocoloAutorizacao: protocolo,
        valorServicos: params.valorServicos,
        valorDeducoes: params.valorDeducoesTaxas || 0,
        aliquotaIss: aliquota,
        valorIss,
        emitidoEm: new Date(),
        pdfDanfeUrl: `https://nfe.prefeitura.sp.gov.br/visualizar/${chaveAcesso}.pdf`,
        xmlAssinado: `<xml><nfse><numero>${numero}</numero><prestador>${tenantId}</prestador><tomador>${params.clienteNome}</tomador><valor>${params.valorServicos}</valor><iss>${valorIss}</iss></nfse></xml>`,
      },
    });

    return doc;
  }

  async cancelarDocumento(tenantId: string, id: string, motivo: string) {
    return this.prisma.fiscalDocument.update({
      where: { id },
      data: {
        status: 'CANCELADO',
        motivoRejeicao: `Cancelamento homologado: ${motivo}`,
      },
    });
  }
}
