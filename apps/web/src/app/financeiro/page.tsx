'use client';

import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import {
  DollarSign,
  TrendingUp,
  Receipt,
  Plus,
  X,
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
} from 'lucide-react';
import { formatBrl } from '@/lib/utils';
import { fetchApi } from '@/lib/api-client';

const initialDre = {
  receitaHonorarios: 48950.00,
  repasseTaxasTerceiros: 82430.50,
  totalMovimentadoGeral: 131380.50,
  despesasOperacionais: 14200.00,
  comissoesPagas: 4850.00,
  totalDespesas: 19050.00,
  resultadoOperacional: 29900.00,
  margemLiquida: 61.08,
};

const initialTransactions = [
  {
    id: 'tx1',
    tipo: 'RECEITA',
    descricao: 'Honorários de Transferência - PROC-2026-0001',
    isTaxaTerceiro: false,
    valor: 350.00,
    forma: 'PIX',
    status: 'PAGO',
    vencimento: '11/11/2026',
  },
  {
    id: 'tx2',
    tipo: 'RECEITA',
    descricao: 'Taxa Oficial DETRAN-SP Transferência (Repasse)',
    isTaxaTerceiro: true,
    valor: 425.50,
    forma: 'PIX',
    status: 'PAGO',
    vencimento: '11/11/2026',
  },
  {
    id: 'tx3',
    tipo: 'RECEITA',
    descricao: 'Honorários Licenciamento Anual - PROC-2026-0002',
    isTaxaTerceiro: false,
    valor: 120.00,
    forma: 'PIX',
    status: 'PENDENTE',
    vencimento: '12/11/2026',
  },
];

