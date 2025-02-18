import { DollarSign, TrendingUp, Wallet, Building2, CreditCard, Car, Store } from 'lucide-react';
import type { DashboardStats } from '../../services/dashboardService';

interface DashboardStatsProps {
  stats: DashboardStats;
  onUpdateExpenses: (value: number) => Promise<void>;
}

export function DashboardStats({ stats, onUpdateExpenses }: DashboardStatsProps) {
  const handleExpensesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      await onUpdateExpenses(value);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Overall Money Flow */}
      <div className="bg-card p-6 rounded-lg border border-gray-800 hover:border-accent/50 transition-colors">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-text-secondary">Overall Money Flow</p>
            <p className="text-2xl font-bold text-text-primary mt-2">
              AED {stats.overallMoneyFlow.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <DollarSign className="h-8 w-8 text-accent" />
        </div>
      </div>

      {/* Total Capital */}
      <div className="bg-card p-6 rounded-lg border border-gray-800 hover:border-accent/50 transition-colors">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-text-secondary">Total Capital</p>
            <p className="text-2xl font-bold text-text-primary mt-2">
              AED {stats.totalCapital.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <Building2 className="h-8 w-8 text-accent" />
        </div>
      </div>

      {/* Bank Balance */}
      <div className="bg-card p-6 rounded-lg border border-gray-800 hover:border-accent/50 transition-colors">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-text-secondary">Bank Balance</p>
            <p className={`text-2xl font-bold mt-2 ${stats.bankBalance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              AED {stats.bankBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <Wallet className={`h-8 w-8 ${stats.bankBalance >= 0 ? 'text-green-400' : 'text-red-400'}`} />
        </div>
      </div>

      {/* Expenses */}
      <div className="bg-card p-6 rounded-lg border border-gray-800 hover:border-accent/50 transition-colors">
        <div className="flex justify-between items-start">
          <div className="w-full">
            <p className="text-sm font-medium text-text-secondary">Expenses</p>
            <div className="mt-2 flex items-center gap-2">
              <input
                type="number"
                value={stats.expenses}
                onChange={handleExpensesChange}
                className="w-full px-3 py-2 bg-background border border-gray-700 rounded-md text-red-400 focus:outline-none focus:ring-2 focus:ring-accent/50"
                step="0.01"
                min="0"
              />
            </div>
          </div>
          <Store className="h-8 w-8 text-red-400 ml-4" />
        </div>
      </div>

      {/* Assets */}
      <div className="bg-card p-6 rounded-lg border border-gray-800 hover:border-accent/50 transition-colors">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-text-secondary">Assets</p>
            <p className="text-2xl font-bold text-text-primary mt-2">
              AED {stats.assetValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <Car className="h-8 w-8 text-accent" />
        </div>
      </div>

      {/* Profit AHMED */}
      <div className="bg-card p-6 rounded-lg border border-gray-800 hover:border-accent/50 transition-colors">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-text-secondary">Profit AHMED</p>
            <p className="text-2xl font-bold text-green-400 mt-2">
              AED {stats.profitAhmed.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <TrendingUp className="h-8 w-8 text-green-400" />
        </div>
      </div>

      {/* Profit NADA */}
      <div className="bg-card p-6 rounded-lg border border-gray-800 hover:border-accent/50 transition-colors">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-text-secondary">Profit NADA</p>
            <p className="text-2xl font-bold text-green-400 mt-2">
              AED {stats.profitNada.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <TrendingUp className="h-8 w-8 text-green-400" />
        </div>
      </div>

      {/* Contribution */}
      <div className="bg-card p-6 rounded-lg border border-gray-800 hover:border-accent/50 transition-colors">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-text-secondary">Contribution</p>
            <p className="text-2xl font-bold text-text-primary mt-2">
              AED {stats.totalContribution.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <CreditCard className="h-8 w-8 text-accent" />
        </div>
      </div>
    </div>
  );
}
