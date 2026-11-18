'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import {
  KanbanSquare,
  List,
  Search,
  Plus,
  Car,
  QrCode,
  Check,
  X,
  Copy,
} from 'lucide-react';
import { formatBrl } from '@/lib/utils';

interface ProcessItem {
  id: string;
  protocolo: string;
  tipoServico: string;
  placa: string;
  modelo: string;
  clienteNome: string;
  status: string;
  prioridade: string;
  prazoSla: string;
  valorHonorarios: number;
  valorTaxas: number;
  valorTotal: number;
  pago: boolean;
  protocoloDetran?: string;
  checklists: { id: string; descricao: string; obrigatorio: boolean; concluido: boolean }[];
  documents: { id: string; titulo: string; tipo: string; ocr?: any }[];
}

const initialProcesses: ProcessItem[] = [
  {
    id: '1',
    protocolo: 'PROC-2026-0001',
    tipoServico: 'Transferência de Propriedade',
    placa: 'BRA2E19',
    modelo: 'TOYOTA COROLLA ALTIS HYBRID 2024',
    clienteNome: 'Carlos Eduardo Oliveira',
    status: 'PROTOCOLO_DETRAN',
    prioridade: 'ALTA',
    prazoSla: '15/11/2026',
    valorHonorarios: 350.00,
    valorTaxas: 425.50,
    valorTotal: 775.50,
    pago: true,
    protocoloDetran: 'SP-DETRAN-2026-9812451',
    checklists: [
      { id: 'c1', descricao: 'Laudo de Vistoria ECV Aprovado', obrigatorio: true, concluido: true },
      { id: 'c2', descricao: 'Validação da ATPV-e assinada via Gov.br', obrigatorio: true, concluido: true },
      { id: 'c3', descricao: 'Certidão Negativa de Débitos e Multas', obrigatorio: true, concluido: true },
      { id: 'c4', descricao: 'Taxa de Transferência DETRAN-SP paga', obrigatorio: true, concluido: true },
      { id: 'c5', descricao: 'Emissão e Entrega do CRLV-e Digital Final', obrigatorio: true, concluido: false },
    ],
    documents: [
      {
        id: 'd1',
        titulo: 'ATPV-e Assinada Gov.br',
        tipo: 'ATPV',
        ocr: { placa: 'BRA2E19', renavam: '12345678901', valorVenda: 'R$ 145.000,00' },
      },
      {
        id: 'd2',
        titulo: 'CNH do Comprador',
        tipo: 'CNH',
        ocr: { nome: 'CARLOS EDUARDO OLIVEIRA', cpf: '234.567.890-12', validade: '15/05/2029' },
      },
    ],
  },
  {
    id: '2',
    protocolo: 'PROC-2026-0002',
    tipoServico: 'Licenciamento Anual (CRLV-e)',
    placa: 'ABC1D23',
    modelo: 'CHEVROLET ONIX PLUS 2024',
    clienteNome: 'Brasil Rent a Car e Frotas S/A',
    status: 'PAGAMENTO_TAXAS',
    prioridade: 'NORMAL',
    prazoSla: '12/11/2026',
    valorHonorarios: 120.00,
    valorTaxas: 160.22,
    valorTotal: 280.22,
    pago: false,
    checklists: [
      { id: 'c21', descricao: 'Consulta de débitos de IPVA e Multas', obrigatorio: true, concluido: true },
      { id: 'c22', descricao: 'Pagamento da Taxa de Licenciamento Anual', obrigatorio: true, concluido: false },
      { id: 'c23', descricao: 'Emissão do CRLV-e atualizado no SENATRAN', obrigatorio: true, concluido: false },
    ],
    documents: [
      {
        id: 'd21',
        titulo: 'CRLV Exercício Anterior',
        tipo: 'CRLV',
        ocr: { placa: 'ABC1D23', renavam: '98765432100' },
      },
    ],
  },
  {
    id: '3',
    protocolo: 'PROC-2026-0003',
    tipoServico: 'Primeiro Emplacamento (0km)',
    placa: 'XYZ9876',
    modelo: 'VOLKSWAGEN POLO TRACK 2024',
    clienteNome: 'Mariana Duarte Souza',
    status: 'TRIAGEM',
    prioridade: 'NORMAL',
    prazoSla: '18/11/2026',
    valorHonorarios: 400.00,
    valorTaxas: 380.00,
    valorTotal: 780.00,
    pago: false,
    checklists: [
      { id: 'c31', descricao: 'Nota Fiscal da Concessionária (DANFE)', obrigatorio: true, concluido: true },
      { id: 'c32', descricao: 'Decalque de Chassi e Motor', obrigatorio: true, concluido: false },
      { id: 'c33', descricao: 'Guia IPVA Proporcional paga', obrigatorio: true, concluido: false },
      { id: 'c34', descricao: 'Autorização de Estampagem de Placa Mercosul', obrigatorio: true, concluido: false },
    ],
    documents: [],
  },
];

