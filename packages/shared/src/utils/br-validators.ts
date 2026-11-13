/**
 * Utilitários e Validadores para Padrões Brasileiros (CPF, CNPJ, Placas, Renavam, Moeda)
 */

export function isValidCpf(cpf: string): boolean {
  if (!cpf) return false;
  const clean = cpf.replace(/\D/g, '');
  if (clean.length !== 11 || /^(\d)\1{10}$/.test(clean)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(clean.charAt(i), 10) * (10 - i);
  }
  let check1 = 11 - (sum % 11);
  if (check1 >= 10) check1 = 0;
  if (check1 !== parseInt(clean.charAt(9), 10)) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(clean.charAt(i), 10) * (11 - i);
  }
  let check2 = 11 - (sum % 11);
  if (check2 >= 10) check2 = 0;
  return check2 === parseInt(clean.charAt(10), 10);
}

export function isValidCnpj(cnpj: string): boolean {
  if (!cnpj) return false;
  const clean = cnpj.replace(/\D/g, '');
  if (clean.length !== 14 || /^(\d)\1{13}$/.test(clean)) return false;

  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(clean.charAt(i), 10) * weights1[i];
  }
  let check1 = 11 - (sum % 11);
  if (check1 >= 10) check1 = 0;
  if (check1 !== parseInt(clean.charAt(12), 10)) return false;

  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(clean.charAt(i), 10) * weights2[i];
  }
  let check2 = 11 - (sum % 11);
  if (check2 >= 10) check2 = 0;
  return check2 === parseInt(clean.charAt(13), 10);
}

export function isValidPlaca(placa: string): boolean {
  if (!placa) return false;
  const clean = placa.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  if (clean.length !== 7) return false;
  // Padrão antigo: ABC1234
  const regexAntiga = /^[A-Z]{3}[0-9]{4}$/;
  // Padrão Mercosul: ABC1D23
  const regexMercosul = /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/;
  return regexAntiga.test(clean) || regexMercosul.test(clean);
}

export function isValidRenavam(renavam: string): boolean {
  if (!renavam) return false;
  const clean = renavam.replace(/\D/g, '');
  if (clean.length !== 9 && clean.length !== 11) return false;
  return true;
}

export function formatCpf(cpf: string): string {
  const clean = cpf.replace(/\D/g, '');
  return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

export function formatCnpj(cnpj: string): string {
  const clean = cnpj.replace(/\D/g, '');
  return clean.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
}

export function formatPlaca(placa: string): string {
  const clean = placa.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  if (clean.length === 7) {
    // Se for formato antigo (ABC1234), adiciona hífen: ABC-1234
    if (/^[A-Z]{3}[0-9]{4}$/.test(clean)) {
      return `${clean.slice(0, 3)}-${clean.slice(3)}`;
    }
    // Mercosul (ABC1D23) geralmente exibe sem hífen ou com hífen suave
    return clean;
  }
  return placa.toUpperCase();
}

export function formatBrlCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatBrDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d);
}

export function formatBrDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}
