import { useState, useMemo, useEffect } from 'react';
import type { Transaction, FinanceSummary } from '../domain/types';
import { saveToStorage, loadFromStorage, isTransactionArray } from '../services/storage';

const STORAGE_KEY = 'finance_transactions';

export function useFinance() {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    return loadFromStorage<Transaction[]>(STORAGE_KEY, isTransactionArray, []);
  });

  useEffect(() => {
    saveToStorage(STORAGE_KEY, transactions);
  }, [transactions]);

  const addTransaction = (transaction: Transaction) => {
    setTransactions((prev) => [...prev, transaction]);
  };

  const removeTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const summary = useMemo<FinanceSummary>(() => {
    let totalIncome = 0;
    let totalExpenses = 0;

    for (const t of transactions) {
      if (t.type === 'income') {
        totalIncome += t.amount;
      } else if (t.type === 'expense') {
        totalExpenses += t.amount;
      }
    }

    return {
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
    };
  }, [transactions]);

  return {
    transactions,
    addTransaction,
    removeTransaction,
    ...summary,
  };
}
