'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import {
  Search,
  AlertTriangle,
  Download,
} from 'lucide-react';
import { formatBrl } from '@/lib/utils';

export default function DetranPage() {
  const [selectedUf, setSelectedUf] = useState('SP');
  const [placa, setPlaca] = useState('BRA2E19');
  const [renavam, setRenavam] = useState('12345678901');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>({
    consultado: true,
    placa: 'BRA2E19',
    renavam: '12345678901',
    chassi: '9BRBD48E9K8123456',
    marcaModelo: 'TOYOTA/COROLLA ALTIS HYBRID',
    anoFabricacao: 2024,
    anoModelo: 2024,
    cor: 'CINZA',
    combustivel: 'GASOLINA/ELETRICO (HIBRIDO)',
    uf: 'SP',
    municipio: 'SAO PAULO',
    proprietarioNome: 'CARLOS EDUARDO OLIVEIRA',
    situacaoVeiculo: 'REGULAR',
    restricoes: ['ALIENACAO FIDUCIARIA: BANCO TOYOTA S/A'],
    totalDebitos: 425.50,
    debitos: [
      {
        tipo: 'IPVA',
        descricao: 'IPVA Exercício 2026 (Quitado)',
        valor: 0,
        status: 'PAGO',
      },
      {
        tipo: 'TAXA_TRANSFERENCIA',
        descricao: 'Taxa Estadual de Transferência (e-CRVsp)',
        valor: 265.28,
        status: 'ABERTO',
      },
      {
        tipo: 'TAXA_TRANSFERENCIA',
        descricao: 'Taxa de Laudo de Vistoria ECV',
        valor: 160.22,
        status: 'ABERTO',
      },
    ],
  });

  const handleConsultar = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setResult({
        ...result,
        placa: placa.toUpperCase(),
        renavam,
        uf: selectedUf,
      });
    }, 600);
  };

  return (
    <AppLayout>
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
          Terminal DETRAN & SENATRAN
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Provedores estaduais (SP, RJ, MG, PR) e Base Nacional (BIN / RENAVE).
        </p>
      </div>

      {/* Query Terminal Form */}
      <div className="rounded-2xl border border-purple-200/80 bg-white p-4 sm:p-6 shadow-sm dark:border-purple-900/40 dark:bg-slate-900">
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Órgão / Estado
            </label>
            <select
              value={selectedUf}
              onChange={(e) => setSelectedUf(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-600 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
            >
              <option value="SP">DETRAN-SP (e-CRVsp)</option>
              <option value="RJ">DETRAN-RJ</option>
              <option value="MG">DETRAN-MG (SIAEX)</option>
              <option value="PR">DETRAN-PR</option>
              <option value="BR">SENATRAN (Nacional)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Placa do Veículo
            </label>
            <input
              type="text"
              value={placa}
              onChange={(e) => setPlaca(e.target.value.toUpperCase())}
              placeholder="Ex: BRA2E19"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-mono text-xs sm:text-sm font-bold uppercase focus:outline-none focus:ring-2 focus:ring-purple-600 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Código RENAVAM
            </label>
            <input
              type="text"
              value={renavam}
              onChange={(e) => setRenavam(e.target.value)}
              placeholder="Ex: 12345678901"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-mono text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-600 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
            />
          </div>

          <div className="flex items-end sm:col-span-2 lg:col-span-1">
            <button
              onClick={handleConsultar}
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 p-2.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-purple-600/30 hover:bg-purple-700 transition"
            >
              <Search className="h-4 w-4" />
              {loading ? 'Consultando...' : 'Consultar'}
            </button>
          </div>
        </div>
      </div>

      {/* Results View */}
      {result && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          {/* Vehicle Data Card */}
          <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <span className="rounded bg-slate-950 px-2.5 py-1 font-mono text-sm font-black text-white border border-slate-700 shrink-0">
                  {result.placa}
                </span>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                    {result.marcaModelo}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Ano: {result.anoModelo} • {result.uf} - {result.municipio}
                  </p>
                </div>
              </div>
              <span className="self-start sm:self-auto rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                SITUAÇÃO REGULAR
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="rounded-xl bg-slate-50 p-2.5 dark:bg-slate-950">
                <span className="text-slate-400">Renavam:</span>
                <p className="font-mono font-bold text-slate-800 dark:text-slate-200">{result.renavam}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-2.5 dark:bg-slate-950">
                <span className="text-slate-400">Chassi:</span>
                <p className="font-mono font-bold text-slate-800 dark:text-slate-200">{result.chassi}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-2.5 dark:bg-slate-950">
                <span className="text-slate-400">Combustível:</span>
                <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{result.combustivel}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-2.5 dark:bg-slate-950 sm:col-span-3">
                <span className="text-slate-400">Proprietário:</span>
                <p className="font-bold text-slate-800 dark:text-slate-200">{result.proprietarioNome}</p>
              </div>
            </div>

            {/* Restrições */}
            <div>
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                Restrições Ativas
              </h3>
              {result.restricoes.map((r: string, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-2.5 text-xs font-semibold text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300"
                >
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>{r}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Débitos & Guia Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4 flex flex-col justify-between">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mb-2">
                Débitos & Taxas DETRAN
              </h3>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {result.debitos.map((deb: any, idx: number) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{deb.descricao}</p>
                      <span
                        className={`text-[10px] font-bold ${
                          deb.status === 'PAGO' ? 'text-emerald-600' : 'text-amber-600'
                        }`}
                      >
                        {deb.status}
                      </span>
                    </div>
                    <span className="font-bold text-slate-900 dark:text-white shrink-0">
                      {formatBrl(deb.valor)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-800 pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">Total a Recolher:</span>
                <span className="text-base sm:text-lg font-black text-purple-600 dark:text-purple-400">
                  {formatBrl(result.totalDebitos)}
                </span>
              </div>

              <button className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 p-2.5 text-xs font-bold text-white hover:bg-slate-800 dark:bg-purple-600 dark:hover:bg-purple-700 transition">
                <Download className="h-3.5 w-3.5" />
                Emitir Guia DUA / DAE
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
