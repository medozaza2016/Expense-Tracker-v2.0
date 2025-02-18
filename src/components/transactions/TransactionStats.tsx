import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

interface TransactionStatsProps {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
}

export function TransactionStats({ totalIncome, totalExpenses, netProfit }: TransactionStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-card p-6 rounded-lg border border-gray-800 hover:border-accent/50 transition-colors">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-text-secondary">Total Income</p>
            <p className="text-2xl font-bold text-green-400 mt-2">
              AED {totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <TrendingUp className="h-8 w-8 text-green-400" />
        </div>
      </div>

      <div className="bg-card p-6 rounded-lg border border-gray-800 hover:border-accent/50 transition-colors">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-text-secondary">Total Expenses</p>
            <p className="text-2xl font-bold text-red-400 mt-2">
              AED {totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <TrendingDown className="h-8 w-8 text-red-400" />
        </div>
      </div>

      <div className="bg-card p-6 rounded-lg border border-gray-800 hover:border-accent/50 transition-colors">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-text-secondary">Net Profit</p>
            <p className={`text-2xl font-bold mt-2 ${netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              AED {netProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <DollarSign className={`h-8 w-8 ${netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`} />
        </div>
      </div>
    </div>
  );
}