const COLUMNS = [
  { id: 'TRIAGEM', title: 'Triagem', color: 'border-t-blue-500' },
  { id: 'VISTORIA', title: 'Vistoria', color: 'border-t-indigo-500' },
  { id: 'COLETA_DOCUMENTOS', title: 'Documentos', color: 'border-t-violet-500' },
  { id: 'PAGAMENTO_TAXAS', title: 'Taxas', color: 'border-t-amber-500' },
  { id: 'PROTOCOLO_DETRAN', title: 'Protocolo', color: 'border-t-purple-600' },
  { id: 'EMISSAO', title: 'Emissão', color: 'border-t-emerald-500' },
];

export default function ProcessosPage() {
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [processes, setProcesses] = useState<ProcessItem[]>(initialProcesses);
  const [selectedProcess, setSelectedProcess] = useState<ProcessItem | null>(null);
  const [copiedPix, setCopiedPix] = useState(false);

  const handleToggleChecklist = (checkId: string) => {
    if (!selectedProcess) return;
    const updatedChecklists = selectedProcess.checklists.map((c) =>
      c.id === checkId ? { ...c, concluido: !c.concluido } : c,
    );
    const updatedProc = { ...selectedProcess, checklists: updatedChecklists };
    setSelectedProcess(updatedProc);
    setProcesses((prev) => prev.map((p) => (p.id === updatedProc.id ? updatedProc : p)));
  };

  const handleAdvanceStage = (novoStatus: string) => {
    if (!selectedProcess) return;
    const updatedProc = { ...selectedProcess, status: novoStatus };
    setSelectedProcess(updatedProc);
    setProcesses((prev) => prev.map((p) => (p.id === updatedProc.id ? updatedProc : p)));
  };

  const pixPayloadSample =
    '00020101021226840014br.gov.bcb.pix2562pix-qr.despachantecentral.com.br/qr/v2/cobv/77995204000053039865406280.225802BR5925DESPACHANTE CENTRAL BRASI6009SAO PAULO62070503***63041D9A';

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixPayloadSample);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2000);
  };

  return (
    <AppLayout>
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Esteira de Processos Veiculares
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Motor de workflow com validação documental e checklist obrigatório.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* View Switcher */}
          <div className="flex items-center rounded-xl border border-slate-200 bg-white p-1 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <button
              onClick={() => setViewMode('kanban')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 sm:px-3 py-1.5 text-xs font-semibold transition ${
                viewMode === 'kanban'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-purple-600 dark:text-slate-300'
              }`}
            >
              <KanbanSquare className="h-3.5 w-3.5" />
              Kanban
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 sm:px-3 py-1.5 text-xs font-semibold transition ${
                viewMode === 'list'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-purple-600 dark:text-slate-300'
              }`}
            >
              <List className="h-3.5 w-3.5" />
              Tabela
            </button>
          </div>

          <button
            onClick={() => setSelectedProcess(processes[0])}
            className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-purple-600/30 transition hover:bg-purple-700"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden xs:inline sm:inline">Novo Processo</span>
          </button>
        </div>
      </div>

      {/* Kanban Board View with horizontal touch swipe */}
      {viewMode === 'kanban' ? (
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory lg:grid lg:grid-cols-6 lg:overflow-visible">
          {COLUMNS.map((col) => {
            const colProcesses = processes.filter((p) => p.status === col.id);
            return (
              <div
                key={col.id}
                className={`flex flex-col min-w-[260px] sm:min-w-[280px] lg:min-w-0 snap-center rounded-2xl border border-slate-200 bg-slate-100/70 p-3 dark:border-slate-800 dark:bg-slate-900/60 border-t-4 ${col.color}`}
              >
                <div className="flex items-center justify-between pb-3 px-1">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    {col.title}
                  </span>
                  <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-extrabold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    {colProcesses.length}
                  </span>
                </div>

                <div className="flex-1 space-y-3">
                  {colProcesses.map((proc) => (
                    <div
                      key={proc.id}
                      onClick={() => setSelectedProcess(proc)}
                      className="cursor-pointer rounded-xl border border-slate-200 bg-white p-3.5 sm:p-4 shadow-sm transition hover:border-purple-400 hover:shadow-md dark:border-slate-800 dark:bg-slate-950 dark:hover:border-purple-600"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-purple-600 dark:text-purple-400">
                          {proc.protocolo}
                        </span>
                        <span className="rounded bg-slate-900 px-1.5 py-0.5 font-mono text-[10px] font-bold text-white">
                          {proc.placa}
                        </span>
                      </div>

                      <p className="mt-2 text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                        {proc.tipoServico}
                      </p>

                      <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                        {proc.clienteNome}
                      </p>

                      {/* Checklist Progress */}
                      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-2">
                        <span>
                          Checklist:{' '}
                          <strong className="text-purple-600 dark:text-purple-400">
                            {proc.checklists.filter((c) => c.concluido).length}/
                            {proc.checklists.length}
                          </strong>
                        </span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">
                          {formatBrl(proc.valorTotal)}
                        </span>
                      </div>
                    </div>
                  ))}

                  {colProcesses.length === 0 && (
                    <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-400 dark:border-slate-800">
                      Nenhum processo
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List Table View */
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden dark:border-slate-800 dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm min-w-[700px]">
              <thead className="bg-slate-50 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:bg-slate-950/80 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 sm:px-6 py-3">Protocolo</th>
                  <th className="px-4 sm:px-6 py-3">Placa / Modelo</th>
                  <th className="px-4 sm:px-6 py-3">Cliente</th>
                  <th className="px-4 sm:px-6 py-3">Serviço</th>
                  <th className="px-4 sm:px-6 py-3">Status</th>
                  <th className="px-4 sm:px-6 py-3 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {processes.map((proc) => (
                  <tr
                    key={proc.id}
                    onClick={() => setSelectedProcess(proc)}
                    className="cursor-pointer hover:bg-purple-50/40 dark:hover:bg-purple-950/20 transition"
                  >
                    <td className="px-4 sm:px-6 py-3.5 font-mono font-bold text-xs text-purple-600 dark:text-purple-400">
                      {proc.protocolo}
                    </td>
                    <td className="px-4 sm:px-6 py-3.5">
                      <span className="rounded bg-slate-900 px-1.5 py-0.5 font-mono text-[11px] font-bold text-white mr-2">
                        {proc.placa}
                      </span>
                      <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                        {proc.modelo}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-3.5 text-xs font-medium text-slate-900 dark:text-white">
                      {proc.clienteNome}
                    </td>
                    <td className="px-4 sm:px-6 py-3.5 text-xs text-slate-600 dark:text-slate-300">
                      {proc.tipoServico}
                    </td>
                    <td className="px-4 sm:px-6 py-3.5">
                      <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[11px] font-semibold text-purple-800 dark:bg-purple-950/60 dark:text-purple-300">
                        {proc.status}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-3.5 text-right font-bold text-purple-600">
                      Abrir
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detailed Process Drawer / Modal - Fully Mobile Optimized */}
      {selectedProcess && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-950/70 backdrop-blur-sm p-0 sm:p-4">
          <div className="h-full w-full sm:max-w-xl bg-white shadow-2xl dark:bg-slate-900 flex flex-col overflow-hidden sm:rounded-2xl animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-slate-200 p-4 sm:p-6 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs sm:text-sm font-black text-purple-600 dark:text-purple-400">
                    {selectedProcess.protocolo}
                  </span>
                  <span className="rounded bg-slate-900 px-1.5 py-0.5 font-mono text-[10px] sm:text-xs font-bold text-white">
                    {selectedProcess.placa}
                  </span>
                </div>
                <h2 className="mt-1 text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
                  {selectedProcess.tipoServico}
                </h2>
              </div>
              <button
                onClick={() => setSelectedProcess(null)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 shrink-0"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
              {/* Status & Advancement */}
              <div className="rounded-xl border border-purple-200 bg-purple-50/60 p-3.5 sm:p-4 dark:border-purple-900/40 dark:bg-purple-950/30 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-medium text-purple-700 dark:text-purple-300">
                    Etapa Atual:
                  </span>
                  <p className="text-sm sm:text-base font-black text-purple-900 dark:text-purple-200">
                    {selectedProcess.status}
                  </p>
                </div>
                <button
                  onClick={() => handleAdvanceStage('EMISSAO')}
                  className="rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-purple-700"
                >
                  Avançar
                </button>
              </div>

              {/* Checklist */}
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mb-2.5">
                  Checklist de Validação Documental
                </h3>
                <div className="space-y-2">
                  {selectedProcess.checklists.map((chk) => (
                    <div
                      key={chk.id}
                      onClick={() => handleToggleChecklist(chk.id)}
                      className="flex items-center gap-2.5 rounded-xl border border-slate-200 p-2.5 sm:p-3 hover:bg-slate-50 cursor-pointer dark:border-slate-800 dark:hover:bg-slate-950 transition"
                    >
                      <div
                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                          chk.concluido
                            ? 'bg-purple-600 border-purple-600 text-white'
                            : 'border-slate-300 dark:border-slate-700'
                        }`}
                      >
                        {chk.concluido && <Check className="h-3 w-3" />}
                      </div>
                      <span
                        className={`flex-1 text-xs font-medium leading-snug ${
                          chk.concluido
                            ? 'line-through text-slate-400 dark:text-slate-500'
                            : 'text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        {chk.descricao}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* PIX Instant Payment */}
              <div className="rounded-2xl border border-purple-200 bg-white p-4 sm:p-5 shadow-sm dark:border-purple-900/40 dark:bg-slate-950 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    Cobrança Instantânea PIX
                  </h4>
                  <span className="text-xs sm:text-sm font-black text-purple-600 dark:text-purple-400">
                    {formatBrl(selectedProcess.valorTotal)}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="h-20 w-20 rounded-lg bg-white p-1 border border-slate-200 shadow-sm flex flex-col items-center justify-center shrink-0">
                    <QrCode className="h-16 w-16 text-slate-900" />
                  </div>
                  <div className="flex-1 space-y-2 text-center sm:text-left w-full">
                    <button
                      onClick={handleCopyPix}
                      className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg border border-purple-300 bg-purple-50 px-3 py-1.5 text-xs font-semibold text-purple-700 hover:bg-purple-100 dark:border-purple-800 dark:bg-purple-950/60 dark:text-purple-300"
                    >
                      {copiedPix ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      {copiedPix ? 'Copiado!' : 'Copiar Chave PIX'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
