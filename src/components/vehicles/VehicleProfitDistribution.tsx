import { format } from 'date-fns';
import { Plus } from 'lucide-react';
import type { Vehicle, ProfitDistribution } from '../../services/vehicleService';

interface VehicleProfitDistributionProps {
  vehicle: Vehicle;
  distributions: ProfitDistribution[];
  netProfit: number;
  onAutoDistribute: () => Promise<void>;
}

export function VehicleProfitDistribution({ 
  vehicle, 
  distributions, 
  netProfit,
  onAutoDistribute 
}: VehicleProfitDistributionProps) {
  if (vehicle.status !== 'SOLD') return null;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-text-primary">Profit Distribution</h3>
        <button
          onClick={onAutoDistribute}
          className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Auto Distribute
        </button>
      </div>

      <div className="bg-card rounded-lg border border-gray-800 overflow-hidden">
        <table className="w-full">
          <thead className="bg-background">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Recipient</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Amount</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Percentage</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Date</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {distributions.map((dist) => (
              <tr key={dist.id} className="hover:bg-background/50 transition-colors">
                <td className="px-4 py-2 text-sm text-text-primary">{dist.recipient}</td>
                <td className="px-4 py-2 text-sm text-green-400">
                  AED {dist.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-4 py-2 text-sm text-text-primary">{dist.percentage}%</td>
                <td className="px-4 py-2 text-sm text-text-primary">
                  {format(new Date(dist.date), 'MMM d, yyyy')}
                </td>
                <td className="px-4 py-2 text-sm text-text-secondary">{dist.notes || '-'}</td>
              </tr>
            ))}
            {distributions.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-text-secondary">
                  No distributions recorded
                </td>
              </tr>
            )}
          </tbody>
          <tfoot className="bg-background">
            <tr>
              <td className="px-4 py-2 text-sm font-medium text-text-primary">Net Profit</td>
              <td colSpan={4} className="px-4 py-2 text-sm font-medium text-green-400">
                AED {netProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
