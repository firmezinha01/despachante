'use client';

import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import {
  Search,
  AlertTriangle,
  Download,
  CheckCircle2,
  Radio,
  FileText,
  KeyRound,
  ExternalLink,
  Activity,
  AlertCircle,
} from 'lucide-react';
import { formatBrl } from '@/lib/utils';
import { fetchApi } from '@/lib/api-client';

export default function DetranPage() {
  const [selectedUf, setSelectedUf] = useState('SP');
  const [placa, setPlaca] = useState('BRA2E19');
  const [renavam, setRenavam] = useState('12345678901');
  const [loading, setLoading] = useState(false);
  const [loadingGuia, setLoadingGuia] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusInfo, setStatusInfo] = useState<any>(null);
  const [guiaEmitida, setGuiaEmitida] = useState<any>(null);
  const [testingGateway, setTestingGateway] = useState(false);
  const [gatewayDiagnostic, setGatewayDiagnostic] = useState<any>(null);

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
    proprietarioNome: 'CARLOS EDUARDO SILVA',
    situacaoVeiculo: 'REGULAR',
    restricoes: ['ALIENACAO FIDUCIARIA: BANCO TOYOTA S/A'],
    totalDebitos: 425.50,
    debitos: [
      {
        tipo: 'IPVA',
        descricao: 'IPVA Exercício 2026 (Quitado)',
        valorOriginal: 0,
        status: 'PAGO',
      },
      {
        tipo: 'TAXA_TRANSFERENCIA',
        descricao: 'Taxa Estadual de Transferência (e-CRVsp)',
        valorOriginal: 265.28,
        status: 'ABERTO',
      },
      {
        tipo: 'TAXA_TRANSFERENCIA',
        descricao: 'Taxa de Laudo de Vistoria ECV',
        valorOriginal: 160.22,
        status: 'ABERTO',
      },
    ],
  });

  // Carrega status da infraestrutura DETRAN na inicialização
  useEffect(() => {
    fetchApi('/detran/status')
      .then((data) => setStatusInfo(data))
      .catch((err) => console.warn('Não foi possível carregar status DETRAN:', err));
  }, []);

  const handleConsultar = async () => {
    if (!placa) {
      setError('Por favor, informe a placa do veículo.');
      return;
    }

    setLoading(true);
    setError(null);
    setGuiaEmitida(null);

    try {
      const [veiculo, debitos] = await Promise.all([
        fetchApi(`/detran/consultar-veiculo?placa=${encodeURIComponent(placa)}&renavam=${encodeURIComponent(renavam)}&uf=${selectedUf}`),
        fetchApi(`/detran/consultar-debitos?placa=${encodeURIComponent(placa)}&renavam=${encodeURIComponent(renavam)}&uf=${selectedUf}`),
      ]);

      setResult({
        consultado: true,
        ...veiculo,
        totalDebitos: debitos?.totalDebitos ?? 0,
        debitos: debitos?.debitos || [],
      });
    } catch (err: any) {
      console.error('Erro na consulta DETRAN:', err);
      setError(err.message || 'Falha ao consultar DETRAN. Verifique a conexão com a API.');
    } finally {
      setLoading(false);
    }
  };

  const handleTestGateway = async () => {
    setTestingGateway(true);
    setGatewayDiagnostic(null);
    try {
      const res = await fetchApi('/detran/test-gateway');
      setGatewayDiagnostic(res);
    } catch (err: any) {
      setGatewayDiagnostic({ sucesso: false, mensagem: err.message });
    } finally {
      setTestingGateway(false);
    }
  };

  const handleEmitirGuia = async () => {
    setLoadingGuia(true);
    try {
      const guia = await fetchApi('/detran/emitir-guia', {
        method: 'POST',
        body: JSON.stringify({
          uf: selectedUf,
          tipoTaxa: 'TAXA_TRANSFERENCIA',
          dados: {
            placa,
            renavam,
            valor: result?.totalDebitos || 265.28,
          },
        }),
      });
      setGuiaEmitida(guia);
    } catch (err: any) {
      setError(err.message || 'Erro ao emitir guia oficial.');
    } finally {
      setLoadingGuia(false);
    }
  };

  return (
    <AppLayout>
      {/* Header com Status do Provedor */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Terminal DETRAN & SENATRAN
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Conexão direta com provedores estaduais (SP, RJ, MG, PR) e Base Federal BIN/RENAVE.
          </p>
        </div>

        {/* Badge de Conexão com Gateway e Diagnóstico */}
        <div className="flex flex-wrap items-center gap-2">
          <div className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-bold border ${
            statusInfo?.gatewayConectado
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
              : 'bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800'
          }`}>
            <Radio className={`h-3.5 w-3.5 ${statusInfo?.gatewayConectado ? 'text-emerald-500 animate-pulse' : 'text-purple-600'}`} />
            <span>
              {statusInfo?.gatewayConectado ? 'Gateway Infosimples: Configurado' : 'Ambiente: Sandbox / Sem Token'}
            </span>
          </div>

          <button
            onClick={handleTestGateway}
            disabled={testingGateway}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 shadow-xs transition"
          >
            <Activity className="h-3.5 w-3.5 text-purple-600" />
            {testingGateway ? 'Testando Token...' : 'Testar Token Infosimples'}
          </button>
        </div>
      </div>

      {/* Diagnóstico do Token */}
      {gatewayDiagnostic && (
        <div
          className={`rounded-xl border p-4 text-xs font-semibold ${
            gatewayDiagnostic.sucesso
              ? 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300'
              : 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300'
          }`}
        >
          <div className="flex items-start gap-2.5">
            {gatewayDiagnostic.sucesso ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <p className="font-bold">
                {gatewayDiagnostic.sucesso
                  ? 'Conexão com a Infosimples bem-sucedida! O token é válido.'
                  : `Retorno da Infosimples (Código ${gatewayDiagnostic.codigo || 'Erro'}):`}
              </p>
              {gatewayDiagnostic.tokenMasked && (
                <p className="text-[11px] font-mono text-purple-700 dark:text-purple-300">
                  Token detectado no Render: <strong>{gatewayDiagnostic.tokenMasked}</strong>
                </p>
              )}
              <p className="text-[11px] opacity-90">{gatewayDiagnostic.mensagem}</p>
              {!gatewayDiagnostic.sucesso && (
                <p className="text-[11px] text-amber-800 dark:text-amber-300 mt-1">
                  💡 Dica: Verifique se o token copiado no painel da Infosimples está completo e se sua conta possui saldo/créditos ativos de consulta.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

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
              <option value="SP">DETRAN-SP (e-CRVsp / Prodesp)</option>
              <option value="RJ">DETRAN-RJ (Proderj)</option>
              <option value="MG">DETRAN-MG (SIAEX / Prodemge)</option>
              <option value="PR">DETRAN-PR (Celepar)</option>
              <option value="BR">SENATRAN (Federal - BIN / RENAVE)</option>
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
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 p-2.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-purple-600/30 hover:bg-purple-700 transition disabled:opacity-50"
            >
              <Search className="h-4 w-4" />
              {loading ? 'Consultando na API...' : 'Consultar no DETRAN'}
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
                {result.situacaoVeiculo || 'SITUAÇÃO REGULAR'}
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
                Restrições & Gravames
              </h3>
              {result.restricoes && result.restricoes.length > 0 ? (
                result.restricoes.map((r: string, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-2.5 text-xs font-semibold text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300 mb-1.5"
                  >
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span>{r}</span>
                  </div>
                ))
              ) : (
                <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-2.5 text-xs font-semibold text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>Nenhuma restrição financeira, administrativa ou judicial encontrada.</span>
                </div>
              )}
            </div>
          </div>

          {/* Débitos & Guia Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4 flex flex-col justify-between">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mb-2">
                Débitos & Taxas Estaduais
              </h3>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs max-h-60 overflow-y-auto">
                {result.debitos && result.debitos.map((deb: any, idx: number) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{deb.descricao}</p>
                      <span
                        className={`text-[10px] font-bold ${
                          deb.status === 'PAGO' ? 'text-emerald-600' : 'text-amber-600'
                        }`}
                      >
                        {deb.status || (deb.valorTotal > 0 ? 'EM ABERTO' : 'PAGO')}
                      </span>
                    </div>
                    <span className="font-bold text-slate-900 dark:text-white shrink-0">
                      {formatBrl(deb.valorTotal ?? deb.valorOriginal ?? deb.valor ?? 0)}
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

              {guiaEmitida ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs dark:border-emerald-800 dark:bg-emerald-950/40 space-y-2">
                  <div className="flex items-center justify-between text-emerald-800 dark:text-emerald-300 font-bold">
                    <span>Guia Oficial Gerada com Sucesso!</span>
                    <span>{guiaEmitida.numeroGuia}</span>
                  </div>
                  <p className="font-mono text-[11px] text-slate-600 dark:text-slate-300 break-all">
                    Linha Digitável: {guiaEmitida.linhaDigitavel}
                  </p>
                  <a
                    href={guiaEmitida.pdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-emerald-600 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Abrir PDF da Guia
                  </a>
                </div>
              ) : (
                <button
                  onClick={handleEmitirGuia}
                  disabled={loadingGuia}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 p-2.5 text-xs font-bold text-white hover:bg-purple-700 transition shadow-md shadow-purple-600/20 disabled:opacity-50"
                >
                  <Download className="h-3.5 w-3.5" />
                  {loadingGuia ? 'Emitindo Guia Oficial...' : 'Emitir Guia Oficial DUA / DAE'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Dica para Ativação de Produção */}
      <div className="rounded-2xl border border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50 p-5 dark:border-purple-900/40 dark:from-purple-950/20 dark:to-slate-900">
        <div className="flex items-start gap-3">
          <KeyRound className="h-5 w-5 text-purple-600 mt-0.5 shrink-0" />
          <div className="space-y-1 text-xs">
            <h4 className="font-bold text-slate-900 dark:text-white">
              Integração com a API Infosimples Ativa
            </h4>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              O sistema se comunica diretamente com a API v2 da <strong>Infosimples</strong> (<code>https://api.infosimples.com/api/v2/consultas/detran/.../debitos-restricoes</code>) utilizando o token configurado no Render em <code>DETRAN_GATEWAY_TOKEN</code>. Clique no botão <strong>Testar Token Infosimples</strong> acima para diagnosticar o status do seu token e conferir se sua conta está autorizada para consultas estaduais.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
