export enum FiscalDocumentTypeEnum {
  NFSE = 'NFSE', // Nota Fiscal de Serviços Eletrônica (Honorários)
  NFE = 'NFE',   // Nota Fiscal Eletrônica (Mercadorias/Placas)
  NFCE = 'NFCE', // Nota Fiscal ao Consumidor Eletrônica
  CTE = 'CTE',   // Conhecimento de Transporte
  MDFE = 'MDFE', // Manifesto Eletrônico de Documentos Fiscais
  SAT = 'SAT',   // Sistema Autenticador e Transmissor de Cupons Fiscais
  CFE = 'CFE',   // Cupom Fiscal Eletrônico
}

export enum FiscalStatusEnum {
  RASCUNHO = 'RASCUNHO',
  EM_PROCESSAMENTO = 'EM_PROCESSAMENTO',
  AUTORIZADO = 'AUTORIZADO',
  REJEITADO = 'REJEITADO',
  CANCELADO = 'CANCELADO',
  DENEGADO = 'DENEGADO',
  INUTILIZADO = 'INUTILIZADO',
}

export enum CRTEnum {
  SIMPLES_NACIONAL = 'SIMPLES_NACIONAL',
  SIMPLES_NACIONAL_EXCESSO = 'SIMPLES_NACIONAL_EXCESSO',
  REGIME_NORMAL = 'REGIME_NORMAL',
}

export enum FiscalProviderTypeEnum {
  PLUGNOTAS = 'PLUGNOTAS',
  TECNOSPEED = 'TECNOSPEED',
  FOCUS_NFE = 'FOCUS_NFE',
  SEFAZ_DIRETA = 'SEFAZ_DIRETA',
  MOCK = 'MOCK',
}
