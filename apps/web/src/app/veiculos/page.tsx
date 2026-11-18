'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/layout/AppLayout';
import {
  Car,
  Search,
  Plus,
  AlertTriangle,
  X,
  AlertCircle,
  ShieldCheck,
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
];

export default function VeiculosPage() {
  const [vehicles, setVehicles] = useState<any[]>(initialVehicles);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    placa: '',
    renavam: '',
    chassi: '',
    marca: 'VOLKSWAGEN',
    modelo: 'POLO TRACK 1.0 FLEX',
    anoFabricacao: 2024,
    anoModelo: 2024,
    cor: 'PRATA',
    combustivel: 'FLEX',
    uf: 'SP',
    municipio: 'SÃO PAULO',
  });

  const loadVehicles = () => {
    fetchApi('/vehicles')
      .then((data) => {
        if (data && Array.isArray(data) && data.length > 0) {
          const mapped = data.map((v: any) => ({
            id: v.id,
            placa: v.placa,
            renavam: v.renavam,
            chassi: v.chassi,
            marca: v.marca,
            modelo: v.modelo,
            anoModelo: v.anoModelo || 2024,
            cor: v.cor || 'CINZA',
            combustivel: v.combustivel || 'FLEX',
            uf: v.uf || 'SP',
            proprietarioNome: v.cliente?.nome || v.cliente?.razaoSocial || 'Proprietário Registrado',
            temAlienacao: v.temAlienacao || (v.restrictions && v.restrictions.length > 0),
            processosAtivos: v.processes?.length || 0,
          }));
          setVehicles(mapped);
        }
      })
      .catch((err) => console.warn('Usando dados de contingência para veículos:', err));
  };

  useEffect(() => {
    loadVehicles();
  }, []);

  const handleCreateVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.placa || !formData.renavam) {
      setFormError('Informe a placa e o renavam do veículo.');
      return;
    }

    setSubmitting(true);
    setFormError(null);

    try {
      await fetchApi('/vehicles', {
        method: 'POST',
        body: JSON.stringify({
          placa: formData.placa.toUpperCase().trim(),
          renavam: formData.renavam.trim(),
          chassi: formData.chassi.toUpperCase().trim() || `9BR${formData.placa.toUpperCase()}123456`,
          marca: formData.marca,
          modelo: formData.modelo,
          anoFabricacao: Number(formData.anoFabricacao) || 2024,
          anoModelo: Number(formData.anoModelo) || 2024,
          cor: formData.cor,
          combustivel: formData.combustivel,
          uf: formData.uf,
          municipio: formData.municipio,
        }),
      });

      setIsModalOpen(false);
      setFormData({
        placa: '',
        renavam: '',
        chassi: '',
        marca: 'VOLKSWAGEN',
        modelo: 'POLO TRACK 1.0 FLEX',
        anoFabricacao: 2024,
        anoModelo: 2024,
        cor: 'PRATA',
        combustivel: 'FLEX',
        uf: 'SP',
        municipio: 'SÃO PAULO',
      });
      loadVehicles();
    } catch (err: any) {
      setFormError(err.message || 'Erro ao cadastrar veículo no banco.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredVehicles = vehicles.filter(
    (v) =>
      v.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.renavam.includes(searchTerm) ||
      (v.modelo && v.modelo.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (v.proprietarioNome && v.proprietarioNome.toLowerCase().includes(searchTerm.toLowerCase())),
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
            Frota cadastrada no Supabase, histórico e restrições veiculares.
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
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-purple-600/30 hover:bg-purple-700 transition"
          >
            <Plus className="h-4 w-4" />
            Cadastrar Veículo
          </button>
        </div>
      </div>

      {/* Search Box */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar veículo por Placa, Renavam, Modelo ou Proprietário..."
          className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-xs sm:text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-purple-600 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
        />
      </div>

      {/* Vehicles Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredVehicles.map((v) => (
          <div
            key={v.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-purple-300 hover:shadow-md transition dark:border-slate-800 dark:bg-slate-900 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="rounded bg-slate-950 px-2.5 py-1 font-mono text-xs sm:text-sm font-black text-white border border-slate-800">
                {v.placa}
              </span>
              <span className="text-[11px] font-bold text-slate-500 uppercase">
                {v.uf} • {v.anoModelo}
              </span>
            </div>

            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white line-clamp-1">
                {v.marca} {v.modelo}
              </h3>
              <p className="text-xs text-slate-500 truncate">{v.proprietarioNome}</p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] border-y border-slate-100 dark:border-slate-800 py-2">
              <div>
                <span className="text-slate-400">Renavam:</span>
                <p className="font-mono font-bold text-slate-700 dark:text-slate-300">{v.renavam}</p>
              </div>
              <div>
                <span className="text-slate-400">Cor / Comb.:</span>
                <p className="font-bold text-slate-700 dark:text-slate-300 truncate">
                  {v.cor} • {v.combustivel}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              {v.temAlienacao ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-400">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Alienação Fiduciária
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Sem Gravames
                </span>
              )}

              <Link
                href={`/detran?placa=${v.placa}`}
                className="text-xs font-bold text-purple-600 hover:text-purple-700 dark:text-purple-400"
              >
                Consultar Débitos →
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Cadastrar Veículo */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Car className="h-5 w-5 text-purple-600" />
                Cadastrar Novo Veículo no Banco
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

            <form onSubmit={handleCreateVehicle} className="space-y-3.5 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                    Placa (Mercosul / Antiga)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: BRA2E19"
                    value={formData.placa}
                    onChange={(e) => setFormData({ ...formData, placa: e.target.value.toUpperCase() })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-mono font-bold uppercase focus:outline-none focus:ring-2 focus:ring-purple-600 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                    Código RENAVAM
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 12345678901"
                    value={formData.renavam}
                    onChange={(e) => setFormData({ ...formData, renavam: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-mono focus:outline-none focus:ring-2 focus:ring-purple-600 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                    Marca
                  </label>
                  <input
                    type="text"
                    value={formData.marca}
                    onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 focus:outline-none focus:ring-2 focus:ring-purple-600 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                    Modelo
                  </label>
                  <input
                    type="text"
                    value={formData.modelo}
                    onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 focus:outline-none focus:ring-2 focus:ring-purple-600 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                    Ano Modelo
                  </label>
                  <input
                    type="number"
                    value={formData.anoModelo}
                    onChange={(e) => setFormData({ ...formData, anoModelo: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-mono focus:outline-none focus:ring-2 focus:ring-purple-600 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                    Cor
                  </label>
                  <input
                    type="text"
                    value={formData.cor}
                    onChange={(e) => setFormData({ ...formData, cor: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 focus:outline-none focus:ring-2 focus:ring-purple-600 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                    UF
                  </label>
                  <select
                    value={formData.uf}
                    onChange={(e) => setFormData({ ...formData, uf: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-600 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  >
                    <option value="SP">SP</option>
                    <option value="RJ">RJ</option>
                    <option value="MG">MG</option>
                    <option value="PR">PR</option>
                    <option value="SC">SC</option>
                    <option value="RS">RS</option>
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
                  {submitting ? 'Salvando no Banco...' : 'Salvar Veículo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
