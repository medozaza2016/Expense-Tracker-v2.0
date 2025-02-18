import { useState, useEffect } from 'react';
import { businessService } from '../services/businessService';
import { MonthlyProfitChart } from '../components/business/MonthlyProfitChart';
import { YearlyStats } from '../components/business/YearlyStats';
import { MoneyGrowthChart } from '../components/business/MoneyGrowthChart';

export function BusinessAnalytics() {
  const [monthlyStats, setMonthlyStats] = useState<any[]>([]);
  const [yearlyStats, setYearlyStats] = useState<any[]>([]);
  const [selectedYears, setSelectedYears] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load stats sequentially to handle dependencies
      const monthly = await businessService.getMonthlyStats();
      const yearly = await businessService.getYearlyStats();

      setMonthlyStats(monthly);
      setYearlyStats(yearly);

      // Get available years and set default selection to last 2 years
      const years = [...new Set(monthly.map(stat => 
        parseInt(stat.month.split('-')[0])
      ))].sort((a, b) => b - a);

      // Take the first two years if available
      const defaultYears = years.slice(0, 2);
      setSelectedYears(defaultYears);
    } catch (err) {
      console.error('Error loading business statistics:', err);
      setError(err instanceof Error ? err.message : 'Failed to load business statistics');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate money growth data
  const moneyGrowthData = monthlyStats.map(stat => ({
    month: stat.month,
    totalIncoming: stat.income,
    totalOutgoing: stat.expenses,
    netGrowth: stat.income - stat.expenses
  }));

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded">
        <p className="font-medium">Failed to load business statistics</p>
        <p className="text-sm mt-1 text-red-400/80">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-text-primary">Business Analytics</h1>

      <div className="space-y-6">
        {/* Yearly Overview */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-text-primary">Yearly Overview</h2>
          <YearlyStats data={yearlyStats} />
        </div>

        {/* Money Growth Chart */}
        <div className="bg-card p-6 rounded-lg border border-gray-800">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Money Growth Over Time</h2>
          <MoneyGrowthChart data={moneyGrowthData} />
        </div>

        {/* Profit vs Income */}
        <div className="bg-card p-6 rounded-lg border border-gray-800">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Profit vs Income</h2>
          <MonthlyProfitChart data={monthlyStats} />
        </div>
      </div>
    </div>
  );
}
