'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import {
  Car,
  Search,
  Plus,
  ShieldCheck,
  AlertTriangle,
  History,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';

const mockVehicles = [
  {
    id: 'v1',
    placa: 'BRA2E19',
    renavam: '12345678901',
    chassi: '9BRBD48E9K8123456',
    marca: 'TOYOTA',
    modelo: 'COROLLA ALTIS HYBRID',
    anoFabricacao: 2024,
    anoModelo: 2024,
    cor: 'Cinza Celestial',
    combustivel: 'HIBRIDO',
    categoria: 'PARTICULAR',
    uf: 'SP',
    proprietarioNome: 'Carlos Eduardo Oliveira',
    proprietarioDocumento: '234.567.890-12',
    temAlienacao: true,
    temSinistro: false,
    processosAtivos: 1,
  },
  {
    id: 'v2',
    placa: 'ABC1D23',
    renavam: '98765432100',
    chassi: '9BG116DW4M0654321',
    marca: 'CHEVROLET',
    modelo: 'ONIX PLUS PREMIER',
    anoFabricacao: 2023,
    anoModelo: 2024,
    cor: 'Branco Summit',
    combustivel: 'FLEX',
    categoria: 'ALUGUEL',
    uf: 'SP',
    proprietarioNome: 'Brasil Rent a Car e Frotas S/A',
    proprietarioDocumento: '76.543.210/0001-88',
    temAlienacao: false,
    temSinistro: false,
    processosAtivos: 1,
  },
  {
    id: 'v3',
    placa: 'XYZ9876',
    renavam: '11223344556',
    chassi: '9BWDB41J28P789123',
    marca: 'VOLKSWAGEN',
    modelo: 'POLO TRACK',
    anoFabricacao: 2024,
    anoModelo: 2024,
    cor: 'Prata Sirius',
    combustivel: 'FLEX',
    categoria: 'PARTICULAR',
    uf: 'PR',
    proprietarioNome: 'Mariana Duarte Souza',
    proprietarioDocumento: '345.678.901-23',
    temAlienacao: false,
    temSinistro: false,
    processosAtivos: 1,
  },
];

export default function VeiculosPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredVehicles = mockVehicles.filter(
    (v) =>
      v.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.renavam.includes(searchTerm) ||
      v.modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.proprietarioNome.toLowerCase().includes(searchTerm.toLowerCase()),
  );

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
                Cadastro e Gestão de Veículos
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Frota cadastrada, histórico de proprietários, restrições e consulta aos DETRANs.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/detran"
                className="inline-flex items-center gap-2 rounded-xl border border-purple-200 bg-purple-50 px-4 py-2.5 text-sm font-semibold text-purple-700 hover:bg-purple-100 dark:border-purple-900 dark:bg-purple-950/40 dark:text-purple-300"
              >
                <Search className="h-4 w-4" />
                Consulta BIN / DETRAN
              </Link>
              <button className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-600/30 hover:bg-purple-700 transition">
                <Plus className="h-4 w-4" />
                Cadastrar Veículo
              </button>
            </div>
          </div>

          {/* Search Box */}
          <div className="flex w-full max-w-md items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filtrar por Placa, Renavam, Modelo ou Proprietário..."
              className="w-full bg-transparent focus:outline-none dark:text-slate-100"
            />
          </div>

          {/* Vehicle Grid */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filteredVehicles.map((v) => (
              <div
                key={v.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4 hover:border-purple-400 transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-slate-950 px-2.5 py-1 font-mono text-sm font-black text-white border border-slate-700 tracking-wider">
                      {v.placa}
                    </span>
                    <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                      {v.uf}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-slate-400">
                    {v.anoModelo}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {v.marca} {v.modelo}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Cor: {v.cor} • Combustível: {v.combustivel}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-950/60 text-xs space-y-1">
                  <p className="text-slate-500 dark:text-slate-400">
                    Renavam: <strong className="text-slate-700 dark:text-slate-200">{v.renavam}</strong>
                  </p>
                  <p className="text-slate-500 dark:text-slate-400">
                    Proprietário: <strong className="text-slate-700 dark:text-slate-200">{v.proprietarioNome}</strong>
                  </p>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                  {v.temAlienacao && (
                    <span className="inline-flex items-center gap-1 rounded bg-amber-100 px-2 py-0.5 font-bold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                      <AlertTriangle className="h-3 w-3" />
                      Alienação Fiduciária
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 rounded bg-purple-100 px-2 py-0.5 font-bold text-purple-800 dark:bg-purple-950/60 dark:text-purple-300">
                    {v.processosAtivos} processo em andamento
                  </span>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
