'use client';

import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import {
  DollarSign,
  TrendingUp,
  Receipt,
  Plus,
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

export default function FinanceiroPage() {
  const [activeTab, setActiveTab] = useState<'transacoes' | 'dre'>('transacoes');
  const [dre, setDre] = useState(initialDre);
  const [transactions, setTransactions] = useState<any[]>([
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
    {
      id: 'tx4',
      tipo: 'RECEITA',
      descricao: 'Taxa Anual Licenciamento Detran-SP (Repasse)',
      isTaxaTerceiro: true,
      valor: 160.22,
      forma: 'PIX',
      status: 'PENDENTE',
      vencimento: '12/11/2026',
    },
  ]);

  useEffect(() => {
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
  }, []);

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Gestão Financeira & DRE
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Segregação de receitas próprias e repasse de taxas de Detran.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center rounded-xl border border-slate-200 bg-white p-1 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <button
              onClick={() => setActiveTab('transacoes')}
              className={`rounded-lg px-2.5 sm:px-3 py-1.5 text-xs font-semibold transition ${
                activeTab === 'transacoes'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-purple-600 dark:text-slate-300'
              }`}
            >
              Lançamentos
            </button>
            <button
              onClick={() => setActiveTab('dre')}
              className={`rounded-lg px-2.5 sm:px-3 py-1.5 text-xs font-semibold transition ${
                activeTab === 'dre'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-purple-600 dark:text-slate-300'
              }`}
            >
              DRE Gerencial
            </button>
          </div>

          <button className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-purple-600/30 hover:bg-purple-700 transition">
            <Plus className="h-4 w-4" />
            <span className="hidden xs:inline sm:inline">Lançamento</span>
          </button>
        </div>
      </div>

      {/* Cards Resumo */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-purple-200 bg-white p-5 sm:p-6 shadow-sm dark:border-purple-900/40 dark:bg-slate-900">
          <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
            Receita Própria (Honorários)
          </span>
          <p className="mt-2.5 text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {formatBrl(dre.receitaHonorarios)}
          </p>
          <p className="mt-1 text-[11px] text-emerald-600 font-semibold">
            Base tributável do despachante
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Taxas em Trânsito (Detran/Sefaz)
          </span>
          <p className="mt-2.5 text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {formatBrl(dre.repasseTaxasTerceiros)}
          </p>
          <p className="mt-1 text-[11px] text-slate-400">
            Repasses não tributáveis por ISS
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 sm:p-6 shadow-sm dark:border-emerald-900/40 dark:bg-slate-900">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            Lucro Líquido
          </span>
          <p className="mt-2.5 text-xl sm:text-2xl font-black text-emerald-700 dark:text-emerald-400">
            {formatBrl(dre.resultadoOperacional)}
          </p>
          <p className="mt-1 text-[11px] text-emerald-600 font-semibold">
            Margem de {dre.margemLiquida}%
          </p>
        </div>
      </div>

      {/* Content Tabs */}
      {activeTab === 'transacoes' ? (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden dark:border-slate-800 dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm min-w-[640px]">
              <thead className="bg-slate-50 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:bg-slate-950/80 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 sm:px-6 py-3">Descrição</th>
                  <th className="px-4 sm:px-6 py-3">Classificação</th>
                  <th className="px-4 sm:px-6 py-3">Forma</th>
                  <th className="px-4 sm:px-6 py-3">Status</th>
                  <th className="px-4 sm:px-6 py-3 text-right">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/50 transition">
                    <td className="px-4 sm:px-6 py-3.5">
                      <p className="font-semibold text-slate-900 dark:text-white text-xs">{tx.descricao}</p>
                    </td>
                    <td className="px-4 sm:px-6 py-3.5">
                      {tx.isTaxaTerceiro ? (
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          Taxa de Terceiros
                        </span>
                      ) : (
                        <span className="rounded bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                          Honorários
                        </span>
                      )}
                    </td>
                    <td className="px-4 sm:px-6 py-3.5 text-xs font-mono">{tx.forma}</td>
                    <td className="px-4 sm:px-6 py-3.5">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          tx.status === 'PAGO'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-3.5 text-right font-bold text-slate-900 dark:text-white">
                      {formatBrl(tx.valor)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* DRE View */
        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 max-w-2xl space-y-3.5">
          <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
            DRE Gerencial do Despachante
          </h2>

          <div className="space-y-3 text-xs sm:text-sm">
            <div className="flex justify-between py-1">
              <span className="font-bold text-purple-700 dark:text-purple-300">
                (+) Receita Bruta de Honorários
              </span>
              <strong className="font-mono">{formatBrl(dre.receitaHonorarios)}</strong>
            </div>

            <div className="flex justify-between py-1 text-slate-400 pl-3 text-xs border-b border-slate-100 dark:border-slate-800 pb-2">
              <span>Taxas em Trânsito / Detran (Informativo)</span>
              <span className="font-mono">{formatBrl(dre.repasseTaxasTerceiros)}</span>
            </div>

            <div className="flex justify-between py-1 text-rose-600">
              <span>(-) Despesas Operacionais</span>
              <span className="font-mono">-{formatBrl(dre.despesasOperacionais)}</span>
            </div>

            <div className="flex justify-between py-1 text-rose-600 border-b border-slate-100 dark:border-slate-800 pb-2">
              <span>(-) Comissões Pagas</span>
              <span className="font-mono">-{formatBrl(dre.comissoesPagas)}</span>
            </div>

            <div className="flex justify-between py-2 text-sm sm:text-base font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800/40">
              <span>(=) RESULTADO OPERACIONAL</span>
              <span className="font-mono">{formatBrl(dre.resultadoOperacional)}</span>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
