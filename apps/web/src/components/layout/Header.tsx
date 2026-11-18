'use client';

import { useState } from 'react';
import { Search, Bell, Building, Menu, ChevronDown } from 'lucide-react';

interface HeaderProps {
  onOpenMobileMenu?: () => void;
}

export function Header({ onOpenMobileMenu }: HeaderProps) {
  const [selectedBranch, setSelectedBranch] = useState('Matriz - São Paulo');

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/90 px-4 sm:px-6 backdrop-blur-md dark:border-purple-900/30 dark:bg-slate-950/90">
      {/* Left: Mobile Menu Button & Search */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        {onOpenMobileMenu && (
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden rounded-xl border border-slate-200 p-2 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900"
            aria-label="Abrir menu de navegação"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        {/* Search Bar */}
        <div className="flex w-full items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-1.5 text-xs sm:text-sm dark:border-purple-900/30 dark:bg-slate-900/50">
          <Search className="h-4 w-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Buscar Placa, Renavam ou CPF..."
            className="w-full bg-transparent placeholder:text-slate-400 focus:outline-none dark:text-slate-100 text-xs sm:text-sm"
          />
          <kbd className="hidden rounded bg-slate-200/60 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 sm:inline-block dark:bg-purple-950/60 dark:text-purple-300">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3 pl-2">
        {/* Branch Switcher (Compact on mobile) */}
        <div className="hidden sm:flex items-center gap-1.5 rounded-lg border border-purple-200 bg-purple-50/60 px-2.5 py-1.5 text-xs font-medium text-purple-900 dark:border-purple-900/40 dark:bg-purple-950/40 dark:text-purple-300">
          <Building className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
          <span className="truncate max-w-[120px]">{selectedBranch}</span>
          <ChevronDown className="h-3 w-3 text-purple-600 dark:text-purple-400 shrink-0" />
        </div>

        {/* Realtime Status Indicator */}
        <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 sm:px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="hidden xs:inline sm:inline">DETRAN</span>
        </div>

        {/* Notifications */}
        <button
          className="relative rounded-xl p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-purple-950/50"
          aria-label="Notificações"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-purple-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-purple-600"></span>
          </span>
        </button>
      </div>
    </header>
  );
}
