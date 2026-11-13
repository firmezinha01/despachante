import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class DocumentsService {
  constructor(private prisma: PrismaService) {}

  async listByProcess(tenantId: string, processId: string) {
    return this.prisma.processDocument.findMany({
      where: {
        processId,
        process: { tenantId },
      },
      include: {
        ocr: true,
      },
      orderBy: { criadoEm: 'desc' },
    });
  }

  async attachDocument(
    tenantId: string,
    processId: string,
    data: {
      tipo: string;
      titulo: string;
      nomeArquivo: string;
      tamanhoBytes: number;
      mimeType: string;
      storagePath?: string;
    },
  ) {
    // 1. Cria o registro do documento
    const doc = await this.prisma.processDocument.create({
      data: {
        processId,
        tipo: data.tipo,
        titulo: data.titulo,
        nomeArquivo: data.nomeArquivo,
        tamanhoBytes: data.tamanhoBytes,
        mimeType: data.mimeType,
        storagePath: data.storagePath || `uploads/${tenantId}/${processId}/${data.nomeArquivo}`,
        validado: false,
      },
    });

    // 2. Dispara pipeline de OCR simulado/estruturado
    const ocrData = this.simulateOcrExtraction(data.tipo);
    await this.prisma.documentOcr.create({
      data: {
        documentId: doc.id,
        status: 'PROCESSADO',
        confianca: 0.98,
        dadosJson: ocrData,
        textoBruto: JSON.stringify(ocrData),
        processadoEm: new Date(),
      },
    });

    return this.prisma.processDocument.findUnique({
      where: { id: doc.id },
      include: { ocr: true },
    });
  }

  private simulateOcrExtraction(tipo: string): any {
    switch (tipo) {
      case 'CNH':
        return {
          tipoDocumento: 'Carteira Nacional de Habilitação',
          nome: 'CARLOS EDUARDO OLIVEIRA',
          cpf: '234.567.890-12',
          rg: '34.567.890-X',
          registroCnh: '01234567890',
          categoria: 'AB',
          validade: '15/05/2029',
          orgaoEmissor: 'DETRAN-SP',
        };
      case 'CRLV':
        return {
          tipoDocumento: 'Certificado de Registro e Licenciamento de Veículo',
          placa: 'BRA2E19',
          renavam: '12345678901',
          chassi: '9BRBD48E9K8123456',
          anoExercicio: 2026,
          marcaModelo: 'TOYOTA/COROLLA ALTIS HYBRID',
          combustivel: 'GASOLINA/ELETRICO',
        };
      case 'ATPV':
        return {
          tipoDocumento: 'Autorização para Transferência de Propriedade de Veículo (ATPV-e)',
          placa: 'BRA2E19',
          renavam: '12345678901',
          valorVenda: 'R$ 145.000,00',
          compradorNome: 'CARLOS EDUARDO OLIVEIRA',
          compradorCpf: '234.567.890-12',
          vendedorNome: 'AUTO VEICULOS PAULISTA LTDA',
          statusAssinatura: 'ASSINADO DIGITALMENTE (GOV.BR)',
        };
      default:
        return {
          tipoDocumento: 'Documento Geral',
          textoExtraido: 'Documento veicular analisado e validado com sucesso.',
        };
    }
  }
}
