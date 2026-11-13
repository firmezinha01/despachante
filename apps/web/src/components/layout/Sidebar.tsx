'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  KanbanSquare,
  Car,
  Users,
  DollarSign,
  Receipt,
  FileCheck2,
  MessageSquare,
  Building2,
  ShieldCheck,
  QrCode,
  Globe2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  {
    group: 'VISÃO GERAL',
    items: [
      { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    ],
  },
  {
    group: 'OPERACIONAL VEICULAR',
    items: [
      { name: 'Processos & Workflow', href: '/processos', icon: KanbanSquare },
      { name: 'Cadastro de Veículos', href: '/veiculos', icon: Car },
      { name: 'Terminal DETRAN / Senatran', href: '/detran', icon: Globe2 },
      { name: 'Gestão Documental & OCR', href: '/processos?tab=docs', icon: FileCheck2 },
    ],
  },
  {
    group: 'CRM & CLIENTES',
    items: [
      { name: 'Clientes (PF e PJ)', href: '/clientes', icon: Users },
    ],
  },
  {
    group: 'FINANCEIRO & PIX',
    items: [
      { name: 'Contas & Repasses', href: '/financeiro', icon: DollarSign },
      { name: 'Cobranças PIX', href: '/financeiro?tab=pix', icon: QrCode },
      { name: 'DRE & Relatórios', href: '/financeiro?tab=dre', icon: Receipt },
    ],
  },
  {
    group: 'COMUNICAÇÃO & PORTAL',
    items: [
      { name: 'Central WhatsApp', href: '/whatsapp', icon: MessageSquare },
      { name: 'Portal do Cliente', href: '/portal/PROC-2026-0001', icon: ShieldCheck, target: '_blank' },
    ],
  },
  {
    group: 'CONFIGURAÇÕES',
    items: [
      { name: 'Empresa & Filiais', href: '/configuracoes', icon: Building2 },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-purple-900/20 bg-slate-950 text-slate-100 shadow-xl">
      {/* Brand Header */}
      <div className="flex h-16 items-center gap-3 border-b border-purple-900/30 px-6 bg-gradient-to-r from-purple-950/60 to-slate-950">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600 text-white shadow-lg shadow-purple-600/30 font-black tracking-wider">
          BR
        </div>
        <div>
          <span className="block text-xs font-semibold uppercase tracking-wider text-purple-400">
            DESPACHANTE ERP
          </span>
          <span className="block text-base font-extrabold tracking-tight text-white">
            BRASIL
          </span>
        </div>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        {navigation.map((group) => (
          <div key={group.group}>
            <p className="px-3 text-[10px] font-bold tracking-wider text-purple-400/80 uppercase">
              {group.group}
            </p>
            <nav className="mt-2 space-y-1">
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    target={item.target}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150',
                      isActive
                        ? 'bg-purple-600/20 text-purple-300 border-l-4 border-purple-500 font-semibold shadow-sm'
                        : 'text-slate-400 hover:bg-purple-950/40 hover:text-purple-200',
                    )}
                  >
                    <Icon className={cn('h-4 w-4', isActive ? 'text-purple-400' : 'text-slate-400')} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Tenant & Active User Badge */}
      <div className="border-t border-purple-900/30 bg-purple-950/30 p-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-purple-700/50 border border-purple-500/40 flex items-center justify-center font-bold text-xs text-purple-200">
            RA
          </div>
          <div className="flex-1 truncate">
            <p className="text-xs font-bold text-white truncate">Roberto Alencar</p>
            <p className="text-[11px] text-purple-300/80 truncate">Despachante Central Brasil</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
