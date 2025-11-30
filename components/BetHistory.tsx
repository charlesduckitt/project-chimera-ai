import React from 'react';
import { Bet } from '../types';
import { Check, X, Clock } from 'lucide-react';

interface BetHistoryProps {
  bets: Bet[];
  onResultBet: (id: string, result: 'WIN' | 'LOSS') => void;
}

const BetHistory: React.FC<BetHistoryProps> = ({ bets, onResultBet }) => {
  return (
    <div className="bg-chimera-800 border border-chimera-700 rounded-lg shadow-xl overflow-hidden mt-8">
      <div className="p-4 border-b border-chimera-700 bg-chimera-900/50">
        <h3 className="text-white font-semibold">Execution Log</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-400">
          <thead className="text-xs text-gray-500 uppercase bg-chimera-900">
            <tr>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Selection</th>
              <th className="px-6 py-3">Odds (BSP)</th>
              <th className="px-6 py-3 text-right">Stake</th>
              <th className="px-6 py-3 text-right">Liability</th>
              <th className="px-6 py-3 text-center">Result</th>
              <th className="px-6 py-3 text-right">P&L</th>
            </tr>
          </thead>
          <tbody>
            {bets.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-600 italic">
                  No trades executed yet. Waiting for opportunities...
                </td>
              </tr>
            ) : (
              bets.map((bet) => (
                <tr key={bet.id} className="border-b border-chimera-700 hover:bg-chimera-700/30">
                  <td className="px-6 py-4 font-mono">{new Date(bet.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <div className="text-white font-medium">{bet.horseName}</div>
                    <div className="text-xs text-gray-500">{bet.raceCourse}</div>
                  </td>
                  <td className="px-6 py-4 font-mono text-chimera-accent">{bet.bsp.toFixed(2)}</td>
                  <td className="px-6 py-4 text-right font-mono">£{bet.stake.toFixed(2)}</td>
                  <td className="px-6 py-4 text-right font-mono text-red-400">-£{bet.liability.toFixed(2)}</td>
                  <td className="px-6 py-4 text-center">
                    {bet.result === 'PENDING' ? (
                      <div className="flex justify-center space-x-2">
                        <button 
                          onClick={() => onResultBet(bet.id, 'WIN')}
                          className="p-1 bg-green-500/20 text-green-500 hover:bg-green-500 hover:text-white rounded transition-colors"
                          title="Lay Won (Horse Lost)"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => onResultBet(bet.id, 'LOSS')}
                          className="p-1 bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white rounded transition-colors"
                          title="Lay Lost (Horse Won)"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${bet.result === 'WIN' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                        {bet.result === 'WIN' ? 'SUCCESS' : 'FAILED'}
                      </span>
                    )}
                  </td>
                  <td className={`px-6 py-4 text-right font-mono font-bold ${bet.profit > 0 ? 'text-green-500' : bet.profit < 0 ? 'text-red-500' : 'text-gray-500'}`}>
                    {bet.result !== 'PENDING' ? (bet.profit > 0 ? '+' : '') + `£${bet.profit.toFixed(2)}` : '-'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BetHistory;