export default function FinanceiroPage() {
  const [activeTab, setActiveTab] = useState<'transacoes' | 'dre'>('transacoes');
  const [dre, setDre] = useState(initialDre);
  const [transactions, setTransactions] = useState<any[]>(initialTransactions);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    tipo: 'RECEITA',
    categoria: 'HONORARIOS',
    descricao: '',
    valor: '',
    isTaxaTerceiro: false,
    formaPagamento: 'PIX',
    status: 'PAGO',
  });

  const loadFinancialData = () => {
    fetchApi('/financial/dre')
      .then((data) => {
        if (data) {
          setDre({
            receitaHonorarios: Number(data.receitaHonorarios) || initialDre.receitaHonorarios,
            repasseTaxasTerceiros: Number(data.repasseTaxasTerceiros) || initialDre.repasseTaxasTerceiros,
            totalMovimentadoGeral: Number(data.totalMovimentadoGeral) || initialDre.totalMovimentadoGeral,
            despesasOperacionais: Number(data.despesasOperacionais) || initialDre.despesasOperacionais,
            comissoesPagas: Number(data.comissoesPagas) || initialDre.comissoesPagas,
            totalDespesas: Number(data.totalDespesas) || initialDre.totalDespesas,
            resultadoOperacional: Number(data.resultadoOperacional) || initialDre.resultadoOperacional,
            margemLiquida: Number(data.margemLiquida) || initialDre.margemLiquida,
          });
        }
      })
      .catch((err) => console.warn('Usando DRE local:', err));

    fetchApi('/financial/transactions')
      .then((data) => {
        if (data && Array.isArray(data) && data.length > 0) {
          const mapped = data.map((t: any) => ({
            id: t.id,
            tipo: t.tipo,
            descricao: t.descricao,
            isTaxaTerceiro: t.isTaxaTerceiro,
            valor: Number(t.valor) || 0,
            forma: t.formaPagamento || 'PIX',
            status: t.status,
            vencimento: t.dataVencimento ? new Date(t.dataVencimento).toLocaleDateString('pt-BR') : 'Hoje',
          }));
          setTransactions(mapped);
        }
      })
      .catch((err) => console.warn('Usando transações locais:', err));
  };

  useEffect(() => {
    loadFinancialData();
  }, []);

  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.descricao || !formData.valor) {
      setFormError('Informe a descrição e o valor do lançamento.');
      return;
    }

    setSubmitting(true);
    setFormError(null);

    try {
      await fetchApi('/financial/transactions', {
        method: 'POST',
        body: JSON.stringify({
          tipo: formData.tipo,
          categoria: formData.categoria,
          descricao: formData.descricao,
          valor: parseFloat(formData.valor),
          isTaxaTerceiro: formData.isTaxaTerceiro,
          formaPagamento: formData.formaPagamento,
          status: formData.status,
          dataVencimento: new Date(),
        }),
      });

      setIsModalOpen(false);
      setFormData({
        tipo: 'RECEITA',
        categoria: 'HONORARIOS',
        descricao: '',
        valor: '',
        isTaxaTerceiro: false,
        formaPagamento: 'PIX',
        status: 'PAGO',
      });
      loadFinancialData();
    } catch (err: any) {
      setFormError(err.message || 'Erro ao registrar lançamento no banco.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Gestão Financeira & DRE
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Segregação de receitas próprias e repasse de taxas de Detran no Supabase.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center rounded-xl border border-slate-200 bg-white p-1 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <button
              onClick={() => setActiveTab('transacoes')}
              className={`rounded-lg px-2.5 sm:px-3 py-1.5 text-xs font-semibold transition ${
                activeTab === 'transacoes'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-purple-600 dark:text-slate-300'
              }`}
            >
              Lançamentos
            </button>
            <button
              onClick={() => setActiveTab('dre')}
              className={`rounded-lg px-2.5 sm:px-3 py-1.5 text-xs font-semibold transition ${
                activeTab === 'dre'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-purple-600 dark:text-slate-300'
              }`}
            >
              DRE Gerencial
            </button>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-purple-600/30 hover:bg-purple-700 transition"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden xs:inline sm:inline">Novo Lançamento</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-purple-200/80 bg-white p-5 shadow-xs dark:border-purple-900/40 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Receita Própria (Honorários)
            </span>
            <div className="rounded-xl bg-purple-50 p-2 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {formatBrl(dre.receitaHonorarios)}
          </p>
          <span className="mt-1 block text-[11px] font-semibold text-emerald-600">
            Faturamento líquido tributável
          </span>
        </div>

        <div className="rounded-2xl border border-amber-200/80 bg-white p-5 shadow-xs dark:border-amber-900/40 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Repasse de Taxas DETRAN
            </span>
            <div className="rounded-xl bg-amber-50 p-2 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
              <Receipt className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-xl sm:text-2xl font-black text-amber-700 dark:text-amber-400">
            {formatBrl(dre.repasseTaxasTerceiros)}
          </p>
          <span className="mt-1 block text-[11px] font-semibold text-slate-500">
            Valores em trânsito (não tributáveis)
          </span>
        </div>

        <div className="rounded-2xl border border-emerald-200/80 bg-white p-5 shadow-xs sm:col-span-2 lg:col-span-1 dark:border-emerald-900/40 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Resultado Líquido do Mês
            </span>
            <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-xl sm:text-2xl font-black text-emerald-700 dark:text-emerald-400">
            {formatBrl(dre.resultadoOperacional)}
          </p>
          <span className="mt-1 block text-[11px] font-semibold text-emerald-600">
            Margem Líquida: {dre.margemLiquida.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'transacoes' ? (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900 overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="border-b border-slate-100 bg-slate-50/75 dark:border-slate-800 dark:bg-slate-950">
              <tr>
                <th className="p-3 sm:p-4 font-bold text-slate-500">Descrição</th>
                <th className="p-3 sm:p-4 font-bold text-slate-500">Natureza</th>
                <th className="p-3 sm:p-4 font-bold text-slate-500">Forma</th>
                <th className="p-3 sm:p-4 font-bold text-slate-500">Status</th>
                <th className="p-3 sm:p-4 font-bold text-slate-500">Data</th>
                <th className="p-3 sm:p-4 font-bold text-slate-500 text-right">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/40 transition">
                  <td className="p-3 sm:p-4 font-semibold text-slate-900 dark:text-white">
                    {tx.descricao}
                  </td>
                  <td className="p-3 sm:p-4">
                    <span
                      className={`rounded px-2 py-0.5 text-xs font-bold ${
                        tx.isTaxaTerceiro
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                      }`}
                    >
                      {tx.isTaxaTerceiro ? 'Taxa DETRAN (Repasse)' : 'Honorários (Próprio)'}
                    </span>
                  </td>
                  <td className="p-3 sm:p-4 font-mono font-bold text-slate-600 dark:text-slate-300">
                    {tx.forma}
                  </td>
                  <td className="p-3 sm:p-4">
                    <span
                      className={`rounded px-2 py-0.5 text-xs font-bold ${
                        tx.status === 'PAGO'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {tx.status}
                    </span>
                  </td>
                  <td className="p-3 sm:p-4 text-slate-500">{tx.vencimento}</td>
                  <td
                    className={`p-3 sm:p-4 font-bold text-right ${
                      tx.tipo === 'RECEITA' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'
                    }`}
                  >
                    {formatBrl(tx.valor)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* DRE Gerencial */
        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
            Demonstrativo de Resultado do Exercício (DRE)
          </h2>
          <div className="space-y-3 text-xs sm:text-sm">
            <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Receita Bruta com Honorários:</span>
              <span className="font-bold text-slate-900 dark:text-white">{formatBrl(dre.receitaHonorarios)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800 text-amber-600">
              <span className="font-semibold">(+) Valores em Trânsito / Repasses de Taxas:</span>
              <span className="font-bold">{formatBrl(dre.repasseTaxasTerceiros)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800 text-rose-600">
              <span className="font-semibold">(-) Despesas Operacionais e Comissões:</span>
              <span className="font-bold">{formatBrl(dre.totalDespesas)}</span>
            </div>
            <div className="flex justify-between items-center py-3 bg-purple-50 dark:bg-purple-950/40 px-4 rounded-xl text-purple-900 dark:text-purple-200 text-sm sm:text-base font-black">
              <span>Resultado Operacional Líquido:</span>
              <span>{formatBrl(dre.resultadoOperacional)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Modal Novo Lançamento */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="h-5 w-5 text-purple-600" />
                Registrar Lançamento Financeiro
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
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

            <form onSubmit={handleCreateTransaction} className="space-y-3.5 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                    Tipo de Operação
                  </label>
                  <select
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-600 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  >
                    <option value="RECEITA">Receita (+)</option>
                    <option value="DESPESA">Despesa (-)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                    Natureza do Valor
                  </label>
                  <select
                    value={formData.isTaxaTerceiro ? 'SIM' : 'NAO'}
                    onChange={(e) => setFormData({ ...formData, isTaxaTerceiro: e.target.value === 'SIM' })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-600 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  >
                    <option value="NAO">Honorário do Despachante</option>
                    <option value="SIM">Taxa Oficial DETRAN (Repasse)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                  Descrição do Lançamento
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Honorários Transferência Corolla"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 focus:outline-none focus:ring-2 focus:ring-purple-600 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                    Valor (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={formData.valor}
                    onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-purple-600 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                    Forma de Pagamento
                  </label>
                  <select
                    value={formData.formaPagamento}
                    onChange={(e) => setFormData({ ...formData, formaPagamento: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-600 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  >
                    <option value="PIX">PIX</option>
                    <option value="CARTAO">Cartão</option>
                    <option value="BOLETO">Boleto</option>
                    <option value="DINHEIRO">Dinheiro</option>
                  </select>
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-purple-600 px-4 py-2 font-bold text-white shadow-lg shadow-purple-600/30 hover:bg-purple-700 transition disabled:opacity-50"
                >
                  {submitting ? 'Salvando no Banco...' : 'Registrar Lançamento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
