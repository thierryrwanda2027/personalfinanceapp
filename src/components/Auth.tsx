import React, { useState } from 'react';
import { Login } from './Login';
import { Signup } from './Signup';
import '../App.css'; // Make sure styles are loaded

export function Auth() {
  const [view, setView] = useState<'login' | 'signup'>('login');

  return (
    <div className="auth-layout">
      <div className="auth-left">
        <div className="auth-left-content">
          <h1 className="auth-logo">finance</h1>
          <div className="auth-illustration-container">
             <img src="/auth_illustration.png" alt="Illustration" className="auth-illustration" />
          </div>
          <h2>Keep track of your money and save for your future</h2>
          <p>Personal finance app puts you in control of your spending. Track transactions, set budgets, and add to savings pots easily.</p>
        </div>
      </div>
      <div className="auth-right">
        <div className="auth-card">
          {view === 'login' ? (
            <Login onSwitchToSignup={() => setView('signup')} />
          ) : (
            <Signup onSwitchToLogin={() => setView('login')} />
          )}
        </div>
      </div>
    </div>
  );
}
