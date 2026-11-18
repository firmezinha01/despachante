'use client';

import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import {
  Search,
  Plus,
  Building,
  User,
  X,
  AlertCircle,
  Mail,
  Phone,
  MapPin,
} from 'lucide-react';
import { fetchApi } from '@/lib/api-client';

const initialCustomers = [
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
];

export default function ClientesPage() {
  const [customers, setCustomers] = useState<any[]>(initialCustomers);
  const [filterTipo, setFilterTipo] = useState<'TODOS' | 'PF' | 'PJ'>('TODOS');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    tipo: 'PF',
    nome: '',
    cpf: '',
    rg: '',
    cnhNumero: '',
    razaoSocial: '',
    nomeFantasia: '',
    cnpj: '',
    email: '',
    telefone: '',
    whatsapp: '',
    cep: '01310-100',
    logradouro: 'Avenida Paulista',
    numero: '1000',
    bairro: 'Bela Vista',
    cidade: 'São Paulo',
    uf: 'SP',
  });

  const loadCustomers = () => {
    fetchApi('/crm/customers')
      .then((data) => {
        if (data && Array.isArray(data) && data.length > 0) {
          const mapped = data.map((c: any) => ({
            id: c.id,
            tipo: c.tipo,
            nome: c.nome || c.razaoSocial,
            razaoSocial: c.razaoSocial,
            nomeFantasia: c.nomeFantasia,
            cpf: c.cpf,
            cnpj: c.cnpj,
            cnh: c.cnh,
            email: c.email,
            telefone: c.telefone || c.whatsapp,
            cidade: c.cidade,
            uf: c.uf,
            totalVeiculos: c.vehicles?.length || 0,
            totalProcessos: c.processes?.length || 0,
          }));
          setCustomers(mapped);
        }
      })
      .catch((err) => console.warn('Usando dados locais para clientes:', err));
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.tipo === 'PF' && (!formData.nome || !formData.cpf)) {
      setFormError('Informe o nome e o CPF do cliente.');
      return;
    }
    if (formData.tipo === 'PJ' && (!formData.razaoSocial || !formData.cnpj)) {
      setFormError('Informe a Razão Social e o CNPJ da empresa.');
      return;
    }

    setSubmitting(true);
    setFormError(null);

    try {
      await fetchApi('/crm/customers', {
        method: 'POST',
        body: JSON.stringify({
          tipo: formData.tipo,
          nome: formData.tipo === 'PF' ? formData.nome : formData.razaoSocial,
          cpf: formData.tipo === 'PF' ? formData.cpf : undefined,
          rg: formData.rg || undefined,
          cnh: formData.cnhNumero || undefined,
          razaoSocial: formData.tipo === 'PJ' ? formData.razaoSocial : undefined,
          nomeFantasia: formData.tipo === 'PJ' ? formData.nomeFantasia : undefined,
          cnpj: formData.tipo === 'PJ' ? formData.cnpj : undefined,
          email: formData.email || `${Date.now()}@cliente.com`,
          telefone: formData.telefone || '(11) 99999-9999',
          whatsapp: formData.whatsapp || formData.telefone,
          cep: formData.cep,
          logradouro: formData.logradouro,
          numero: formData.numero,
          bairro: formData.bairro,
          cidade: formData.cidade,
          uf: formData.uf,
        }),
      });

      setIsModalOpen(false);
      setFormData({
        tipo: 'PF',
        nome: '',
        cpf: '',
        rg: '',
        cnhNumero: '',
        razaoSocial: '',
        nomeFantasia: '',
        cnpj: '',
        email: '',
        telefone: '',
        whatsapp: '',
        cep: '01310-100',
        logradouro: 'Avenida Paulista',
        numero: '1000',
        bairro: 'Bela Vista',
        cidade: 'São Paulo',
        uf: 'SP',
      });
      loadCustomers();
    } catch (err: any) {
      setFormError(err.message || 'Erro ao cadastrar cliente no banco.');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = customers.filter((c) => {
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
            Pessoas Físicas e Jurídicas, frotistas e concessionárias sincronizados no Supabase.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-purple-600/30 hover:bg-purple-700 transition"
        >
          <Plus className="h-4 w-4" />
          Novo Cliente
        </button>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por Nome, Razão Social, CPF ou CNPJ..."
            className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs sm:text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-purple-600 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
          />
        </div>

        <div className="flex items-center rounded-xl border border-slate-200 bg-white p-1 shadow-xs dark:border-slate-800 dark:bg-slate-900 self-start sm:self-auto">
          {(['TODOS', 'PF', 'PJ'] as const).map((tipo) => (
            <button
              key={tipo}
              onClick={() => setFilterTipo(tipo)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                filterTipo === tipo
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-purple-600 dark:text-slate-300'
              }`}
            >
              {tipo === 'TODOS' ? 'Todos' : tipo === 'PF' ? 'Pessoa Física' : 'Pessoa Jurídica'}
            </button>
          ))}
        </div>
      </div>

      {/* Customers List */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((c) => (
          <div
            key={c.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-purple-300 hover:shadow-md transition dark:border-slate-800 dark:bg-slate-900 space-y-3.5"
          >
            <div className="flex items-center justify-between">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${
                  c.tipo === 'PF'
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
                    : 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300'
                }`}
              >
                {c.tipo === 'PF' ? <User className="h-3 w-3" /> : <Building className="h-3 w-3" />}
                {c.tipo === 'PF' ? 'Pessoa Física' : 'Pessoa Jurídica'}
              </span>
              <span className="text-xs font-mono font-bold text-slate-500">
                {c.cpf || c.cnpj}
              </span>
            </div>

            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white line-clamp-1">
                {c.nome || c.razaoSocial}
              </h3>
              {c.nomeFantasia && (
                <p className="text-xs text-purple-600 dark:text-purple-400 font-medium truncate">
                  {c.nomeFantasia}
                </p>
              )}
            </div>

            <div className="space-y-1.5 text-xs text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-2.5">
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{c.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span>{c.telefone}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span>{c.cidade} - {c.uf}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Novo Cliente */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <User className="h-5 w-5 text-purple-600" />
                Cadastrar Novo Cliente no CRM
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

            <form onSubmit={handleCreateCustomer} className="space-y-3.5 text-xs sm:text-sm">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                  Tipo de Cadastro
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 font-semibold">
                    <input
                      type="radio"
                      name="tipo"
                      value="PF"
                      checked={formData.tipo === 'PF'}
                      onChange={() => setFormData({ ...formData, tipo: 'PF' })}
                      className="text-purple-600"
                    />
                    Pessoa Física (PF)
                  </label>
                  <label className="flex items-center gap-2 font-semibold">
                    <input
                      type="radio"
                      name="tipo"
                      value="PJ"
                      checked={formData.tipo === 'PJ'}
                      onChange={() => setFormData({ ...formData, tipo: 'PJ' })}
                      className="text-purple-600"
                    />
                    Pessoa Jurídica (PJ)
                  </label>
                </div>
              </div>

              {formData.tipo === 'PF' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                      Nome Completo
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: João da Silva"
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 focus:outline-none focus:ring-2 focus:ring-purple-600 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                      CPF
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="000.000.000-00"
                      value={formData.cpf}
                      onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-mono focus:outline-none focus:ring-2 focus:ring-purple-600 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                      Razão Social
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Auto Locadora Brasil Ltda"
                      value={formData.razaoSocial}
                      onChange={(e) => setFormData({ ...formData, razaoSocial: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 focus:outline-none focus:ring-2 focus:ring-purple-600 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                      CNPJ
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="00.000.000/0001-00"
                      value={formData.cnpj}
                      onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-mono focus:outline-none focus:ring-2 focus:ring-purple-600 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                    Telefone / WhatsApp
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="(11) 98765-4321"
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value, whatsapp: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 focus:outline-none focus:ring-2 focus:ring-purple-600 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                    E-mail
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="cliente@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 focus:outline-none focus:ring-2 focus:ring-purple-600 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                    Cidade
                  </label>
                  <input
                    type="text"
                    value={formData.cidade}
                    onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
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
                  {submitting ? 'Cadastrando no Banco...' : 'Cadastrar Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
