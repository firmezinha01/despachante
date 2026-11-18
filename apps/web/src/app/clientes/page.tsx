'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import {
  Search,
  Plus,
  Building,
  User,
} from 'lucide-react';

const mockCustomers = [
  {
    id: 'c1',
    tipo: 'PF',
    nome: 'Carlos Eduardo Oliveira',
    cpf: '234.567.890-12',
    cnh: '01234567890',
    email: 'carlos.oliveira@email.com',
    telefone: '(11) 98111-2233',
    cidade: 'São Paulo',
    uf: 'SP',
    totalVeiculos: 1,
    totalProcessos: 1,
  },
  {
    id: 'c2',
    tipo: 'PJ',
    razaoSocial: 'BRASIL RENT A CAR E FROTAS S/A',
    nomeFantasia: 'Brasil Frotas',
    cnpj: '76.543.210/0001-88',
    email: 'frotas@brasilrentacar.com.br',
    telefone: '(11) 4004-9900',
    cidade: 'São Paulo',
    uf: 'SP',
    totalVeiculos: 48,
    totalProcessos: 14,
  },
  {
    id: 'c3',
    tipo: 'PF',
    nome: 'Mariana Duarte Souza',
    cpf: '345.678.901-23',
    cnh: '99887766554',
    email: 'mariana.duarte@email.com',
    telefone: '(11) 97777-6655',
    cidade: 'Curitiba',
    uf: 'PR',
    totalVeiculos: 1,
    totalProcessos: 1,
  },
];

export default function ClientesPage() {
  const [filterTipo, setFilterTipo] = useState<'TODOS' | 'PF' | 'PJ'>('TODOS');
  const [search, setSearch] = useState('');

  const filtered = mockCustomers.filter((c) => {
    if (filterTipo === 'PF' && c.tipo !== 'PF') return false;
    if (filterTipo === 'PJ' && c.tipo !== 'PJ') return false;
    if (search) {
      const s = search.toLowerCase();
      const nome = (c.nome || c.razaoSocial || '').toLowerCase();
      const doc = (c.cpf || c.cnpj || '').toLowerCase();
      return nome.includes(s) || doc.includes(s);
    }
    return true;
  });

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            CRM & Clientes
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Pessoas Físicas e Jurídicas, frotistas e concessionárias parceiras.
          </p>
        </div>

        <button className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-purple-600/30 hover:bg-purple-700 transition">
          <Plus className="h-4 w-4" />
          Novo Cliente
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
        <div className="flex w-full sm:w-80 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs sm:text-sm shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <Search className="h-4 w-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por Nome, CPF ou CNPJ..."
            className="w-full bg-transparent focus:outline-none dark:text-slate-100"
          />
        </div>

        <div className="flex items-center rounded-xl border border-slate-200 bg-white p-1 shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-x-auto">
          {(['TODOS', 'PF', 'PJ'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilterTipo(t)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition ${
                filterTipo === t
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-purple-600 dark:text-slate-300'
              }`}
            >
              {t === 'TODOS' ? 'Todos' : t === 'PF' ? 'PF' : 'PJ (Frotas)'}
            </button>
          ))}
        </div>
      </div>

      {/* Customers Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm min-w-[640px]">
            <thead className="bg-slate-50 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:bg-slate-950/80 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 sm:px-6 py-3">Tipo</th>
                <th className="px-4 sm:px-6 py-3">Nome / Razão Social</th>
                <th className="px-4 sm:px-6 py-3">CPF / CNPJ</th>
                <th className="px-4 sm:px-6 py-3">Contato</th>
                <th className="px-4 sm:px-6 py-3">Veículos</th>
                <th className="px-4 sm:px-6 py-3 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((cli) => (
                <tr key={cli.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/50 transition">
                  <td className="px-4 sm:px-6 py-3.5">
                    {cli.tipo === 'PF' ? (
                      <span className="inline-flex items-center gap-1 rounded bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                        <User className="h-3 w-3" /> PF
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded bg-purple-100 px-2 py-0.5 text-xs font-bold text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                        <Building className="h-3 w-3" /> PJ
                      </span>
                    )}
                  </td>
                  <td className="px-4 sm:px-6 py-3.5">
                    <p className="font-bold text-slate-900 dark:text-white text-xs">
                      {cli.nome || cli.razaoSocial}
                    </p>
                    {cli.nomeFantasia && (
                      <p className="text-[11px] text-slate-400">{cli.nomeFantasia}</p>
                    )}
                  </td>
                  <td className="px-4 sm:px-6 py-3.5 font-mono text-xs text-slate-600 dark:text-slate-300">
                    {cli.cpf || cli.cnpj}
                  </td>
                  <td className="px-4 sm:px-6 py-3.5 text-xs text-slate-600 dark:text-slate-300">
                    <div>{cli.telefone}</div>
                    <div className="text-[10px] text-slate-400 truncate max-w-[150px]">{cli.email}</div>
                  </td>
                  <td className="px-4 sm:px-6 py-3.5">
                    <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                      {cli.totalVeiculos} veíc. • {cli.totalProcessos} proc.
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
    </AppLayout>
  );
}
