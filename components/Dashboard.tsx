import React from 'react';
import { BankrollState } from '../types';
import { TrendingUp, TrendingDown, ShieldAlert, Activity } from 'lucide-react';

interface DashboardProps {
  state: BankrollState;
}

const KPICard: React.FC<{ title: string; value: string; subValue?: string; icon: React.ReactNode; color: 'cyan' | 'green' | 'red' | 'yellow' }> = ({ title, value, subValue, icon, color }) => {
  const colorClasses = {
    cyan: 'text-chimera-accent border-chimera-accent/30 bg-chimera-accent/5',
    green: 'text-green-500 border-green-500/30 bg-green-500/5',
    red: 'text-red-500 border-red-500/30 bg-red-500/5',
    yellow: 'text-yellow-500 border-yellow-500/30 bg-yellow-500/5'
  };

  return (
    <div className={`border rounded-lg p-5 ${colorClasses[color]} relative overflow-hidden`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs uppercase tracking-wider font-semibold opacity-70 mb-1">{title}</p>
          <h3 className="text-2xl font-mono font-bold">{value}</h3>
          {subValue && <p className="text-xs mt-1 opacity-80">{subValue}</p>}
        </div>
        <div className="opacity-80">
          {icon}
        </div>
      </div>
    </div>
  );
};

const Dashboard: React.FC<DashboardProps> = ({ state }) => {
  const profit = state.currentCapital - state.initialCapital;
  const roi = (profit / state.initialCapital) * 100;
  
  // Calc Strike Rate (Winning lays / Total bets)
  // Note: A "Win" in lay betting means the horse LOST. 
  // We track `wins` in state as successful lays.
  const strikeRate = state.totalBets > 0 ? (state.wins / state.totalBets) * 100 : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <KPICard 
        title="Bankroll" 
        value={`£${state.currentCapital.toLocaleString('en-GB', { minimumFractionDigits: 2 })}`}
        subValue={profit >= 0 ? `+£${profit.toFixed(2)}` : `-£${Math.abs(profit).toFixed(2)}`}
        icon={<Activity className="w-6 h-6" />}
        color={profit >= 0 ? 'cyan' : 'red'}
      />
      
      <KPICard 
        title="Net ROI" 
        value={`${roi > 0 ? '+' : ''}${roi.toFixed(2)}%`}
        subValue="Target: +3.0%"
        icon={<TrendingUp className="w-6 h-6" />}
        color={roi >= 0 ? 'green' : 'red'}
      />

      <KPICard 
        title="Lay Strike Rate" 
        value={`${strikeRate.toFixed(1)}%`}
        subValue="Target: 75-80%"
        icon={<ShieldAlert className="w-6 h-6" />}
        color={strikeRate >= 75 ? 'green' : strikeRate >= 60 ? 'yellow' : 'red'}
      />

      <KPICard 
        title="Risk Protocol" 
        value={state.isCircuitBreakerActive ? "DEFENSIVE" : "STANDARD"}
        subValue={state.isCircuitBreakerActive ? "Liability Halved (0.5%)" : "Liability Normal (1.0%)"}
        icon={<TrendingDown className="w-6 h-6" />}
        color={state.isCircuitBreakerActive ? 'red' : 'green'}
      />
    </div>
  );
};

export default Dashboard;