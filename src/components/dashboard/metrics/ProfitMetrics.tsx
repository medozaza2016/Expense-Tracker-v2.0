import { TrendingUp, TrendingDown, DollarSign, Percent } from 'lucide-react';
import type { BusinessStats } from '../../../services/dashboardService';

interface ProfitMetricsProps {
  stats: BusinessStats;
}

export function ProfitMetrics({ stats }: ProfitMetricsProps) {
  const metrics = [
    {
      title: 'Total Revenue',
      value: stats.totalRevenue,
      change: stats.revenueGrowth,
      icon: DollarSign,
      color: 'text-blue-400'
    },
    {
      title: 'Total Expenses',
      value: stats.totalExpenses,
      change: stats.expenseGrowth,
      icon: TrendingDown,
      color: 'text-red-400'
    },
    {
      title: 'Net Profit',
      value: stats.netProfit,
      change: stats.profitGrowth,
      icon: TrendingUp,
      color: 'text-green-400'
    },
    {
      title: 'Profit Margin',
      value: stats.profitMargin,
      isPercentage: true,
      change: stats.marginGrowth,
      icon: Percent,
      color: 'text-purple-400'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric) => (
        <div key={metric.title} className="bg-card p-6 rounded-lg border border-gray-800">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-text-secondary">{metric.title}</p>
              <p className="text-2xl font-bold text-text-primary mt-2">
                {metric.isPercentage ? (
                  `${metric.value.toFixed(1)}%`
                ) : (
                  `AED ${metric.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                )}
              </p>
              {metric.change !== undefined && (
                <p className={`text-sm mt-2 ${metric.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {metric.change >= 0 ? '↑' : '↓'} {Math.abs(metric.change).toFixed(1)}%
                </p>
              )}
            </div>
            <metric.icon className={`h-8 w-8 ${metric.color}`} />
          </div>
        </div>
      ))}
    </div>
  );
}
