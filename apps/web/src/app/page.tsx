'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import {
  TrendingUp,
  AlertCircle,
  Clock,
  CheckCircle2,
  Car,
  FileText,
  DollarSign,
  Plus,
  ArrowUpRight,
  ShieldAlert,
  ChevronRight,
  QrCode,
} from 'lucide-react';
import { formatBrl } from '@/lib/utils';

export default function DashboardPage() {
  const [kpis] = useState({
    honorariosMes: 48950.00,
    taxasRepasseMes: 82430.50,
    totalProcessosAtivos: 34,
    processosConcluidosMes: 112,
    processosSlaRisco: 3,
    ticketMedioHonorarios: 350.00,
  });

  const recentProcesses = [
    {
      id: '1',
      protocolo: 'PROC-2026-0001',
      tipoServico: 'Transferência de Propriedade',
      placa: 'BRA2E19',
      veiculo: 'TOYOTA COROLLA ALTIS HYBRID 2024',
      cliente: 'Carlos Eduardo Oliveira',
      status: 'PROTOCOLO_DETRAN',
      statusLabel: 'Protocolado no Detran-SP',
      statusColor: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800',
      prazo: 'Em 2 dias',
      valorHonorarios: 350.00,
      valorTaxas: 425.50,
      valorTotal: 775.50,
      pago: true,
    },
    {
      id: '2',
      protocolo: 'PROC-2026-0002',
      tipoServico: 'Licenciamento Anual (CRLV-e)',
      placa: 'ABC1D23',
      veiculo: 'CHEVROLET ONIX PLUS 2024',
      cliente: 'Brasil Rent a Car e Frotas S/A',
      status: 'PAGAMENTO_TAXAS',
      statusLabel: 'Aguardando Pagamento PIX',
      statusColor: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
      prazo: 'Vence Hoje',
      valorHonorarios: 120.00,
      valorTaxas: 160.22,
      valorTotal: 280.22,
      pago: false,
    },
    {
      id: '3',
      protocolo: 'PROC-2026-0003',
      tipoServico: 'Primeiro Emplacamento (0km)',
      placa: 'XYZ9876',
      veiculo: 'VOLKSWAGEN POLO TRACK 2024',
      cliente: 'Mariana Duarte Souza',
      status: 'TRIAGEM',
      statusLabel: 'Triagem Documental',
      statusColor: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800',
      prazo: 'Em 4 dias',
      valorHonorarios: 400.00,
      valorTaxas: 380.00,
      valorTotal: 780.00,
      pago: false,
    },
  ];

  const workflowStages = [
    { nome: 'Triagem Inicial', count: 5, color: 'border-l-blue-500' },
    { nome: 'Vistoria ECV', count: 7, color: 'border-l-indigo-500' },
    { nome: 'Coleta de Assinaturas', count: 4, color: 'border-l-violet-500' },
    { nome: 'Pagamento de Taxas', count: 6, color: 'border-l-amber-500' },
    { nome: 'Protocolo DETRAN', count: 9, color: 'border-l-purple-600' },
    { nome: 'Emissão CRLV-e', count: 3, color: 'border-l-emerald-500' },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar />
      <div className="flex-1 pl-64">
        <Header />

        <main className="p-8 space-y-8">
          {/* Welcome & Action Bar */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                Painel Executivo & Operacional
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Visão consolidada da esteira veicular, SLAs e faturamento com segregação fiscal.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/detran"
                className="inline-flex items-center gap-2 rounded-xl border border-purple-200 bg-purple-50 px-4 py-2.5 text-sm font-semibold text-purple-700 shadow-sm transition hover:bg-purple-100 dark:border-purple-900 dark:bg-purple-950/40 dark:text-purple-300 dark:hover:bg-purple-900/60"
              >
                <Car className="h-4 w-4" />
                Consulta DETRAN
              </Link>
              <Link
                href="/processos?action=new"
                className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-600/30 transition hover:bg-purple-700"
              >
                <Plus className="h-4 w-4" />
                Novo Processo
              </Link>
            </div>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {/* Card 1: Honorários Próprios */}
            <div className="rounded-2xl border border-purple-200/80 bg-gradient-to-br from-white to-purple-50/50 p-6 shadow-sm dark:border-purple-900/40 dark:from-slate-900 dark:to-purple-950/30">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                  Honorários Próprios
                </span>
                <div className="rounded-xl bg-purple-600/10 p-2.5 text-purple-600 dark:bg-purple-600/20 dark:text-purple-300">
                  <TrendingUp className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-4 text-2xl font-black text-slate-900 dark:text-white">
                {formatBrl(kpis.honorariosMes)}
              </p>
              <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                <ArrowUpRight className="h-3.5 w-3.5" />
                <span>+14.8% vs mês anterior</span>
              </div>
            </div>

            {/* Card 2: Repasse de Taxas de Terceiros */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Taxas Detran (Repasse)
                </span>
                <div className="rounded-xl bg-slate-100 p-2.5 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  <DollarSign className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-4 text-2xl font-black text-slate-900 dark:text-white">
                {formatBrl(kpis.taxasRepasseMes)}
              </p>
              <p className="mt-2 text-xs text-slate-400">
                Segregado da base tributável do ISS
              </p>
            </div>

            {/* Card 3: Processos Ativos */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Esteira em Andamento
                </span>
                <div className="rounded-xl bg-purple-100 p-2.5 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
                  <Clock className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-4 text-2xl font-black text-slate-900 dark:text-white">
                {kpis.totalProcessosAtivos} processos
              </p>
              <p className="mt-2 text-xs text-purple-600 dark:text-purple-400 font-medium">
                112 concluídos este mês
              </p>
            </div>

            {/* Card 4: SLA em Risco */}
            <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-6 shadow-sm dark:border-rose-900/40 dark:bg-rose-950/20">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">
                  Alertas de SLA
                </span>
                <div className="rounded-xl bg-rose-100 p-2.5 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300">
                  <ShieldAlert className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-4 text-2xl font-black text-rose-700 dark:text-rose-300">
                {kpis.processosSlaRisco} processos
              </p>
              <p className="mt-2 text-xs text-rose-600/90 dark:text-rose-400 font-medium">
                Requerem ação imediata no DETRAN
              </p>
            </div>
          </div>

          {/* Workflow Pipeline Overview */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Distribuição da Esteira de Processos
              </h2>
              <Link
                href="/processos"
                className="inline-flex items-center gap-1 text-xs font-bold text-purple-600 hover:text-purple-700 dark:text-purple-400"
              >
                Abrir Kanban Completo <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {workflowStages.map((stg) => (
                <div
                  key={stg.nome}
                  className={`rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 border-l-4 ${stg.color} dark:border-slate-800 dark:bg-slate-950/60`}
                >
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate font-medium">
                    {stg.nome}
                  </p>
                  <p className="mt-2 text-xl font-black text-slate-900 dark:text-white">
                    {stg.count}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Processes Table */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 p-6 dark:border-slate-800">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Processos Recentes em Trâmite
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Acompanhamento instantâneo de etapas, protocolos e pagamentos.
                </p>
              </div>
              <Link
                href="/processos"
                className="text-xs font-bold text-purple-600 hover:text-purple-700 dark:text-purple-400"
              >
                Ver todos os processos
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:bg-slate-950/80 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-6 py-3.5">Protocolo</th>
                    <th className="px-6 py-3.5">Veículo / Placa</th>
                    <th className="px-6 py-3.5">Cliente</th>
                    <th className="px-6 py-3.5">Serviço</th>
                    <th className="px-6 py-3.5">Etapa / Status</th>
                    <th className="px-6 py-3.5">Total (Honorários + Taxas)</th>
                    <th className="px-6 py-3.5 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {recentProcesses.map((proc) => (
                    <tr key={proc.id} className="hover:bg-slate-50/80 dark:hover:bg-purple-950/20 transition">
                      <td className="px-6 py-4 font-mono font-bold text-xs text-purple-600 dark:text-purple-400">
                        {proc.protocolo}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="rounded bg-slate-900 px-2 py-0.5 font-mono text-xs font-bold text-white border border-slate-700">
                            {proc.placa}
                          </span>
                          <span className="text-xs text-slate-600 dark:text-slate-300 font-medium truncate max-w-[200px]">
                            {proc.veiculo}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-900 dark:text-white">
                        {proc.cliente}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-600 dark:text-slate-300">
                        {proc.tipoServico}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${proc.statusColor}`}>
                          {proc.statusLabel}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs font-bold text-slate-900 dark:text-white">
                          {formatBrl(proc.valorTotal)}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {proc.pago ? (
                            <span className="text-emerald-600 font-medium">Pago via PIX</span>
                          ) : (
                            <span className="text-amber-600 font-medium">Pendente de Pagamento</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/processos?id=${proc.id}`}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                        >
                          Detalhes
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
