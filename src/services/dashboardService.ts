import { supabase } from './supabase';

export interface DashboardStats {
  totalContribution: number;
  profitAhmed: number;
  profitNada: number;
  overallMoneyFlow: number;
  totalCapital: number;
  bankBalance: number;
  assetValue: number;
  expenses: number;
}

const DEFAULT_STATS: DashboardStats = {
  totalContribution: 0,
  profitAhmed: 0,
  profitNada: 0,
  overallMoneyFlow: 0,
  totalCapital: 0,
  bankBalance: 0,
  assetValue: 0,
  expenses: 0
};

export const dashboardService = {
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      // Get financial settings
      const { data: settings, error: settingsError } = await supabase
        .from('financial_settings')
        .select('*')
        .single();

      if (settingsError) {
        console.error('Error fetching settings:', settingsError);
        return DEFAULT_STATS;
      }

      const cashOnHand = settings?.cash_on_hand || 0;
      const showroomLoan = settings?.showroom_balance || 0;
      const personalLoan = settings?.personal_loan || 0;
      const additionalCapital = settings?.additional || 0;

      // Calculate total loans
      const totalLoans = showroomLoan + personalLoan;

      // Get all transactions
      const { data: transactions, error: transactionError } = await supabase
        .from('transactions')
        .select('amount, type, category');

      if (transactionError) {
        console.error('Error fetching transactions:', transactionError);
        return DEFAULT_STATS;
      }

      // Calculate totals from transactions
      const totals = transactions?.reduce((acc, t) => {
        const amount = t.amount || 0;
        
        if (t.type === 'income') {
          acc.totalIncome += amount;
          
          // Add to specific categories
          if (t.category === 'Contribution') {
            acc.totalContribution += amount;
          } else if (t.category === 'Profit-AHMED') {
            acc.profitAhmed += amount;
          } else if (t.category === 'Profit-NADA') {
            acc.profitNada += amount;
          }
        } else if (t.type === 'expense') {
          acc.totalExpenses += amount;
          
          // Add to specific categories
          if (t.category === 'Personal Expenses' || t.category === 'Distribution') {
            acc.expenses += amount;
          }
        }
        
        return acc;
      }, {
        totalIncome: 0,
        totalExpenses: 0,
        totalContribution: 0,
        profitAhmed: 0,
        profitNada: 0,
        expenses: 0
      }) || {
        totalIncome: 0,
        totalExpenses: 0,
        totalContribution: 0,
        profitAhmed: 0,
        profitNada: 0,
        expenses: 0
      };

      // Get total value of available vehicles
      const { data: vehicles } = await supabase
        .from('vehicles')
        .select('purchase_price, status');

      const assetValue = vehicles
        ?.filter(v => v.status === 'AVAILABLE')
        .reduce((sum, v) => sum + (v.purchase_price || 0), 0) || 0;

      // Calculate overall money flow (Contribution + Profit AHMED)
      const overallMoneyFlow = totals.totalContribution + totals.profitAhmed;

      // Calculate total capital
      const totalCapital = overallMoneyFlow + totalLoans + additionalCapital - totals.expenses;

      // Calculate bank balance
      const bankBalance = totals.totalIncome + 
                         additionalCapital - 
                         totals.totalExpenses - 
                         totalLoans - 
                         cashOnHand - 
                         totals.profitNada;

      return {
        totalContribution: totals.totalContribution,
        profitAhmed: totals.profitAhmed,
        profitNada: totals.profitNada,
        overallMoneyFlow,
        totalCapital,
        bankBalance,
        assetValue,
        expenses: totals.expenses
      };
    } catch (error) {
      console.error('Error calculating dashboard stats:', error);
      return DEFAULT_STATS;
    }
  }
};
