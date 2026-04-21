import React, { useState, useEffect } from 'react';
import { useFinance } from './hooks/useFinance';
import type { Transaction, ExpenseCategory, IncomeSource, User } from './domain/types';
import { getUser, logoutUser } from './services/storage';
import { Auth } from './components/Auth';
import './App.css';

function App() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setUser(getUser());
  }, []);

  const { transactions, addTransaction, removeTransaction, totalIncome, totalExpenses, balance } = useFinance();
  
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [category, setCategory] = useState<ExpenseCategory | IncomeSource>('Food');

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value as 'income' | 'expense';
    setType(newType);
    setCategory(newType === 'expense' ? 'Food' : 'Salary');
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!amount || !description) return;

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    const newTransaction: Transaction = type === 'expense'
      ? {
          id: crypto.randomUUID(),
          type: 'expense',
          amount: parsedAmount,
          description,
          date: Date.now(),
          category: category as ExpenseCategory,
        }
      : {
          id: crypto.randomUUID(),
          type: 'income',
          amount: parsedAmount,
          description,
          date: Date.now(),
          source: category as IncomeSource,
        };

    addTransaction(newTransaction);
    setAmount('');
    setDescription('');
  };

  const expenseCategories: ExpenseCategory[] = ['Food', 'Transport', 'Rent', 'Shopping'];
  const incomeSources: IncomeSource[] = ['Salary', 'Freelance', 'Investments'];

  if (!user) {
    return <Auth />;
  }

  const handleLogout = () => {
    logoutUser();
    window.location.reload();
  };

  return (
    <div className="container">
      <header className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Persona Finance</h1>
        <button onClick={handleLogout} className="btn-delete" style={{ fontSize: '1rem', padding: '0.5rem 1rem', border: '1px solid var(--slate-700)', borderRadius: 'var(--radius-md)' }}>Logout</button>
      </header>

      <div className="summary-cards">
        <div className="card balance">
          <h2>Balance</h2>
          <p className={balance >= 0 ? 'text-emerald' : 'text-rose'}>${balance.toFixed(2)}</p>
        </div>
        <div className="card income">
          <h2>Income</h2>
          <p className="text-emerald">${totalIncome.toFixed(2)}</p>
        </div>
        <div className="card expense">
          <h2>Expenses</h2>
          <p className="text-rose">${totalExpenses.toFixed(2)}</p>
        </div>
      </div>

      <div className="main-content">
        <form className="transaction-form card" onSubmit={handleSubmit}>
          <h3>Add Transaction</h3>
          
          <div className="form-group">
            <label htmlFor="type">Type</label>
            <select id="type" value={type} onChange={handleTypeChange}>
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="category">
              {type === 'expense' ? 'Category' : 'Source'}
            </label>
            <select 
              id="category" 
              value={category} 
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCategory(e.target.value as ExpenseCategory | IncomeSource)}
            >
              {type === 'expense'
                ? expenseCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)
                : incomeSources.map(src => <option key={src} value={src}>{src}</option>)
              }
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <input 
              id="description"
              type="text" 
              value={description} 
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDescription(e.target.value)}
              placeholder="e.g. Groceries"
            />
          </div>

          <div className="form-group">
            <label htmlFor="amount">Amount ($)</label>
            <input 
              id="amount"
              type="number" 
              step="0.01"
              min="0"
              value={amount} 
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)}
              placeholder="0.00"
            />
          </div>

          <button type="submit" className="btn-primary">Add {type === 'expense' ? 'Expense' : 'Income'}</button>
        </form>

        <div className="transaction-list card">
          <h3>Recent Transactions</h3>
          {transactions.length === 0 ? (
            <p className="empty-state">No transactions yet. Start tracking!</p>
          ) : (
            <ul>
              {transactions.map(t => (
                <li key={t.id} className="transaction-item">
                  <div className="transaction-info">
                    <span className="transaction-desc">{t.description}</span>
                    <span className="transaction-meta">
                      {new Date(t.date).toLocaleDateString()} &bull; 
                      {/* ARCHITECT NOTE: 
                          This switch statement acts as a Type Guard that narrows the Discriminated Union.
                          The compiler now knows exactly whether we're dealing with an Expense or an Income,
                          allowing us to safely access 'category' or 'source' without any type assertions.
                          This guarantees our UI is perfectly in sync with our data model.
                      */}
                      {(() => {
                        switch(t.type) {
                          case 'expense':
                            return ` ${t.category}`;
                          case 'income':
                            return ` ${t.source}`;
                        }
                      })()}
                    </span>
                  </div>
                  <div className="transaction-actions">
                    <span className={`transaction-amount ${t.type === 'income' ? 'text-emerald' : 'text-rose'}`}>
                      {t.type === 'income' ? '+' : '-'}${t.amount.toFixed(2)}
                    </span>
                    <button 
                      onClick={() => removeTransaction(t.id)} 
                      className="btn-delete"
                      aria-label="Delete transaction"
                    >
                      &#x2715;
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
