import { AllocationConfig, Commitment, Transaction, TransactionType, MeiCategory } from './types';

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const parseCurrencyInput = (value: string): number => {
  const numericValue = value.replace(/[^0-9]/g, '');
  return parseInt(numericValue, 10) / 100;
};

export const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

export const formatDate = (isoString: string): string => {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(date);
};

// Calculate tax amount based on profile
// Estimates for 2026 based on Minimum Wage ~ R$ 1.621
export const calculateTax = (revenue: number, type: string | null, rate: number, meiCategory?: MeiCategory): number => {
  if (type === 'MEI') {
    switch (meiCategory) {
      case 'COMMERCE': return 82.35; // INSS + ICMS
      case 'SERVICE': return 86.35; // INSS + ISS
      case 'MIXED': return 87.35; // INSS + ICMS + ISS
      case 'TRUCKER': return 194.52; // 12% Salario Minimo
      default: return 86.35; // Fallback to Service/Average
    }
  }
  return revenue * (rate / 100);
};

// Calculate allocation amount (Reserve or Growth)
export const calculateAllocation = (revenue: number, config: AllocationConfig): number => {
  if (!config.enabled) return 0;
  
  if (config.type === 'FIXED') {
    return config.value;
  }
  
  // Percentage
  return revenue * (config.value / 100);
};

export const calculateTotalCommitments = (commitments: Commitment[]): number => {
  if (!commitments || commitments.length === 0) return 0;
  return commitments.reduce((sum, item) => sum + item.value, 0);
};

export const calculateRunway = (reserveBalance: number, monthlyCommitments: number): number => {
  if (monthlyCommitments === 0) return 99; // Infinite/Safe
  return reserveBalance / monthlyCommitments;
};

// --- NEW TRANSACTION HELPERS ---

export const sumTransactionsByType = (transactions: Transaction[], type: TransactionType): number => {
  return transactions
    .filter(t => t.type === type)
    .reduce((sum, t) => sum + t.value, 0);
};

export const sumTransactionsByTypes = (transactions: Transaction[], types: TransactionType[]): number => {
  return transactions
    .filter(t => types.includes(t.type))
    .reduce((sum, t) => sum + t.value, 0);
};

export const getMonthName = (date: Date = new Date()): string => {
  return new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(date);
};