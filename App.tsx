import React, { useState, useEffect } from 'react';
import { Layout, Terminal, AlertTriangle } from 'lucide-react';
import Dashboard from './components/Dashboard';
import Analyzer from './components/Analyzer';
import BetHistory from './components/BetHistory';
import { BankrollState, Bet } from './types';
import { 
  INITIAL_BANKROLL, 
  CIRCUIT_BREAKER_THRESHOLD, 
  STANDARD_LIABILITY_PCT, 
  REDUCED_LIABILITY_PCT, 
  EXCHANGE_COMMISSION 
} from './constants';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'terminal' | 'history'>('terminal');
  
  // Application State
  const [bankrollState, setBankrollState] = useState<BankrollState>({
    currentCapital: INITIAL_BANKROLL,
    initialCapital: INITIAL_BANKROLL,
    totalBets: 0,
    wins: 0,
    losses: 0,
    maxDrawdown: 0,
    isCircuitBreakerActive: false
  });

  const [bets, setBets] = useState<Bet[]>([]);

  // Update Circuit Breaker Logic
  useEffect(() => {
    setBankrollState(prev => {
      const isCircuitBreakerActive = prev.currentCapital <= CIRCUIT_BREAKER_THRESHOLD;
      
      // Calculate Drawdown
      const currentDrawdown = prev.initialCapital - prev.currentCapital;
      const maxDrawdown = Math.max(prev.maxDrawdown, currentDrawdown);

      // Only update if changes to avoid infinite loop
      if (isCircuitBreakerActive !== prev.isCircuitBreakerActive || maxDrawdown !== prev.maxDrawdown) {
        return {
          ...prev,
          isCircuitBreakerActive,
          maxDrawdown
        };
      }
      return prev;
    });
  }, [bankrollState.currentCapital, bankrollState.initialCapital]);

  const handleAuthorizeBet = (horseName: string, raceCourse: string, bsp: number, analysis: string) => {
    // 1. Determine Target Liability based on Protocol (Section 5.3)
    const liabilityPct = bankrollState.isCircuitBreakerActive ? REDUCED_LIABILITY_PCT : STANDARD_LIABILITY_PCT;
    const targetLiability = bankrollState.currentCapital * liabilityPct;

    // 2. Calculate Stake
    const stake = targetLiability / (bsp - 1);

    const newBet: Bet = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
      horseName,
      raceCourse,
      bsp,
      stake,
      liability: targetLiability,
      result: 'PENDING',
      profit: 0,
      bankrollAfter: 0
    };

    setBets(prev => [newBet, ...prev]);
    alert(`BET PLACED: Laying ${horseName} for Stake £${stake.toFixed(2)} (Liability: £${targetLiability.toFixed(2)})`);
  };

  const handleResultBet = (id: string, result: 'WIN' | 'LOSS') => {
    setBets(prevBets => prevBets.map(bet => {
      if (bet.id !== id) return bet;

      let profit = 0;
      if (result === 'WIN') {
        // Lay Win = Horse Lost. 
        // Profit = Stake - Commission
        const grossProfit = bet.stake;
        profit = grossProfit * (1 - EXCHANGE_COMMISSION);
      } else {
        // Lay Loss = Horse Won.
        // Loss = Liability
        profit = -bet.liability;
      }

      // Update Bankroll State
      setBankrollState(prev => ({
        ...prev,
        currentCapital: prev.currentCapital + profit,
        totalBets: prev.totalBets + 1,
        wins: result === 'WIN' ? prev.wins + 1 : prev.wins,
        losses: result === 'LOSS' ? prev.losses + 1 : prev.losses,
      }));

      return {
        ...bet,
        result,
        profit,
        bankrollAfter: bankrollState.currentCapital + profit // Approximation for history record
      };
    }));
  };

  return (
    <div className="min-h-screen bg-chimera-900 text-gray-100 font-sans selection:bg-chimera-accent selection:text-black">
      {/* Header */}
      <header className="border-b border-chimera-700 bg-chimera-900 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-chimera-accent to-blue-700 rounded-lg flex items-center justify-center shadow-lg shadow-chimera-accent/20">
              <span className="text-xl font-bold font-mono">Ch</span>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white leading-none">PROJECT CHIMERA</h1>
              <p className="text-xs text-chimera-accent font-mono tracking-widest mt-1">QUANTITATIVE LAY STRATEGY v1.0</p>
            </div>
          </div>
          
          <nav className="flex space-x-1 bg-chimera-800 p-1 rounded-lg border border-chimera-700">
            <button 
              onClick={() => setActiveTab('terminal')}
              className={`flex items-center space-x-2 px-4 py-2 rounded text-sm font-medium transition-all ${activeTab === 'terminal' ? 'bg-chimera-700 text-white shadow' : 'text-gray-400 hover:text-gray-200'}`}
            >
              <Terminal className="w-4 h-4" />
              <span>Terminal</span>
            </button>
            <button 
              onClick={() => setActiveTab('history')}
              className={`flex items-center space-x-2 px-4 py-2 rounded text-sm font-medium transition-all ${activeTab === 'history' ? 'bg-chimera-700 text-white shadow' : 'text-gray-400 hover:text-gray-200'}`}
            >
              <Layout className="w-4 h-4" />
              <span>History</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        
        {/* Drawdown Warning Banner */}
        {bankrollState.isCircuitBreakerActive && (
          <div className="bg-red-900/30 border border-red-500 rounded-lg p-4 mb-6 flex items-start space-x-4 animate-pulse">
            <AlertTriangle className="text-red-500 w-6 h-6 flex-shrink-0" />
            <div>
              <h3 className="text-red-500 font-bold">CRITICAL WARNING: CIRCUIT BREAKER ACTIVE</h3>
              <p className="text-red-300 text-sm mt-1">
                Bankroll has breached the safety threshold (£{CIRCUIT_BREAKER_THRESHOLD.toLocaleString()}). 
                Staking liability has been automatically reduced to {REDUCED_LIABILITY_PCT * 100}% until recovery targets are met.
              </p>
            </div>
          </div>
        )}

        {/* Dashboard */}
        <Dashboard state={bankrollState} />

        {/* Dynamic Content */}
        {activeTab === 'terminal' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Analyzer onBetAuthorized={handleAuthorizeBet} />
            </div>
            <div className="space-y-6">
              <div className="bg-chimera-800 border border-chimera-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4 border-b border-chimera-700 pb-2">Active Strategy Parameters</h3>
                <ul className="space-y-3 text-sm text-gray-400">
                  <li className="flex justify-between">
                    <span>Market Target:</span>
                    <span className="text-chimera-accent font-mono">HC / Class 5-6</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Max Odds:</span>
                    <span className="text-chimera-accent font-mono">3.00 BSP</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Min Runners:</span>
                    <span className="text-chimera-accent font-mono">7</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Current Liability:</span>
                    <span className={`font-mono font-bold ${bankrollState.isCircuitBreakerActive ? 'text-red-400' : 'text-green-400'}`}>
                      {(bankrollState.isCircuitBreakerActive ? REDUCED_LIABILITY_PCT : STANDARD_LIABILITY_PCT) * 100}%
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span>Commission:</span>
                    <span className="text-chimera-accent font-mono">{(EXCHANGE_COMMISSION * 100)}%</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-gradient-to-b from-chimera-800 to-chimera-900 border border-chimera-700 rounded-lg p-6">
                 <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">System Status</h3>
                 <div className="flex items-center space-x-2">
                   <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                   <span className="text-green-500 font-mono text-sm">OPERATIONAL</span>
                 </div>
                 <p className="text-xs text-gray-500 mt-2">
                   AI Adjudicator ready. Market filters active. Risk management protocols engaged.
                 </p>
              </div>
            </div>
          </div>
        ) : (
          <BetHistory bets={bets} onResultBet={handleResultBet} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-chimera-800 mt-12 py-6 text-center text-xs text-gray-600 font-mono">
        PROJECT CHIMERA &copy; 2024. EXECUTION IS EVERYTHING.
      </footer>
    </div>
  );
};

export default App;