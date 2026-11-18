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
  X,
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
      { name: 'DRE & Relatórios', href: '/financeiro?tab=dre', icon: Receipt },
    ],
  },
  {
    group: 'PORTAL DO CLIENTE',
    items: [
      { name: 'Portal Externo (Cliente)', href: '/portal/PROC-2026-0001', icon: ShieldCheck, target: '_blank' },
    ],
  },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();

  const sidebarContent = (
    <div className="flex h-full flex-col bg-slate-950 text-slate-100 border-r border-purple-900/20 shadow-xl">
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between border-b border-purple-900/30 px-6 bg-gradient-to-r from-purple-950/60 to-slate-950">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-600 text-white shadow-lg shadow-purple-600/30 font-black tracking-wider text-sm">
            BR
          </div>
          <div>
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-purple-400">
              DESPACHANTE ERP
            </span>
            <span className="block text-sm font-extrabold tracking-tight text-white">
              BRASIL
            </span>
          </div>
        </div>

        {/* Mobile close button */}
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden rounded-lg p-1.5 text-slate-400 hover:bg-slate-900 hover:text-white"
            aria-label="Fechar menu"
          >
            <X className="h-5 w-5" />
          </button>
        )}
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
                    onClick={() => {
                      if (onClose) onClose();
                    }}
                    className={cn(
                      'flex items-center gap-3 rounded-xl px-3 py-2 text-xs sm:text-sm font-medium transition-all duration-150',
                      isActive
                        ? 'bg-purple-600/25 text-purple-300 border-l-4 border-purple-500 font-semibold shadow-sm'
                        : 'text-slate-400 hover:bg-purple-950/40 hover:text-purple-200',
                    )}
                  >
                    <Icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-purple-400' : 'text-slate-400')} />
                    <span className="truncate">{item.name}</span>
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
          <div className="h-8 w-8 shrink-0 rounded-full bg-purple-700/50 border border-purple-500/40 flex items-center justify-center font-bold text-xs text-purple-200">
            RA
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">Roberto Alencar</p>
            <p className="text-[10px] text-purple-300/80 truncate">Despachante Central Brasil</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:flex lg:w-64 lg:flex-col">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop blur */}
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
            onClick={onClose}
          />
          {/* Drawer content */}
          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] shadow-2xl animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
