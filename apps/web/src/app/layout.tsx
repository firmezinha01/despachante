import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { QueryProvider } from '@/components/providers/QueryProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'DESPACHANTE ERP BRASIL - Plataforma SaaS de Gestão Veicular e Detran',
  description:
    'Sistema de missão crítica para despachantes veiculares, redes, frotistas e concessionárias do Brasil. Integrado com DETRAN, SENATRAN, Motor PIX e NFS-e.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className={`${inter.className} h-full bg-slate-50 text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-100`}>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
