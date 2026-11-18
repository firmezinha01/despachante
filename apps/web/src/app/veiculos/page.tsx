'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/layout/AppLayout';
import {
  Car,
  Search,
  Plus,
  AlertTriangle,
} from 'lucide-react';
import { fetchApi } from '@/lib/api-client';

const initialVehicles = [
  {
    id: 'v1',
    placa: 'BRA2E19',
    renavam: '12345678901',
    chassi: '9BRBD48E9K8123456',
    marca: 'TOYOTA',
    modelo: 'COROLLA ALTIS HYBRID',
    anoModelo: 2024,
    cor: 'Cinza Celestial',
    combustivel: 'HIBRIDO',
    uf: 'SP',
    proprietarioNome: 'Carlos Eduardo Oliveira',
    temAlienacao: true,
    processosAtivos: 1,
  },
  {
    id: 'v2',
    placa: 'ABC1D23',
    renavam: '98765432100',
    chassi: '9BG116DW4M0654321',
    marca: 'CHEVROLET',
    modelo: 'ONIX PLUS PREMIER',
    anoModelo: 2024,
    cor: 'Branco Summit',
    combustivel: 'FLEX',
    uf: 'SP',
    proprietarioNome: 'Brasil Rent a Car S/A',
    temAlienacao: false,
    processosAtivos: 1,
  },
  {
    id: 'v3',
    placa: 'XYZ9876',
    renavam: '11223344556',
    chassi: '9BWDB41J28P789123',
    marca: 'VOLKSWAGEN',
    modelo: 'POLO TRACK',
    anoModelo: 2024,
    cor: 'Prata Sirius',
    combustivel: 'FLEX',
    uf: 'PR',
    proprietarioNome: 'Mariana Duarte Souza',
    temAlienacao: false,
    processosAtivos: 1,
  },
];

export default function VeiculosPage() {
  const [vehicles, setVehicles] = useState<any[]>(initialVehicles);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchApi('/vehicles')
      .then((data) => {
        if (data && Array.isArray(data) && data.length > 0) {
          const mapped = data.map((v: any) => ({
            id: v.id,
            placa: v.placa,
            renavam: v.renavam,
            chassi: v.chassi,
            marca: v.marca || v.marcaModelo?.split('/')[0] || 'NÃO INFORMADO',
            modelo: v.marcaModelo || 'MODELO',
            anoModelo: v.anoModelo || 2024,
            cor: v.cor || 'CINZA',
            combustivel: v.combustivel || 'FLEX',
            uf: v.uf || 'SP',
            proprietarioNome: v.customer?.nome || v.customer?.razaoSocial || 'Proprietário',
            temAlienacao: v.restrictions && v.restrictions.length > 0,
            processosAtivos: v.processes?.length || 0,
          }));
          setVehicles(mapped);
        }
      })
      .catch((err) => console.warn('Usando dados de contingência para veículos:', err));
  }, []);

  const filteredVehicles = vehicles.filter(
    (v) =>
      v.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.renavam.includes(searchTerm) ||
      v.modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.proprietarioNome.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Cadastro de Veículos
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Frota cadastrada, histórico e restrições veiculares.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/detran"
            className="inline-flex items-center gap-1.5 rounded-xl border border-purple-200 bg-purple-50 px-3.5 py-2 text-xs sm:text-sm font-semibold text-purple-700 hover:bg-purple-100 dark:border-purple-900 dark:bg-purple-950/40 dark:text-purple-300"
          >
            <Search className="h-4 w-4" />
            Consulta DETRAN
          </Link>
          <button className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-purple-600/30 hover:bg-purple-700 transition">
            <Plus className="h-4 w-4" />
            Cadastrar
          </button>
        </div>
      </div>

      {/* Search Box */}
      <div className="flex w-full max-w-md items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs sm:text-sm shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <Search className="h-4 w-4 text-slate-400 shrink-0" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filtrar por Placa, Renavam, Modelo..."
          className="w-full bg-transparent focus:outline-none dark:text-slate-100"
        />
      </div>

      {/* Vehicle Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredVehicles.map((v) => (
          <div
            key={v.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3.5 hover:border-purple-400 transition"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="rounded bg-slate-950 px-2 py-0.5 font-mono text-xs sm:text-sm font-black text-white border border-slate-700 tracking-wider">
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
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white line-clamp-1">
                {v.marca} {v.modelo}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Cor: {v.cor} • {v.combustivel}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-2.5 dark:bg-slate-950/60 text-xs space-y-1">
              <p className="text-slate-500 dark:text-slate-400 truncate">
                Renavam: <strong className="text-slate-700 dark:text-slate-200 font-mono">{v.renavam}</strong>
              </p>
              <p className="text-slate-500 dark:text-slate-400 truncate">
                Proprietário: <strong className="text-slate-700 dark:text-slate-200">{v.proprietarioNome}</strong>
              </p>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] sm:text-[11px]">
              {v.temAlienacao && (
                <span className="inline-flex items-center gap-1 rounded bg-amber-100 px-2 py-0.5 font-bold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                  <AlertTriangle className="h-3 w-3" />
                  Alienação Fiduciária
                </span>
              )}
              <span className="inline-flex items-center gap-1 rounded bg-purple-100 px-2 py-0.5 font-bold text-purple-800 dark:bg-purple-950/60 dark:text-purple-300">
                {v.processosAtivos} processo ativo
              </span>
            </div>
          </div>
        ))}
      </div>
    </AppLayout>
  );
}
