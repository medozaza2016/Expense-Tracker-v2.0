import { supabase } from './supabase';

interface MonthlyStats {
  month: string;
  profit: number;
  income: number;
  expenses: number;
  profitPercentage: number;
}

interface YearlyStats {
  year: number;
  months: MonthlyStats[];
  totalProfit: number;
  totalIncome: number;
  totalExpenses: number;
  averageProfitPercentage: number;
}

export const businessService = {
  async getMonthlyStats(): Promise<MonthlyStats[]> {
    try {
      // First check if we can connect to Supabase
      const { error: healthCheckError } = await supabase.from('transactions').select('count').limit(1);
      if (healthCheckError) throw healthCheckError;

      // Get all relevant transactions
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('amount, type, category, date')
        .in('category', ['Profit-AHMED', 'Personal Expenses', 'Distribution'])
        .order('date');

      if (error) throw error;
      if (!transactions) return [];

      const monthlyStats = new Map<string, MonthlyStats>();

      transactions.forEach(transaction => {
        const month = transaction.date.substring(0, 7); // YYYY-MM format
        const stats = monthlyStats.get(month) || {
          month,
          profit: 0,
          income: 0,
          expenses: 0,
          profitPercentage: 0
        };

        // Income is Profit-AHMED
        if (transaction.category === 'Profit-AHMED') {
          stats.income += transaction.amount;
          stats.profit += transaction.amount;
        }
        // Expenses are Personal Expenses + Distribution
        else if (transaction.category === 'Personal Expenses' || transaction.category === 'Distribution') {
          stats.expenses += transaction.amount;
          stats.profit -= transaction.amount; // Subtract expenses from profit
        }

        monthlyStats.set(month, stats);
      });

      // Calculate profit percentages and sort by month
      const result = Array.from(monthlyStats.values())
        .map(stats => ({
          ...stats,
          profitPercentage: stats.income > 0 ? ((stats.income - stats.expenses) / stats.income) * 100 : 0
        }))
        .sort((a, b) => a.month.localeCompare(b.month));

      return result;
    } catch (error) {
      console.error('Error fetching monthly stats:', error);
      throw error;
    }
  },

  async getYearlyStats(): Promise<YearlyStats[]> {
    try {
      const monthlyStats = await this.getMonthlyStats();
      const yearlyStats = new Map<number, YearlyStats>();

      monthlyStats.forEach(monthStat => {
        const year = parseInt(monthStat.month.split('-')[0]);

        const yearStats = yearlyStats.get(year) || {
          year,
          months: [],
          totalProfit: 0,
          totalIncome: 0,
          totalExpenses: 0,
          averageProfitPercentage: 0
        };

        yearStats.months.push(monthStat);
        yearStats.totalProfit += monthStat.profit;
        yearStats.totalIncome += monthStat.income;
        yearStats.totalExpenses += monthStat.expenses;

        yearlyStats.set(year, yearStats);
      });

      // Calculate yearly averages and sort by year
      return Array.from(yearlyStats.values())
        .map(yearStats => ({
          ...yearStats,
          averageProfitPercentage: yearStats.totalIncome > 0 
            ? ((yearStats.totalIncome - yearStats.totalExpenses) / yearStats.totalIncome) * 100 
            : 0
        }))
        .sort((a, b) => b.year - a.year); // Sort by year descending
    } catch (error) {
      console.error('Error fetching yearly stats:', error);
      throw error;
    }
  }
};
