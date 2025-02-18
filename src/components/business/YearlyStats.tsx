import { settingsService } from '../../services/settingsService';
import { useEffect, useState } from 'react';

interface YearlyStatsProps {
  data: {
    year: number;
    totalProfit: number;
    totalIncome: number;
    totalExpenses: number;
    averageProfitPercentage: number;
  }[];
}

export function YearlyStats({ data }: YearlyStatsProps) {
  const [exchangeRate, setExchangeRate] = useState(3.6725);

  useEffect(() => {
    loadExchangeRate();
  }, []);

  const loadExchangeRate = async () => {
    try {
      const settings = await settingsService.getSettings();
      if (settings?.exchange_rate) {
        setExchangeRate(settings.exchange_rate);
      }
    } catch (error) {
      console.error('Error loading exchange rate:', error);
    }
  };

  // Calculate overall totals
  const overallStats = data.reduce((acc, curr) => ({
    totalProfit: acc.totalProfit + curr.totalProfit,
    totalIncome: acc.totalIncome + curr.totalIncome,
    totalExpenses: acc.totalExpenses + curr.totalExpenses
  }), {
    totalProfit: 0,
    totalIncome: 0,
    totalExpenses: 0
  });

  // Calculate overall profit percentage
  const overallProfitPercentage = overallStats.totalIncome > 0
    ? ((overallStats.totalIncome - overallStats.totalExpenses) / overallStats.totalIncome) * 100
    : 0;

  const formatCurrency = (amount: number, currency: 'AED' | 'USD') => {
    const value = currency === 'USD' ? amount / exchangeRate : amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Overall Stats Card */}
      <div className="bg-card p-6 rounded-lg border border-accent/20">
        <h3 className="text-lg font-semibold text-accent mb-4">Overall Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-text-secondary">Total Net Profit</p>
            <p className="text-lg font-bold text-green-400">
              {formatCurrency(overallStats.totalProfit, 'AED')}
            </p>
            <p className="text-sm text-text-secondary">
              {formatCurrency(overallStats.totalProfit, 'USD')}
            </p>
          </div>
          <div>
            <p className="text-sm text-text-secondary">Total Incoming</p>
            <p className="text-lg font-bold text-blue-400">
              {formatCurrency(overallStats.totalIncome, 'AED')}
            </p>
            <p className="text-sm text-text-secondary">
              {formatCurrency(overallStats.totalIncome, 'USD')}
            </p>
          </div>
          <div>
            <p className="text-sm text-text-secondary">Total Outgoing</p>
            <p className="text-lg font-bold text-red-400">
              {formatCurrency(overallStats.totalExpenses, 'AED')}
            </p>
            <p className="text-sm text-text-secondary">
              {formatCurrency(overallStats.totalExpenses, 'USD')}
            </p>
          </div>
          <div>
            <p className="text-sm text-text-secondary">Overall Profit Margin</p>
            <p className="text-lg font-bold text-accent">
              {overallProfitPercentage.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      {/* Yearly Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {data.map(yearStats => (
          <div key={yearStats.year} className="bg-card p-6 rounded-lg border border-gray-800">
            <h3 className="text-lg font-semibold text-text-primary mb-4">{yearStats.year}</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-text-secondary">Net Profit</p>
                <p className="text-lg font-bold text-green-400">
                  {formatCurrency(yearStats.totalProfit, 'AED')}
                </p>
                <p className="text-sm text-text-secondary">
                  {formatCurrency(yearStats.totalProfit, 'USD')}
                </p>
              </div>
              <div>
                <p className="text-sm text-text-secondary">Incoming</p>
                <p className="text-lg font-bold text-blue-400">
                  {formatCurrency(yearStats.totalIncome, 'AED')}
                </p>
                <p className="text-sm text-text-secondary">
                  {formatCurrency(yearStats.totalIncome, 'USD')}
                </p>
              </div>
              <div>
                <p className="text-sm text-text-secondary">Outgoing</p>
                <p className="text-lg font-bold text-red-400">
                  {formatCurrency(yearStats.totalExpenses, 'AED')}
                </p>
                <p className="text-sm text-text-secondary">
                  {formatCurrency(yearStats.totalExpenses, 'USD')}
                </p>
              </div>
              <div>
                <p className="text-sm text-text-secondary">Profit Margin</p>
                <p className="text-lg font-bold text-accent">
                  {yearStats.averageProfitPercentage.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
