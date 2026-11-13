# DESPACHANTE ERP BRASIL 🇧🇷

> **Plataforma SaaS Multiempresa e Multitenant de Missão Crítica para Despachantes Veiculares, Redes, Frotistas, Revendas e Concessionárias do Brasil.**

---

## 🏛️ Visão Arquitetural

O **DESPACHANTE ERP BRASIL** foi projetado seguindo as mais exigentes práticas de engenharia de software para sistemas corporativos:
- **Domain-Driven Design (DDD)** com segregação de domínios e contextos delimitados (*Bounded Contexts*).
- **Clean Architecture** com desacoplamento total entre entidades de negócio, casos de uso e frameworks externos.
- **Isolamento Estrito Multi-Tenant** com `tenant_id` obrigatório em todas as tabelas e políticas de Row Level Security (RLS).
- **Motor de Workflow Veicular Configurável** para todos os 21 serviços de despachante com checklists dinâmicos obrigatórios e SLAs em tempo real.
- **Segregação Contábil Automatizada**: separação rígida entre **Honorários do Despachante** (receita própria tributável por ISS) e **Taxas de Órgãos Estaduais** (DUA, DAE, GRT, IPVA, multas - valores em trânsito).
- **Camada de Abstração DETRAN / SENATRAN**: arquitetura orientada a provedores (`IDetranProvider`), com implementações para **SP (e-CRVsp / Prodesp)**, **RJ (Detran-RJ)**, **MG (SIAEX)**, **PR (Detran-PR)** e **SENATRAN Nacional (RENAVE)**.
- **Motor PIX Nativo**: geração de payloads EMVCo com QR Code dinâmico e conciliação instantânea por Webhook.
- **Gestão Documental & OCR**: extração automática de dados de CNH, CRLV e ATPV-e.
- **Assinatura Eletrônica**: envelopes com suporte a Gov.br, Clicksign e assinatura interna qualificada com carimbo de tempo e hash SHA-256.
- **Portal do Cliente Mobile-First**: acompanhamento de status em tempo real, envio de comprovantes e pagamento via PIX.

---

## 💻 Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router, Server & Client Components)
- **UI & Estilização**: React 19, TailwindCSS, Shadcn UI, Lucide Icons
- **Identidade Visual**: Paleta predominante **Roxo Real / Deep Violet** (`#7C3AED`, `#6D28D9`, `#4C1D95`)
- **Gerenciamento de Estado & Cache**: TanStack React Query v5
- **Formulários & Validação**: React Hook Form, Zod

### Backend
- **Framework**: NestJS 11 (TypeScript, Modular DDD, CQRS)
- **ORM & Banco de Dados**: Prisma ORM, Supabase PostgreSQL com particionamento por Tenant
- **Cache & Filas**: Redis 7, BullMQ
- **Documentação de API**: Swagger / OpenAPI 3.0 em `/api/docs`
- **Validações Nacionais**: Módulo `@despachante/shared` com validadores de CPF, CNPJ, Renavam e Placas Mercosul

---

## 📂 Estrutura do Monorepo

```
despachante/
├── apps/
│   ├── api/                       # Backend NestJS 11
│   │   ├── prisma/                # Schema, Migrations e Seeds brasileiros
│   │   └── src/
│   │       ├── common/            # Guards, Interceptors, Tenancy, Filters
│   │       └── modules/
│   │           ├── auth/          # Autenticação JWT e RBAC
│   │           ├── companies/     # Gestão de Tenants e Filiais
│   │           ├── crm/           # Clientes PF e PJ
│   │           ├── vehicles/      # Cadastro Veicular e Restrições
│   │           ├── processes/     # Motor de Workflow e Checklists
│   │           ├── documents/     # Armazenamento e OCR Veicular
│   │           ├── signatures/    # Envelopes de Assinatura Eletrônica
│   │           ├── financial/     # Contas a Pagar/Receber e DRE
│   │           ├── pix/           # Gerador PIX EMVCo e Webhooks
│   │           ├── fiscal/        # NFS-e e NF-e
│   │           ├── detran/        # Provedores SP, RJ, MG, PR, Senatran
│   │           ├── whatsapp/      # Central WhatsApp Multicanal
│   │           ├── dashboard/     # Métricas e KPIs Consolidados
│   │           └── audit/         # Trilha de Auditoria LGPD
│   └── web/                       # Frontend Next.js 15 (App Router)
│       └── src/
│           ├── app/               # Rotas e páginas (Dashboard, Processos, Veículos, Detran, Financeiro, Portal)
│           ├── components/        # Layout, Sidebar, Header, Modais
│           └── lib/               # Cliente HTTP e Utilitários BR
├── packages/
│   └── shared/                    # Enums, Tipos, Schemas Zod e Validadores
├── docker/
│   ├── docker-compose.yml         # Orquestração de Containers
│   ├── Dockerfile.api
│   └── Dockerfile.web
└── package.json                   # Workspaces pnpm
```

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
- Node.js 20+ ou 22+
- pnpm 10+
- Docker & Docker Compose

### 1. Instalação de Dependências
```bash
pnpm install
```

### 2. Subir os Serviços (Banco PostgreSQL & Redis)
```bash
docker compose -f docker/docker-compose.yml up -d postgres redis
```

### 3. Gerar o Cliente do Banco de Dados e Rodar os Seeds
```bash
pnpm db:generate
pnpm db:seed
```

### 4. Iniciar Frontend e Backend em Modo Desenvolvimento
```bash
pnpm dev
```
- **Web ERP (Next.js 15)**: `http://localhost:3000`
- **API REST (NestJS)**: `http://localhost:3001/api/v1`
- **Swagger / OpenAPI**: `http://localhost:3001/api/docs`
- **Portal do Cliente**: `http://localhost:3000/portal/PROC-2026-0001`

---

## 🔑 Credenciais de Demonstração (Seed)

| Perfil | E-mail | Senha |
|---|---|---|
| **Super Admin / Despachante** | `admin@despachante.com.br` | `Admin@123456` |
| **Operacional** | `operador@despachante.com.br` | `Admin@123456` |
| **Financeiro** | `financeiro@despachante.com.br` | `Admin@123456` |
| **Cliente Portal** | `carlos.oliveira@email.com` | `Cliente@123456` |
