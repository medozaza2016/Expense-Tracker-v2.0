import { useMemo } from 'react';
import type { BusinessStats } from '../../../services/dashboardService';

interface ProfitTrendsProps {
  stats: BusinessStats;
}

export function ProfitTrends({ stats }: ProfitTrendsProps) {
  const trends = useMemo(() => [
    {
      title: 'Most Profitable Month',
      value: stats.mostProfitableMonth.profit,
      label: new Date(stats.mostProfitableMonth.month).toLocaleDateString('en-US', { 
        month: 'long',
        year: 'numeric'
      })
    },
    {
      title: 'Average Monthly Profit',
      value: stats.averageMonthlyProfit,
      label: 'Last 12 months'
    },
    {
      title: 'Best Revenue Day',
      value: stats.bestRevenueDay.revenue,
      label: new Date(stats.bestRevenueDay.date).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })
    },
    {
      title: 'Projected Annual Profit',
      value: stats.projectedAnnualProfit,
      label: 'Based on current trends'
    }
  ], [stats]);

  return (
    <div className="bg-card p-6 rounded-lg border border-gray-800">
      <h2 className="text-lg font-semibold text-text-primary mb-6">Profit Trends</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {trends.map((trend) => (
          <div key={trend.title} className="bg-background p-4 rounded-lg">
            <h3 className="text-sm font-medium text-text-secondary">{trend.title}</h3>
            <p className="text-xl font-bold text-text-primary mt-2">
              AED {trend.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-text-secondary mt-1">{trend.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
