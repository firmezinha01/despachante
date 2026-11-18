'use client';

import { useState, useEffect } from 'react';
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
  AlertCircle,
} from 'lucide-react';
import { formatBrl } from '@/lib/utils';
import { fetchApi } from '@/lib/api-client';

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
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [copiedPix, setCopiedPix] = useState(false);

  // Auxiliares para o formulário de novo processo
  const [dbCustomers, setDbCustomers] = useState<any[]>([]);
  const [dbVehicles, setDbVehicles] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    tipoServico: 'TRANSFERENCIA',
    prioridade: 'NORMAL',
    clienteId: '',
    veiculoId: '',
    valorHonorarios: '350.00',
    valorTaxas: '265.28',
  });

  const loadData = () => {
    fetchApi('/processes')
      .then((data) => {
        if (data && Array.isArray(data) && data.length > 0) {
          const mapped: ProcessItem[] = data.map((p: any) => ({
            id: p.id,
            protocolo: p.protocolo,
            tipoServico: p.tipoServico,
            placa: p.veiculo?.placa || p.vehicle?.placa || 'SEM PLACA',
            modelo: p.veiculo?.modelo ? `${p.veiculo.marca} ${p.veiculo.modelo}` : 'MODELO IDENTIFICADO',
            clienteNome: p.cliente?.nome || p.cliente?.razaoSocial || 'Cliente Registrado',
            status: p.status,
            prioridade: p.prioridade || 'NORMAL',
            prazoSla: p.prazoSla ? new Date(p.prazoSla).toLocaleDateString('pt-BR') : '15/12/2026',
            valorHonorarios: Number(p.valorHonorarios) || 0,
            valorTaxas: Number(p.valorTaxas) || 0,
            valorTotal: Number(p.valorTotal) || 0,
            pago: p.pago || false,
            protocoloDetran: p.protocoloDetran,
            checklists: p.checklists?.map((c: any) => ({
              id: c.id,
              descricao: c.descricao,
              obrigatorio: c.obrigatorio,
              concluido: c.concluido,
            })) || [],
            documents: p.documents?.map((d: any) => ({
              id: d.id,
              titulo: d.nomeArquivo || 'Documento Oficial',
              tipo: d.tipo,
              ocr: d.ocrData,
            })) || [],
          }));
          setProcesses(mapped);
        }
      })
      .catch((err) => console.warn('Usando dados de processos:', err));

    fetchApi('/crm/customers')
      .then((data) => {
        if (data && Array.isArray(data)) {
          setDbCustomers(data);
          if (data.length > 0) setFormData((prev) => ({ ...prev, clienteId: data[0].id }));
        }
      })
      .catch(() => {});

    fetchApi('/vehicles')
      .then((data) => {
        if (data && Array.isArray(data)) {
          setDbVehicles(data);
          if (data.length > 0) setFormData((prev) => ({ ...prev, veiculoId: data[0].id }));
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateProcess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clienteId || !formData.veiculoId) {
      setFormError('Selecione um cliente e um veículo cadastrados.');
      return;
    }

    setSubmitting(true);
    setFormError(null);

    try {
      await fetchApi('/processes', {
        method: 'POST',
        body: JSON.stringify({
          tipoServico: formData.tipoServico,
          prioridade: formData.prioridade,
          clienteId: formData.clienteId,
          veiculoId: formData.veiculoId,
          valorHonorarios: parseFloat(formData.valorHonorarios) || 350,
          valorTaxas: parseFloat(formData.valorTaxas) || 265.28,
        }),
      });

      setIsNewModalOpen(false);
      loadData();
    } catch (err: any) {
      setFormError(err.message || 'Falha ao criar processo.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleChecklist = async (checkId: string) => {
    if (!selectedProcess) return;
    const target = selectedProcess.checklists.find((c) => c.id === checkId);
    if (!target) return;
    const novoConcluido = !target.concluido;

    const updatedChecklists = selectedProcess.checklists.map((c) =>
      c.id === checkId ? { ...c, concluido: novoConcluido } : c,
    );
    const updatedProc = { ...selectedProcess, checklists: updatedChecklists };
    setSelectedProcess(updatedProc);
    setProcesses((prev) => prev.map((p) => (p.id === updatedProc.id ? updatedProc : p)));

    try {
      await fetchApi(`/processes/${selectedProcess.id}/checklist/${checkId}`, {
        method: 'PUT',
        body: JSON.stringify({ concluido: novoConcluido }),
      });
    } catch (e) {
      console.warn('Erro ao sincronizar checklist:', e);
    }
  };

  const handleAdvanceStage = async (novoStatus: string) => {
    if (!selectedProcess) return;
    const updatedProc = { ...selectedProcess, status: novoStatus };
    setSelectedProcess(updatedProc);
    setProcesses((prev) => prev.map((p) => (p.id === updatedProc.id ? updatedProc : p)));

    try {
      await fetchApi(`/processes/${selectedProcess.id}/stage`, {
        method: 'PUT',
        body: JSON.stringify({ novoStatus }),
      });
    } catch (e) {
      console.warn('Erro ao sincronizar etapa:', e);
    }
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
            Motor de workflow com validação documental, checklist obrigatório e persistência no banco.
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
            onClick={() => setIsNewModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-purple-600/30 transition hover:bg-purple-700"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden xs:inline sm:inline">Novo Processo</span>
          </button>
        </div>
      </div>

      {/* Kanban Board View */}
      {viewMode === 'kanban' ? (
        <div className="overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="grid grid-flow-col auto-cols-[280px] sm:auto-cols-[300px] lg:grid-cols-6 gap-4 min-w-max lg:min-w-0">
            {COLUMNS.map((col) => {
              const colProcesses = processes.filter((p) => p.status === col.id);
              return (
                <div
                  key={col.id}
                  className="flex flex-col rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-900/40"
                >
                  <div
                    className={`flex items-center justify-between border-t-4 ${col.color} bg-white px-3 py-2.5 rounded-xl shadow-xs dark:bg-slate-900 mb-3`}
                  >
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {col.title}
                    </span>
                    <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[11px] font-black text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                      {colProcesses.length}
                    </span>
                  </div>

                  <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[calc(100vh-260px)]">
                    {colProcesses.map((proc) => (
                      <div
                        key={proc.id}
                        onClick={() => setSelectedProcess(proc)}
                        className="cursor-pointer rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm transition hover:border-purple-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 space-y-2.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[11px] font-bold text-purple-600 dark:text-purple-400">
                            {proc.protocolo}
                          </span>
                          <span className="rounded bg-slate-900 px-1.5 py-0.5 font-mono text-[10px] font-bold text-white">
                            {proc.placa}
                          </span>
                        </div>

                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                            {proc.tipoServico}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate">{proc.clienteNome}</p>
                        </div>

                        <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-2 text-[11px]">
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {formatBrl(proc.valorTotal)}
                          </span>
                          <span
                            className={`rounded px-1.5 py-0.5 text-[9px] font-extrabold ${
                              proc.pago
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            }`}
                          >
                            {proc.pago ? 'PAGO' : 'PENDENTE'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* List Table View */
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="border-b border-slate-100 bg-slate-50/75 dark:border-slate-800 dark:bg-slate-950">
              <tr>
                <th className="p-3 sm:p-4 font-bold text-slate-500">Protocolo</th>
                <th className="p-3 sm:p-4 font-bold text-slate-500">Placa</th>
                <th className="p-3 sm:p-4 font-bold text-slate-500">Serviço</th>
                <th className="p-3 sm:p-4 font-bold text-slate-500">Cliente</th>
                <th className="p-3 sm:p-4 font-bold text-slate-500">Status</th>
                <th className="p-3 sm:p-4 font-bold text-slate-500">Valor Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {processes.map((p) => (
                <tr
                  key={p.id}
                  onClick={() => setSelectedProcess(p)}
                  className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-950/40 transition"
                >
                  <td className="p-3 sm:p-4 font-mono font-bold text-purple-600">{p.protocolo}</td>
                  <td className="p-3 sm:p-4 font-mono font-bold">{p.placa}</td>
                  <td className="p-3 sm:p-4 font-medium">{p.tipoServico}</td>
                  <td className="p-3 sm:p-4 text-slate-500">{p.clienteNome}</td>
                  <td className="p-3 sm:p-4">
                    <span className="rounded bg-purple-100 px-2 py-0.5 text-xs font-bold text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                      {p.status}
                    </span>
                  </td>
                  <td className="p-3 sm:p-4 font-bold">{formatBrl(p.valorTotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Novo Processo */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="h-5 w-5 text-purple-600" />
                Abrir Novo Processo Veicular
              </h3>
              <button
                onClick={() => setIsNewModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {formError && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-800 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateProcess} className="space-y-3.5 text-xs sm:text-sm">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                  Tipo de Serviço Veicular
                </label>
                <select
                  value={formData.tipoServico}
                  onChange={(e) => setFormData({ ...formData, tipoServico: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-600 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                >
                  <option value="TRANSFERENCIA">Transferência de Propriedade</option>
                  <option value="LICENCIAMENTO">Licenciamento Anual (CRLV-e)</option>
                  <option value="PRIMEIRO_EMPLACAMENTO">Primeiro Emplacamento (0km)</option>
                  <option value="SEGUNDA_VIA_CRLV">2ª Via de Documento</option>
                  <option value="ALTERACAO_CARACTERISTICA">Alteração de Características / GNV</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                    Cliente Proprietário
                  </label>
                  <select
                    value={formData.clienteId}
                    onChange={(e) => setFormData({ ...formData, clienteId: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-600 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  >
                    {dbCustomers.length === 0 ? (
                      <option value="">Carregando clientes...</option>
                    ) : (
                      dbCustomers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nome || c.razaoSocial} ({c.cpf || c.cnpj})
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                    Veículo do Processo
                  </label>
                  <select
                    value={formData.veiculoId}
                    onChange={(e) => setFormData({ ...formData, veiculoId: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-600 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  >
                    {dbVehicles.length === 0 ? (
                      <option value="">Carregando veículos...</option>
                    ) : (
                      dbVehicles.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.placa} - {v.marca} {v.modelo}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                    Honorários Despachante (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.valorHonorarios}
                    onChange={(e) => setFormData({ ...formData, valorHonorarios: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-purple-600 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                    Taxas DETRAN / Repasse (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.valorTaxas}
                    onChange={(e) => setFormData({ ...formData, valorTaxas: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-purple-600 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-purple-600 px-4 py-2 font-bold text-white shadow-lg shadow-purple-600/30 hover:bg-purple-700 transition disabled:opacity-50"
                >
                  {submitting ? 'Cadastrando no Banco...' : 'Criar Processo Real'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Process Detail Drawer */}
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
                      className="cursor-pointer flex items-center justify-between rounded-xl border border-slate-200 p-3 text-xs transition hover:border-purple-300 dark:border-slate-800"
                    >
                      <span className={chk.concluido ? 'line-through text-slate-400' : 'font-semibold'}>
                        {chk.descricao}
                      </span>
                      <div
                        className={`h-5 w-5 rounded-md flex items-center justify-center border ${
                          chk.concluido
                            ? 'bg-purple-600 border-purple-600 text-white'
                            : 'border-slate-300 dark:border-slate-700'
                        }`}
                      >
                        {chk.concluido && <Check className="h-3.5 w-3.5" />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* PIX Billing */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">Cobrança PIX Integrada:</span>
                  <span className="text-sm font-black text-purple-600 dark:text-purple-400">
                    {formatBrl(selectedProcess.valorTotal)}
                  </span>
                </div>
                <button
                  onClick={handleCopyPix}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 py-2.5 text-xs font-bold text-white hover:bg-purple-700 transition"
                >
                  <Copy className="h-3.5 w-3.5" />
                  {copiedPix ? 'Código PIX Copiado!' : 'Copiar Chave PIX Copia e Cola'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
