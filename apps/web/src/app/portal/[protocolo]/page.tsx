'use client';

import { useState, use } from 'react';
import {
  CheckCircle2,
  Clock,
  QrCode,
  Copy,
  Check,
  UploadCloud,
  FileText,
  ShieldCheck,
  MessageCircle,
  HelpCircle,
  Phone,
  Car,
} from 'lucide-react';
import { formatBrl } from '@/lib/utils';

export default function PortalClientePage({ params }: { params: Promise<{ protocolo: string }> }) {
  const resolvedParams = use(params);
  const [copied, setCopied] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>(['CNH_Digital_Frente_Verso.pdf']);

  const processData = {
    protocolo: 'PROC-2026-0001',
    tipoServico: 'Transferência de Propriedade Veicular',
    status: 'PROTOCOLO_DETRAN',
    statusAmigavel: 'Em Análise pelo DETRAN-SP',
    despachanteNome: 'Despachante Central Brasil',
    telefoneContato: '(11) 98765-4321',
    veiculo: {
      placa: 'BRA2E19',
      modelo: 'TOYOTA COROLLA ALTIS HYBRID 2024',
      cor: 'Cinza Celestial',
    },
    taxas: {
      honorarios: 350.00,
      taxasDetran: 425.50,
      total: 775.50,
      pago: false,
    },
    timeline: [
      { titulo: 'Abertura & Triagem', status: 'concluido', data: '10/11/2026 09:30' },
      { titulo: 'Vistoria ECV Aprovada', status: 'concluido', data: '11/11/2026 14:15' },
      { titulo: 'Assinatura ATPV-e Validada', status: 'concluido', data: '11/11/2026 16:40' },
      { titulo: 'Protocolo e Auditoria no DETRAN', status: 'atual', data: '12/11/2026 11:00' },
      { titulo: 'Emissão do CRLV-e Digital Final', status: 'pendente', data: 'Previsão: 15/11/2026' },
    ],
  };

  const pixSample =
    '00020101021226840014br.gov.bcb.pix2562pix-qr.despachantecentral.com.br/qr/v2/cobv/77995204000053039865406280.225802BR5925DESPACHANTE CENTRAL BRASI6009SAO PAULO62070503***63041D9A';

  const handleCopy = () => {
    navigator.clipboard.writeText(pixSample);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100 pb-12">
      {/* Client Header */}
      <header className="border-b border-purple-900/30 bg-gradient-to-r from-purple-950 to-slate-950 text-white p-6 shadow-md">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600 font-black text-white shadow-lg shadow-purple-600/40">
              BR
            </div>
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-purple-300">
                PORTAL DO CLIENTE
              </span>
              <h1 className="text-sm font-extrabold">{processData.despachanteNome}</h1>
            </div>
          </div>
          <a
            href={`https://wa.me/5511987654321`}
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition"
          >
            <MessageCircle className="h-4 w-4" />
            Suporte WhatsApp
          </a>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 mt-6 space-y-6">
        {/* Process Status Hero Card */}
        <div className="rounded-2xl border border-purple-200 bg-white p-6 shadow-sm dark:border-purple-900/40 dark:bg-slate-900 space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold text-purple-600 dark:text-purple-400">
              Protocolo: {processData.protocolo}
            </span>
            <span className="rounded bg-slate-900 px-2 py-0.5 font-mono text-xs font-bold text-white">
              {processData.veiculo.placa}
            </span>
          </div>

          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              {processData.tipoServico}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Veículo: {processData.veiculo.modelo} ({processData.veiculo.cor})
            </p>
          </div>

          <div className="rounded-xl border border-purple-200 bg-purple-50 p-4 dark:border-purple-900/50 dark:bg-purple-950/40 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-600 text-white animate-pulse">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300">
                Status Atual do Processo
              </span>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {processData.statusAmigavel}
              </p>
            </div>
          </div>
        </div>

        {/* Interactive Timeline */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
            Linha do Tempo do Atendimento
          </h3>

          <div className="space-y-4 border-l-2 border-purple-200 dark:border-purple-900/60 ml-3 pl-4">
            {processData.timeline.map((step, idx) => (
              <div key={idx} className="relative">
                <span
                  className={`absolute -left-[23px] top-1 flex h-3.5 w-3.5 rounded-full border-2 ${
                    step.status === 'concluido'
                      ? 'border-purple-600 bg-purple-600'
                      : step.status === 'atual'
                      ? 'border-purple-600 bg-white animate-ping'
                      : 'border-slate-300 bg-white dark:border-slate-700'
                  }`}
                />
                <h4
                  className={`text-xs font-bold ${
                    step.status === 'concluido'
                      ? 'text-purple-700 dark:text-purple-300'
                      : step.status === 'atual'
                      ? 'text-slate-900 dark:text-white'
                      : 'text-slate-400'
                  }`}
                >
                  {step.titulo}
                </h4>
                <p className="text-[11px] text-slate-400">{step.data}</p>
              </div>
            ))}
          </div>
        </div>

        {/* PIX Instant Payment Box */}
        <div className="rounded-2xl border border-purple-200 bg-gradient-to-br from-white to-purple-50/60 p-6 shadow-sm dark:border-purple-900/40 dark:from-slate-900 dark:to-purple-950/20 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Pagamento de Honorários & Taxas DETRAN
              </h3>
              <p className="text-xs text-slate-500">
                Pague com PIX para liberação e protocolo imediato no órgão.
              </p>
            </div>
            <span className="text-lg font-black text-purple-600 dark:text-purple-400">
              {formatBrl(processData.taxas.total)}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="flex h-28 w-28 items-center justify-center rounded-xl bg-slate-50 border border-slate-200 p-2">
              <QrCode className="h-24 w-24 text-slate-900 dark:text-slate-100" />
            </div>
            <div className="flex-1 space-y-2 text-center sm:text-left">
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Abra o aplicativo do seu banco, escolha <strong>Pagar com PIX</strong> e aponte a câmera ou use o código Copia e Cola.
              </p>
              <button
                onClick={handleCopy}
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-purple-600/30 hover:bg-purple-700 transition"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Código PIX Copiado!' : 'Copiar Chave PIX'}
              </button>
            </div>
          </div>
        </div>

        {/* Document Upload Section */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Envio de Documentos Pendentes
          </h3>
          <p className="text-xs text-slate-500">
            Envie fotos legíveis ou PDFs (CNH, Comprovante de Endereço, Procuração).
          </p>

          <div className="rounded-xl border-2 border-dashed border-purple-300 bg-purple-50/40 p-6 text-center dark:border-purple-900 dark:bg-purple-950/20">
            <UploadCloud className="mx-auto h-8 w-8 text-purple-600 dark:text-purple-400" />
            <p className="mt-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
              Clique para selecionar ou arraste o arquivo aqui
            </p>
            <p className="text-[10px] text-slate-400">PDF, PNG, JPG até 10MB</p>
          </div>

          <div className="space-y-2">
            {uploadedFiles.map((f, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg border border-slate-200 p-2.5 text-xs font-medium dark:border-slate-800"
              >
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-purple-600" />
                  <span>{f}</span>
                </div>
                <span className="text-[10px] text-emerald-600 font-bold">Enviado</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
