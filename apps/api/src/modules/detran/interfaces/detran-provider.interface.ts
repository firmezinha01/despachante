export interface VeiculoConsultaResult {
  placa: string;
  renavam: string;
  chassi: string;
  motor?: string;
  marcaModelo: string;
  anoFabricacao: number;
  anoModelo: number;
  cor: string;
  combustivel: string;
  categoria: string;
  uf: string;
  municipio: string;
  proprietarioNome: string;
  proprietarioDocumento: string;
  situacaoVeiculo: 'REGULAR' | 'BLOQUEADO' | 'APREENDIDO' | 'ROUBO_FURTO';
  restricoes: string[];
}

export interface DebitoItem {
  id: string;
  tipo: 'IPVA' | 'LICENCIAMENTO' | 'MULTA' | 'DPVAT_SPVAT' | 'TAXA_TRANSFERENCIA';
  descricao: string;
  exercicio?: number;
  valorOriginal: number;
  jurosMulta: number;
  valorTotal: number;
  dataVencimento: string;
  orgaoAutuador?: string;
  codigoInfracao?: string;
}

export interface DebitosResult {
  placa: string;
  renavam: string;
  totalDebitos: number;
  temBloqueioJudicial: boolean;
  temComunicacaoVenda: boolean;
  debitos: DebitoItem[];
}

export interface GuiaTaxaResult {
  numeroGuia: string;
  codigoBarras: string;
  linhaDigitavel: string;
  valor: number;
  dataVencimento: string;
  pdfUrl?: string;
}

export interface ProtocoloResult {
  numeroProtocolo: string;
  status: 'EM_PROCESSAMENTO' | 'DEFERIDO' | 'EXIGENCIA' | 'INDEFERIDO';
  mensagem: string;
  dataHora: string;
}

export interface IDetranProvider {
  readonly uf: string;
  consultarVeiculo(placa: string, renavam: string): Promise<VeiculoConsultaResult>;
  consultarDebitos(placa: string, renavam: string): Promise<DebitosResult>;
  emitirGuiaTaxa(tipoTaxa: string, dados: any): Promise<GuiaTaxaResult>;
  transmitirProcesso(dadosProcesso: any): Promise<ProtocoloResult>;
}
