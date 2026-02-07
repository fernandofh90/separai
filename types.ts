export enum CompanyType {
  MEI = 'MEI',
  PJ_SIMPLES = 'PJ_SIMPLES',
  AUTONOMO = 'AUTONOMO'
}

export type MeiCategory = 'COMMERCE' | 'SERVICE' | 'MIXED' | 'TRUCKER';

export enum SalaryMethod {
  FIXED = 'FIXED', // Pró-labore fixo
  PROFIT = 'PROFIT' // Retirada de lucro (percentual ou sobra)
}

export interface AllocationConfig {
  enabled: boolean;
  type: 'PERCENTAGE' | 'FIXED';
  value: number;
}

export type CommitmentType = 'PEOPLE' | 'SERVICE' | 'OBLIGATION';

export interface Commitment {
  id: string;
  name: string;
  type: CommitmentType;
  value: number;
}

// --- NEW ACTION-BASED TYPES ---

export type TransactionType = 'INCOME' | 'TAX' | 'SALARY' | 'RESERVE' | 'GROWTH' | 'COST';

export interface Transaction {
  id: string;
  type: TransactionType;
  value: number;
  date: string; // ISO Date
  description?: string;
}

export interface UserProfile {
  companyType: CompanyType | null;
  meiCategory?: MeiCategory; // Specific for MEI
  monthlyRevenue: number; // Stays as a "Reference/Target" revenue for setup, but Dashboard uses transactions
  salaryMethod: SalaryMethod | null;
  salaryValue: number; // Value in BRL if Fixed, or 0 if pure profit logic
  taxRate: number; // Percentage or Fixed Value for MEI
  
  // Level 2 - Maturity
  appLevel: 1 | 2 | 3;
  allocations: {
    reserve: AllocationConfig;
    growth: AllocationConfig;
  };

  // Level 3 - Structure
  currentReserveBalance: number; // Accumulated cash to calculate runway
  commitments: Commitment[];
  
  // Dynamic Data
  transactions: Transaction[];
  currentMonthOpen: boolean;
}

export type AppView = 'SPLASH' | 'ONBOARDING' | 'DASHBOARD' | 'DETAILS' | 'SETTINGS' | 'LEVEL_TWO_SETUP' | 'LEVEL_THREE_SETUP';

export interface AppState {
  currentView: AppView;
  userProfile: UserProfile;
  isSetupComplete: boolean;
}