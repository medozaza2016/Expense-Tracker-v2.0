import { Store } from 'lucide-react';

interface ExpensesCardProps {
  expenses: number;
  exchangeRate: number;
}

export function ExpensesCard({ expenses, exchangeRate }: ExpensesCardProps) {
  const convertToUSD = (aedAmount: number) => aedAmount / exchangeRate;

  return (
    <div className="bg-card p-6 rounded-lg border border-gray-800">
      <div className="flex items-center gap-2 mb-4">
        <Store className="h-6 w-6 text-red-400" />
        <h3 className="text-lg font-semibold text-text-primary">Expenses</h3>
      </div>
      <div>
        <p className="text-sm text-text-secondary mb-2">Total Expenses</p>
        <div>
          <p className="text-lg font-bold text-text-primary">
            AED {expenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-sm text-text-secondary">
            USD {convertToUSD(expenses).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>
    </div>
  );
}
