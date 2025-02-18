import { TrendingUp } from 'lucide-react';

interface ProfitDistributionCardProps {
  profitNada: number;
  profitAhmed: number;
  exchangeRate: number;
}

export function ProfitDistributionCard({ profitNada, profitAhmed, exchangeRate }: ProfitDistributionCardProps) {
  const convertToUSD = (aedAmount: number) => aedAmount / exchangeRate;

  return (
    <div className="bg-card p-6 rounded-lg border border-gray-800">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="h-6 w-6 text-accent" />
        <h3 className="text-lg font-semibold text-text-primary">Profit Distribution</h3>
      </div>
      <div className="grid grid-cols-2 gap-8">
        <div>
          <p className="text-sm text-text-secondary mb-2">NADA</p>
          <div>
            <p className="text-lg font-bold text-text-primary">
              AED {profitNada.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-sm text-text-secondary">
              USD {convertToUSD(profitNada).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
        <div>
          <p className="text-sm text-text-secondary mb-2">AHMED</p>
          <div>
            <p className="text-lg font-bold text-text-primary">
              AED {profitAhmed.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-sm text-text-secondary">
              USD {convertToUSD(profitAhmed).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
