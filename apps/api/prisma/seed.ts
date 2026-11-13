import { PrismaClient, PlanType, SubscriptionStatus, CustomerType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Iniciando Seed do DESPACHANTE ERP BRASIL...');

  // 1. Planos SaaS
  console.log('📦 Criando Planos SaaS...');
  const starterPlan = await prisma.plan.upsert({
    where: { tipo: PlanType.STARTER },
    update: {},
    create: {
      nome: 'Plano Despachante Solo',
      tipo: PlanType.STARTER,
      descricao: 'Ideal para despachantes autônomos e pequenos escritórios',
      precoMensal: 199.90,
      limiteUsuarios: 2,
      limiteProcessos: 150,
      limiteStorageMb: 2048,
      limiteWhatsApps: 1,
      suportaNfse: true,
      suportaOcr: true,
      suportaDetran: true,
    },
  });

  const proPlan = await prisma.plan.upsert({
    where: { tipo: PlanType.PROFISSIONAL },
    update: {},
    create: {
      nome: 'Plano Escritório Profissional',
      tipo: PlanType.PROFISSIONAL,
      descricao: 'Para escritórios consolidados com múltiplos operadores e alta demanda',
      precoMensal: 449.90,
      limiteUsuarios: 10,
      limiteProcessos: 1000,
      limiteStorageMb: 10240,
      limiteWhatsApps: 3,
      suportaNfse: true,
      suportaOcr: true,
      suportaDetran: true,
    },
  });

  // 2. Tenant Principal (Despachante Exemplo)
  console.log('🏢 Criando Tenant Principal...');
  const tenant = await prisma.tenant.upsert({
    where: { cnpj: '12.345.678/0001-90' },
    update: {},
    create: {
      razaoSocial: 'DESPACHANTE CENTRAL BRASIL LTDA',
      nomeFantasia: 'Despachante Central Brasil',
      cnpj: '12.345.678/0001-90',
      ie: '123.456.789.110',
      im: '987654-1',
      email: 'contato@despachantecentral.com.br',
      telefone: '(11) 3456-7890',
      whatsapp: '(11) 98765-4321',
      cep: '01310-100',
      logradouro: 'Avenida Paulista',
      numero: '1000',
      complemento: 'Conjunto 101',
      bairro: 'Bela Vista',
      cidade: 'São Paulo',
      uf: 'SP',
      responsavelNome: 'Roberto Alencar',
      responsavelCpf: '111.222.333-44',
      crddNumero: 'SP-04821',
      corPrimaria: '#7C3AED',
      corSecundaria: '#4C1D95',
      ativo: true,
    },
  });

  // 3. Assinatura do Tenant
  await prisma.subscription.upsert({
    where: { tenantId: tenant.id },
    update: {},
    create: {
      tenantId: tenant.id,
      planId: proPlan.id,
      status: SubscriptionStatus.ATIVO,
      valorCobrado: 449.90,
      diaVencimento: 10,
    },
  });

  // 4. Filiais
  console.log('🏬 Criando Filiais...');
  const matrizSp = await prisma.branch.create({
    data: {
      tenantId: tenant.id,
      nome: 'Matriz - São Paulo (Paulista)',
      codigo: 'SP-01',
      cidade: 'São Paulo',
      uf: 'SP',
      isMatriz: true,
      ativo: true,
    },
  });

  const filialRj = await prisma.branch.create({
    data: {
      tenantId: tenant.id,
      nome: 'Filial - Rio de Janeiro (Barra)',
      codigo: 'RJ-01',
      cidade: 'Rio de Janeiro',
      uf: 'RJ',
      isMatriz: false,
      ativo: true,
    },
  });

  // 5. Usuários com Senha Criptografada
  console.log('👥 Criando Usuários com RBAC...');
  const passwordHash = await bcrypt.hash('Admin@123456', 10);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@despachante.com.br' },
    update: {},
    create: {
      tenantId: tenant.id,
      branchId: matrizSp.id,
      nome: 'Roberto Alencar (Diretor / Despachante)',
      email: 'admin@despachante.com.br',
      senhaHash: passwordHash,
      telefone: '(11) 98765-4321',
      cargo: 'Proprietário & Despachante Responsável',
      role: 'PROPRIETARIO',
      ativo: true,
    },
  });

  const operadorUser = await prisma.user.upsert({
    where: { email: 'operador@despachante.com.br' },
    update: {},
    create: {
      tenantId: tenant.id,
      branchId: matrizSp.id,
      nome: 'Mariana Souza',
      email: 'operador@despachante.com.br',
      senhaHash: passwordHash,
      telefone: '(11) 97777-8888',
      cargo: 'Analista Operacional Pleno',
      role: 'OPERACIONAL',
      ativo: true,
    },
  });

  const financeiroUser = await prisma.user.upsert({
    where: { email: 'financeiro@despachante.com.br' },
    update: {},
    create: {
      tenantId: tenant.id,
      branchId: matrizSp.id,
      nome: 'Juliana Mendes',
      email: 'financeiro@despachante.com.br',
      senhaHash: passwordHash,
      telefone: '(11) 96666-5555',
      cargo: 'Coordenadora Financeira',
      role: 'FINANCEIRO',
      ativo: true,
    },
  });

  // 6. Clientes (PF e PJ)
  console.log('👤 Criando Clientes (CRM)...');
  const clientePf = await prisma.customer.create({
    data: {
      tenantId: tenant.id,
      tipo: CustomerType.PF,
      nome: 'Carlos Eduardo Oliveira',
      cpf: '234.567.890-12',
      rg: '34.567.890-X',
      cnh: '01234567890',
      validadeCnh: new Date('2029-05-15'),
      email: 'carlos.oliveira@email.com',
      telefone: '(11) 98111-2233',
      whatsapp: '(11) 98111-2233',
      cep: '04538-133',
      logradouro: 'Rua Joaquim Floriano',
      numero: '450',
      bairro: 'Itaim Bibi',
      cidade: 'São Paulo',
      uf: 'SP',
      origemLead: 'Indicação',
      ativo: true,
    },
  });

  const clientePj = await prisma.customer.create({
    data: {
      tenantId: tenant.id,
      tipo: CustomerType.PJ,
      nome: 'BRASIL RENT A CAR E FROTAS S/A',
      razaoSocial: 'BRASIL RENT A CAR E FROTAS S/A',
      nomeFantasia: 'Brasil Frotas',
      cnpj: '76.543.210/0001-88',
      ie: '987.654.321.000',
      responsavelNome: 'Fernando Montenegro',
      responsavelCpf: '333.444.555-66',
      email: 'frotas@brasilrentacar.com.br',
      telefone: '(11) 4004-9900',
      whatsapp: '(11) 98888-9999',
      cep: '01419-002',
      logradouro: 'Alameda Santos',
      numero: '1800',
      bairro: 'Cerqueira César',
      cidade: 'São Paulo',
      uf: 'SP',
      origemLead: 'Contrato Corporativo',
      ativo: true,
    },
  });

  // 7. Veículos
  console.log('🚗 Cadastrando Veículos...');
  const veiculo1 = await prisma.vehicle.create({
    data: {
      tenantId: tenant.id,
      clienteId: clientePf.id,
      placa: 'BRA2E19',
      renavam: '12345678901',
      chassi: '9BRBD48E9K8123456',
      motor: '2ZR-FXE-45678',
      marca: 'TOYOTA',
      modelo: 'COROLLA ALTIS HYBRID',
      versao: '1.8 16V VVT-i',
      cor: 'Cinza Celestial',
      categoria: 'PARTICULAR',
      tipo: 'AUTOMOVEL',
      anoFabricacao: 2024,
      anoModelo: 2024,
      combustivel: 'HIBRIDO',
      uf: 'SP',
      municipio: 'São Paulo',
      temAlienacao: false,
      temSinistro: false,
    },
  });

  const veiculo2 = await prisma.vehicle.create({
    data: {
      tenantId: tenant.id,
      clienteId: clientePj.id,
      placa: 'ABC1D23',
      renavam: '98765432100',
      chassi: '9BG116DW4M0654321',
      motor: 'L4-TURBO-9811',
      marca: 'CHEVROLET',
      modelo: 'ONIX PLUS PREMIER',
      versao: '1.0 Turbo Flex Aut.',
      cor: 'Branco Summit',
      categoria: 'ALUGUEL',
      tipo: 'AUTOMOVEL',
      anoFabricacao: 2023,
      anoModelo: 2024,
      combustivel: 'FLEX',
      uf: 'SP',
      municipio: 'São Paulo',
      temAlienacao: true,
      temSinistro: false,
    },
  });

  // 8. Processos Veiculares
  console.log('📋 Criando Processos de Demonstração...');
  const processo1 = await prisma.process.create({
    data: {
      tenantId: tenant.id,
      branchId: matrizSp.id,
      clienteId: clientePf.id,
      veiculoId: veiculo1.id,
      responsavelId: operadorUser.id,
      criadoPorId: adminUser.id,
      protocolo: 'PROC-2026-0001',
      tipoServico: 'TRANSFERENCIA',
      status: 'PROTOCOLO_DETRAN',
      prioridade: 'ALTA',
      prazoSla: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // +3 dias
      valorHonorarios: 350.00,
      valorTaxas: 425.50, // Taxa de Transferência Detran-SP + Vistoria ECV
      valorTotal: 775.50,
      pago: true,
      protocoloDetran: 'SP-DETRAN-2026-9812451',
      orgaoUf: 'SP',
      observacoes: 'Transferência de propriedade com comunicação de venda já registrada.',
    },
  });

  // Etapas do Processo 1
  await prisma.processStage.createMany({
    data: [
      {
        processId: processo1.id,
        nomeEtapa: 'Triagem Documental',
        statusOrigem: 'TRIAGEM',
        statusNovo: 'COLETA_DOCUMENTOS',
        operadorNome: 'Mariana Souza',
        comentarios: 'CRV assinado digitalmente via ATPV-e validado.',
      },
      {
        processId: processo1.id,
        nomeEtapa: 'Pagamento de Taxas',
        statusOrigem: 'COLETA_DOCUMENTOS',
        statusNovo: 'PAGAMENTO_TAXAS',
        operadorNome: 'Juliana Mendes',
        comentarios: 'Guia DUA Detran emitida e liquidada via PIX.',
      },
      {
        processId: processo1.id,
        nomeEtapa: 'Protocolo no Órgão',
        statusOrigem: 'PAGAMENTO_TAXAS',
        statusNovo: 'PROTOCOLO_DETRAN',
        operadorNome: 'Mariana Souza',
        comentarios: 'Processo transmitido ao sistema e-CRVsp. Aguardando auditoria do Detran.',
      },
    ],
  });

  // Checklist do Processo 1
  await prisma.processChecklist.createMany({
    data: [
      {
        processId: processo1.id,
        descricao: 'Conferência do Laudo de Vistoria ECV Aprovado',
        obrigatorio: true,
        concluido: true,
        concluidoPor: 'Mariana Souza',
        concluidoEm: new Date(),
      },
      {
        processId: processo1.id,
        descricao: 'Validação da ATPV-e com reconhecimento ou assinatura Gov.br',
        obrigatorio: true,
        concluido: true,
        concluidoPor: 'Mariana Souza',
        concluidoEm: new Date(),
      },
      {
        processId: processo1.id,
        descricao: 'Certidão Negativa de Débitos e Multas (RENAVAM)',
        obrigatorio: true,
        concluido: true,
        concluidoPor: 'Mariana Souza',
        concluidoEm: new Date(),
      },
      {
        processId: processo1.id,
        descricao: 'Comprovante de pagamento da Taxa de Transferência DETRAN',
        obrigatorio: true,
        concluido: true,
        concluidoPor: 'Juliana Mendes',
        concluidoEm: new Date(),
      },
      {
        processId: processo1.id,
        descricao: 'Emissão e Entrega do CRLV-e Digital Final',
        obrigatorio: true,
        concluido: false,
      },
    ],
  });

  // Processo 2: Licenciamento Anual (Aguardando Pagamento PIX)
  const processo2 = await prisma.process.create({
    data: {
      tenantId: tenant.id,
      branchId: matrizSp.id,
      clienteId: clientePj.id,
      veiculoId: veiculo2.id,
      responsavelId: operadorUser.id,
      criadoPorId: adminUser.id,
      protocolo: 'PROC-2026-0002',
      tipoServico: 'LICENCIAMENTO',
      status: 'PAGAMENTO_TAXAS',
      prioridade: 'NORMAL',
      prazoSla: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // +1 dia
      valorHonorarios: 120.00,
      valorTaxas: 160.22, // Taxa anual Licenciamento
      valorTotal: 280.22,
      pago: false,
      orgaoUf: 'SP',
      observacoes: 'Licenciamento anual 2026 para frota corporativa.',
    },
  });

  // 9. Lançamentos Financeiros com Segregação Rígida de Honorários vs Taxas de Terceiros
  console.log('💰 Lançamentos Financeiros...');
  const txHonorarios = await prisma.financialTransaction.create({
    data: {
      tenantId: tenant.id,
      processId: processo1.id,
      clienteId: clientePf.id,
      tipo: 'RECEITA',
      categoria: 'HONORARIOS_SERVICO',
      isTaxaTerceiro: false, // RECEITA PRÓPRIA DO DESPACHANTE
      descricao: 'Honorários de Transferência - Processo PROC-2026-0001',
      valor: 350.00,
      formaPagamento: 'PIX',
      status: 'PAGO',
      dataVencimento: new Date(),
      dataPagamento: new Date(),
    },
  });

  const txTaxas = await prisma.financialTransaction.create({
    data: {
      tenantId: tenant.id,
      processId: processo1.id,
      clienteId: clientePf.id,
      tipo: 'RECEITA',
      categoria: 'TAXA_TRANSFERENCIA',
      isTaxaTerceiro: true, // VALOR EM TRÂNSITO (REPASSE DETRAN-SP)
      descricao: 'Taxa Oficial de Transferência DETRAN-SP (Repasse)',
      valor: 425.50,
      formaPagamento: 'PIX',
      status: 'PAGO',
      dataVencimento: new Date(),
      dataPagamento: new Date(),
    },
  });

  // Cobrança PIX Gerada para o Processo 2
  console.log('⚡ Criando Cobrança PIX com Payload EMVCo...');
  await prisma.pixCharge.create({
    data: {
      processId: processo2.id,
      txid: 'PIX20260002DESPACHANTE7799',
      valor: 280.22,
      chavePix: 'financeiro@despachantecentral.com.br',
      copiaECola: '00020101021226840014br.gov.bcb.pix2562pix-qr.despachantecentral.com.br/qr/v2/cobv/77995204000053039865406280.225802BR5925DESPACHANTE CENTRAL BRASI6009SAO PAULO62070503***63041D9A',
      qrCodeBase64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      status: 'PENDENTE',
      expiraEm: new Date(Date.now() + 2 * 3600 * 1000), // +2 horas
    },
  });

  // 10. WhatsApp Instance
  console.log('📱 Configurando Instância do WhatsApp...');
  await prisma.whatsAppInstance.create({
    data: {
      tenantId: tenant.id,
      nomeInstancia: 'Central de Atendimento e Avisos',
      numeroTelefone: '5511987654321',
      status: 'CONECTADO',
      iaAtiva: true,
    },
  });

  console.log('✅ SEED EXECUTADO COM SUCESSO!');
  console.log('----------------------------------------------------');
  console.log('Credenciais de Acesso:');
  console.log('Super Admin / Proprietário: admin@despachante.com.br | Senha: Admin@123456');
  console.log('Operacional: operador@despachante.com.br | Senha: Admin@123456');
  console.log('Financeiro: financeiro@despachante.com.br | Senha: Admin@123456');
  console.log('----------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('❌ Erro durante a execução do seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
