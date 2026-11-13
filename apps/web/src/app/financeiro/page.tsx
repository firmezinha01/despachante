'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import {
  DollarSign,
  TrendingUp,
  Receipt,
  QrCode,
  ArrowDownLeft,
  ArrowUpRight,
  Filter,
  CheckCircle2,
  Clock,
  Plus,
} from 'lucide-react';
import { formatBrl } from '@/lib/utils';

export default function FinanceiroPage() {
  const [activeTab, setActiveTab] = useState<'transacoes' | 'dre'>('transacoes');

  const dre = {
    receitaHonorarios: 48950.00,
    repasseTaxasTerceiros: 82430.50,
    totalMovimentadoGeral: 131380.50,
    despesasOperacionais: 14200.00,
    comissoesPagas: 4850.00,
    totalDespesas: 19050.00,
    resultadoOperacional: 29900.00,
    margemLiquida: 61.08,
  };

  const transactions = [
    {
      id: 'tx1',
      tipo: 'RECEITA',
      descricao: 'Honorários de Transferência - PROC-2026-0001',
      categoria: 'Honorários de Despachante',
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
      categoria: 'Taxa Estadual Detran',
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
      categoria: 'Honorários de Despachante',
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
      categoria: 'Taxa Estadual Detran',
      isTaxaTerceiro: true,
      valor: 160.22,
      forma: 'PIX',
      status: 'PENDENTE',
      vencimento: '12/11/2026',
    },
    {
      id: 'tx5',
      tipo: 'DESPESA',
      descricao: 'Comissão Parceiro Concessionária Paulista',
      categoria: 'Comissão de Parceiro',
      isTaxaTerceiro: false,
      valor: 50.00,
      forma: 'PIX',
      status: 'PAGO',
      vencimento: '10/11/2026',
    },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar />
      <div className="flex-1 pl-64">
        <Header />

        <main className="p-8 space-y-6">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                Gestão Financeira & DRE
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Segregação contábil automática de receitas de honorários e repasse de taxas de Detran.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center rounded-xl border border-slate-200 bg-white p-1 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <button
                  onClick={() => setActiveTab('transacoes')}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    activeTab === 'transacoes'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-purple-600 dark:text-slate-300'
                  }`}
                >
                  Lançamentos & PIX
                </button>
                <button
                  onClick={() => setActiveTab('dre')}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    activeTab === 'dre'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-purple-600 dark:text-slate-300'
                  }`}
                >
                  DRE Gerencial
                </button>
              </div>

              <button className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-600/30 hover:bg-purple-700 transition">
                <Plus className="h-4 w-4" />
                Novo Lançamento
              </button>
            </div>
          </div>

          {/* Cards Resumo */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div className="rounded-2xl border border-purple-200 bg-white p-6 shadow-sm dark:border-purple-900/40 dark:bg-slate-900">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                Receita Própria (Honorários)
              </span>
              <p className="mt-3 text-2xl font-black text-slate-900 dark:text-white">
                {formatBrl(dre.receitaHonorarios)}
              </p>
              <p className="mt-1 text-xs text-emerald-600 font-semibold">
                Base real de faturamento do despachante
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Taxas em Trânsito (Detran/Sefaz)
              </span>
              <p className="mt-3 text-2xl font-black text-slate-900 dark:text-white">
                {formatBrl(dre.repasseTaxasTerceiros)}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Repasses não tributáveis pelo ISS
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-6 shadow-sm dark:border-emerald-900/40 dark:bg-slate-900">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Lucro Operacional Líquido
              </span>
              <p className="mt-3 text-2xl font-black text-emerald-700 dark:text-emerald-400">
                {formatBrl(dre.resultadoOperacional)}
              </p>
              <p className="mt-1 text-xs text-emerald-600 font-semibold">
                Margem líquida de {dre.margemLiquida}%
              </p>
            </div>
          </div>

          {/* Content Tabs */}
          {activeTab === 'transacoes' ? (
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden dark:border-slate-800 dark:bg-slate-900">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Lançamentos Financeiros do Período
                </h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:bg-slate-950/80 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="px-6 py-3.5">Descrição</th>
                      <th className="px-6 py-3.5">Classificação Contábil</th>
                      <th className="px-6 py-3.5">Forma</th>
                      <th className="px-6 py-3.5">Vencimento</th>
                      <th className="px-6 py-3.5">Status</th>
                      <th className="px-6 py-3.5 text-right">Valor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/50 transition">
                        <td className="px-6 py-4">
                          <p className="font-semibold text-slate-900 dark:text-white text-xs">{tx.descricao}</p>
                        </td>
                        <td className="px-6 py-4">
                          {tx.isTaxaTerceiro ? (
                            <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                              Taxa de Terceiros (Repasse)
                            </span>
                          ) : (
                            <span className="rounded bg-purple-100 px-2 py-0.5 text-[11px] font-bold text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                              Honorários Próprios
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-xs font-mono">{tx.forma}</td>
                        <td className="px-6 py-4 text-xs text-slate-500">{tx.vencimento}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                              tx.status === 'PAGO'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            }`}
                          >
                            {tx.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-slate-900 dark:text-white">
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
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 max-w-2xl space-y-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
                Demonstração do Resultado do Exercício (DRE)
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-1">
                  <span className="font-bold text-purple-700 dark:text-purple-300">
                    (+) Receita Bruta de Honorários do Despachante
                  </span>
                  <strong className="font-mono">{formatBrl(dre.receitaHonorarios)}</strong>
                </div>

                <div className="flex justify-between py-1 text-slate-500 pl-4 text-xs border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span>Valores em Trânsito / Repasse Taxas Detran (Informativo)</span>
                  <span className="font-mono">{formatBrl(dre.repasseTaxasTerceiros)}</span>
                </div>

                <div className="flex justify-between py-1 text-rose-600">
                  <span>(-) Custos Operacionais e Despesas Administrativas</span>
                  <span className="font-mono">-{formatBrl(dre.despesasOperacionais)}</span>
                </div>

                <div className="flex justify-between py-1 text-rose-600 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span>(-) Comissões de Concessionárias e Parceiros</span>
                  <span className="font-mono">-{formatBrl(dre.comissoesPagas)}</span>
                </div>

                <div className="flex justify-between py-2 text-base font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800/40">
                  <span>(=) RESULTADO OPERACIONAL LÍQUIDO</span>
                  <span className="font-mono">{formatBrl(dre.resultadoOperacional)}</span>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
