import { CurrencyCode } from '../types';

export interface CurrencyBreakdown {
  [currency: string]: number;
}

/**
  * Agrupa montos por moneda de forma estricta.
  * REGLA ABSOLUTA: Jamás sumar montos de distintas monedas.
  */
export function aggregateCurrencyAmounts(
  items: Array<{ amount: number; currency: CurrencyCode }>
): Record<CurrencyCode, number> {
  const totals: Record<CurrencyCode, number> = {
    COP: 0,
    USD: 0,
    CLP: 0,
    BRL: 0,
  };

  for (const item of items) {
    if (totals[item.currency] !== undefined) {
      totals[item.currency] += item.amount;
    }
  }

  return totals;
}

/**
 * Formatea un monto individual en su moneda nativa
 */
export function formatSingleCurrency(amount: number, currency: CurrencyCode): string {
  if (currency === 'COP') {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(amount);
  }

  if (currency === 'CLP') {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(amount);
  }

  if (currency === 'BRL') {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 2,
    }).format(amount);
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Convierte un acumulado de monedas en una cadena legible estricta:
 * Ej: "$45.000.000 COP + $2.500 USD" o "R$ 15.000 BRL"
 */
export function formatMultiCurrencyString(totals: Record<CurrencyCode, number>): string {
  const parts: string[] = [];

  if (totals.COP && totals.COP > 0) {
    parts.push(formatSingleCurrency(totals.COP, 'COP'));
  }
  if (totals.CLP && totals.CLP > 0) {
    parts.push(formatSingleCurrency(totals.CLP, 'CLP'));
  }
  if (totals.BRL && totals.BRL > 0) {
    parts.push(formatSingleCurrency(totals.BRL, 'BRL'));
  }
  if (totals.USD && totals.USD > 0) {
    parts.push(formatSingleCurrency(totals.USD, 'USD'));
  }

  if (parts.length === 0) {
    return '$0';
  }

  return parts.join(' + ');
}

