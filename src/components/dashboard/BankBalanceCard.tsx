import { Building2 } from 'lucide-react';
import { EditableValue } from './EditableValue';

interface BankBalanceCardProps {
  bankBalance: number;
  cashOnHand: number;
  exchangeRate: number;
  onEdit: (field: string, value: number) => void;
}

export function BankBalanceCard({ bankBalance, cashOnHand, exchangeRate, onEdit }: BankBalanceCardProps) {
  const convertToUSD = (aedAmount: number) => aedAmount / exchangeRate;

  return (
    <div className="bg-card p-6 rounded-lg border border-gray-800">
      <div className="flex items-center gap-2 mb-4">
        <Building2 className="h-6 w-6 text-accent" />
        <h3 className="text-lg font-semibold text-text-primary">Bank Balance</h3>
      </div>
      <div className="grid grid-cols-2 gap-8">
        <div>
          <p className="text-sm text-text-secondary mb-2">Cash on Hand</p>
          <EditableValue 
            field="cash_on_hand" 
            value={cashOnHand} 
            allowNegative={false}
            exchangeRate={exchangeRate}
            onEdit={onEdit}
          />
        </div>
        <div>
          <p className="text-sm text-text-secondary mb-2">Bank Balance</p>
          <div>
            <p className={`text-lg font-bold ${bankBalance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              AED {bankBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-sm text-text-secondary">
              USD {convertToUSD(bankBalance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
