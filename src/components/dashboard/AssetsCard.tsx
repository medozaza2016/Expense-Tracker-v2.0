import { Car } from 'lucide-react';

interface AssetsCardProps {
  totalValue: number;
  availableCount: number;
  totalCount: number;
  exchangeRate: number;
}

export function AssetsCard({ totalValue, availableCount, totalCount, exchangeRate }: AssetsCardProps) {
  const convertToUSD = (aedAmount: number) => aedAmount / exchangeRate;

  return (
    <div className="bg-card p-6 rounded-lg border border-gray-800">
      <div className="flex items-center gap-2 mb-4">
        <Car className="h-6 w-6 text-accent" />
        <h3 className="text-lg font-semibold text-text-primary">Assets</h3>
      </div>
      <div className="grid grid-cols-2 gap-8">
        <div>
          <p className="text-sm text-text-secondary mb-2">Total Value</p>
          <div>
            <p className="text-lg font-bold text-text-primary">
              AED {totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-sm text-text-secondary">
              USD {convertToUSD(totalValue).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
        <div>
          <p className="text-sm text-text-secondary mb-2">Vehicle Count</p>
          <div>
            <p className="text-lg font-bold text-text-primary">
              {availableCount} / {totalCount}
            </p>
            <p className="text-sm text-text-secondary">Available / Total</p>
          </div>
        </div>
      </div>
    </div>
  );
}
