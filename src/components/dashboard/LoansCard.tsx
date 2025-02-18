import { Wallet } from 'lucide-react';
import { EditableValue } from './EditableValue';

interface LoansCardProps {
  showroomLoan: number;
  personalLoan: number;
  exchangeRate: number;
  onEdit: (field: string, value: number) => void;
}

export function LoansCard({ showroomLoan, personalLoan, exchangeRate, onEdit }: LoansCardProps) {
  return (
    <div className="bg-card p-6 rounded-lg border border-gray-800">
      <div className="flex items-center gap-2 mb-4">
        <Wallet className="h-6 w-6 text-red-400" />
        <h3 className="text-lg font-semibold text-text-primary">Loans</h3>
      </div>
      <div className="grid grid-cols-2 gap-8">
        <div>
          <p className="text-sm text-text-secondary mb-2">Showroom Balance</p>
          <EditableValue 
            field="showroom_balance" 
            value={showroomLoan} 
            allowNegative={false}
            forceNegative={true}
            exchangeRate={exchangeRate}
            onEdit={onEdit}
          />
        </div>
        <div>
          <p className="text-sm text-text-secondary mb-2">Personal Loan</p>
          <EditableValue 
            field="personal_loan" 
            value={personalLoan} 
            allowNegative={false}
            forceNegative={true}
            exchangeRate={exchangeRate}
            onEdit={onEdit}
          />
        </div>
      </div>
    </div>
  );
}
