'use client';

import { useState } from 'react';
import { Search, Bell, Building, CheckCircle2, ChevronDown } from 'lucide-react';

export function Header() {
  const [selectedBranch, setSelectedBranch] = useState('Matriz - São Paulo (Paulista)');

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/80 px-6 backdrop-blur-md dark:border-purple-900/30 dark:bg-slate-950/80">
      {/* Search Bar */}
      <div className="flex w-96 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-1.5 text-sm dark:border-purple-900/30 dark:bg-slate-900/50">
        <Search className="h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Busca rápida por Placa, Renavam, CPF ou Protocolo..."
          className="w-full bg-transparent text-sm placeholder:text-slate-400 focus:outline-none dark:text-slate-100"
        />
        <kbd className="hidden rounded bg-slate-200/60 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 sm:inline-block dark:bg-purple-950/60 dark:text-purple-300">
          ⌘K
        </kbd>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Branch Switcher */}
        <div className="flex items-center gap-2 rounded-lg border border-purple-200 bg-purple-50/60 px-3 py-1.5 text-xs font-medium text-purple-900 dark:border-purple-900/40 dark:bg-purple-950/40 dark:text-purple-300">
          <Building className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
          <span>{selectedBranch}</span>
          <ChevronDown className="h-3 w-3 text-purple-600 dark:text-purple-400" />
        </div>

        {/* Realtime Status Indicator */}
        <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>DETRAN Conectado</span>
        </div>

        {/* Notifications */}
        <button className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-purple-950/50">
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
