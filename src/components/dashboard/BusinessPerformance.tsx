import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { businessService } from '../../services/businessService';
import { MonthlyProfitChart } from '../business/MonthlyProfitChart';
import { ProfitPercentageChart } from '../business/ProfitPercentageChart';
import { YearlyStats } from '../business/YearlyStats';

export function BusinessPerformance() {
  const { data: monthlyStats, isLoading, error } = useQuery({
    queryKey: ['businessStats'],
    queryFn: () => businessService.getMonthlyStats(),
    refetchInterval: 300000, // Refetch every 5 minutes
    retry: 3
  });

  const { data: yearlyStats } = useQuery({
    queryKey: ['yearlyStats'],
    queryFn: () => businessService.getYearlyStats(),
    refetchInterval: 300000,
    retry: 3
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (error || !monthlyStats) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded">
        <p className="font-medium">Failed to load business statistics</p>
        <p className="text-sm mt-1 text-red-400/80">
          {error instanceof Error ? error.message : 'Please try again later'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-text-primary">Business Performance</h1>

      <div className="space-y-6">
        <div className="bg-card p-6 rounded-lg border border-gray-800">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Profit vs Income</h2>
          <MonthlyProfitChart data={monthlyStats} />
        </div>

        <div className="bg-card p-6 rounded-lg border border-gray-800">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Monthly Profit Percentage</h2>
          <ProfitPercentageChart data={monthlyStats} />
        </div>

        {yearlyStats && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-text-primary">Yearly Overview</h2>
            <YearlyStats data={yearlyStats} />
          </div>
        )}
      </div>
    </div>
  );
}
