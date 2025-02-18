import { CreditCard } from 'lucide-react';

interface ContributionCardProps {
  totalContribution: number;
  exchangeRate: number;
}

export function ContributionCard({ totalContribution, exchangeRate }: ContributionCardProps) {
  const convertToUSD = (aedAmount: number) => aedAmount / exchangeRate;

  return (
    <div className="bg-card p-6 rounded-lg border border-gray-800">
      <div className="flex items-center gap-2 mb-4">
        <CreditCard className="h-6 w-6 text-accent" />
        <h3 className="text-lg font-semibold text-text-primary">Contribution</h3>
      </div>
      <div>
        <p className="text-sm text-text-secondary mb-2">Total Contribution</p>
        <div>
          <p className="text-lg font-bold text-text-primary">
            AED {totalContribution.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-sm text-text-secondary">
            USD {convertToUSD(totalContribution).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>
    </div>
  );
}
