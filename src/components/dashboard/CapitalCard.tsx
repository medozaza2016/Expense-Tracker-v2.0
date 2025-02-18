import { DollarSign } from 'lucide-react';
import { EditableValue } from './EditableValue';

interface CapitalCardProps {
  totalCapital: number;
  additionalCapital: number;
  exchangeRate: number;
  onEdit: (field: string, value: number) => void;
}

export function CapitalCard({ totalCapital, additionalCapital, exchangeRate, onEdit }: CapitalCardProps) {
  const convertToUSD = (aedAmount: number) => aedAmount / exchangeRate;

  return (
    <div className="bg-card p-6 rounded-lg border border-gray-800">
      <div className="flex items-center gap-2 mb-4">
        <DollarSign className="h-6 w-6 text-accent" />
        <h3 className="text-lg font-semibold text-text-primary">Capital</h3>
      </div>
      <div className="grid grid-cols-2 gap-8">
        <div>
          <p className="text-sm text-text-secondary mb-2">Total Capital</p>
          <div>
            <p className="text-lg font-bold text-text-primary">
              AED {totalCapital.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-sm text-text-secondary">
              USD {convertToUSD(totalCapital).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
        <div>
          <p className="text-sm text-text-secondary mb-2">Additional Capital</p>
          <EditableValue 
            field="additional" 
            value={additionalCapital} 
            allowNegative={true}
            showUSD={false}
            onEdit={onEdit}
          />
        </div>
      </div>
    </div>
  );
}
