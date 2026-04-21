// ARCHITECT NOTE:
// We use a Discriminated Union for Transaction because it allows the TypeScript compiler
// to narrow down the exact properties available based on the 'type' discriminant.
// This prevents errors like accessing 'source' on an Expense, ensuring robust type safety
// and making our switch/if statements exhaustive and predictable.

export type ExpenseCategory = 'Food' | 'Transport' | 'Rent' | 'Shopping';
export type IncomeSource = 'Salary' | 'Freelance' | 'Investments';

interface BaseTransaction {
  id: string;
  amount: number;
  description: string;
  date: number;
}

export interface Expense extends BaseTransaction {
  type: 'expense';
  category: ExpenseCategory;
}

export interface Income extends BaseTransaction {
  type: 'income';
  source: IncomeSource;
}

export type Transaction = Expense | Income;

export interface FinanceSummary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
}

export interface User {
  email: string;
  name?: string;
}

