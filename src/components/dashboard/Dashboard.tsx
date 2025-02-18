import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useAuth } from '../../hooks/useAuth';
import { financialService } from '../../services/financialService';
import { settingsService } from '../../services/settingsService';
import { dashboardService } from '../../services/dashboardService';
import { vehicleService } from '../../services/vehicleService';
import { CapitalCard } from './CapitalCard';
import { ExpensesCard } from './ExpensesCard';
import { ProfitDistributionCard } from './ProfitDistributionCard';
import { AssetsCard } from './AssetsCard';
import { LoansCard } from './LoansCard';
import { ContributionCard } from './ContributionCard';
import { BankBalanceCard } from './BankBalanceCard';

export function Dashboard() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exchangeRate, setExchangeRate] = useState(3.6725);
  const [financialSettings, setFinancialSettings] = useState({
    cash_on_hand: 0,
    showroom_balance: 0,
    personal_loan: 0,
    additional: 0
  });
  const [dashboardStats, setDashboardStats] = useState({
    totalContribution: 0,
    profitAhmed: 0,
    profitNada: 0,
    overallMoneyFlow: 0,
    totalCapital: 0,
    bankBalance: 0,
    assetValue: 0,
    expenses: 0
  });
  const [vehicleStats, setVehicleStats] = useState({
    totalValue: 0,
    availableCount: 0,
    totalCount: 0
  });

  useEffect(() => {
    Promise.all([
      loadFinancialSettings(),
      loadGlobalSettings(),
      loadDashboardStats(),
      loadVehicleStats()
    ]).finally(() => setIsLoading(false));
  }, []);

  const loadVehicleStats = async () => {
    try {
      const vehicles = await vehicleService.getVehicleFinancials();
      const availableVehicles = vehicles.filter(v => v.status === 'AVAILABLE');
      
      setVehicleStats({
        totalValue: availableVehicles.reduce((sum, v) => sum + v.purchase_price, 0),
        availableCount: availableVehicles.length,
        totalCount: vehicles.length
      });
    } catch (error) {
      console.error('Error loading vehicle stats:', error);
    }
  };

  const loadFinancialSettings = async () => {
    try {
      setError(null);
      const settings = await financialService.getSettings();
      if (settings) {
        setFinancialSettings({
          cash_on_hand: settings.cash_on_hand,
          showroom_balance: settings.showroom_balance,
          personal_loan: settings.personal_loan,
          additional: settings.additional
        });
      }
    } catch (error) {
      console.error('Error loading financial settings:', error);
      setError('Failed to load financial settings. Please try again later.');
    }
  };

  const loadGlobalSettings = async () => {
    try {
      const settings = await settingsService.getSettings();
      if (settings?.exchange_rate) {
        setExchangeRate(settings.exchange_rate);
      }
    } catch (error) {
      console.error('Error loading global settings:', error);
    }
  };

  const loadDashboardStats = async () => {
    try {
      const stats = await dashboardService.getDashboardStats();
      setDashboardStats(stats);
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      setError('Failed to load dashboard statistics');
    }
  };

  const handleUpdateFinancialSetting = async (field: string, value: number) => {
    try {
      setError(null);
      await financialService.updateSettings({ [field]: value });
      setFinancialSettings(prev => ({ ...prev, [field]: value }));
      await loadDashboardStats(); // Reload stats after update
    } catch (error) {
      console.error('Error updating setting:', error);
      setError('Failed to update value. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col p-6 bg-card rounded-lg border border-gray-800">
        <div className="text-left">
          <h2 className="text-xl font-bold text-text-primary">OVERALL MONEY FLOW</h2>
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div>
              <p className="text-lg font-bold text-accent">
                AED {dashboardStats.overallMoneyFlow.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-sm text-text-secondary">
                USD {(dashboardStats.overallMoneyFlow / exchangeRate).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-text-secondary">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <CapitalCard
          totalCapital={dashboardStats.totalCapital}
          additionalCapital={financialSettings.additional}
          exchangeRate={exchangeRate}
          onEdit={handleUpdateFinancialSetting}
        />

        <ContributionCard
          totalContribution={dashboardStats.totalContribution}
          exchangeRate={exchangeRate}
        />

        <BankBalanceCard
          bankBalance={dashboardStats.bankBalance}
          cashOnHand={financialSettings.cash_on_hand}
          exchangeRate={exchangeRate}
          onEdit={handleUpdateFinancialSetting}
        />

        <LoansCard
          showroomLoan={financialSettings.showroom_balance}
          personalLoan={financialSettings.personal_loan}
          exchangeRate={exchangeRate}
          onEdit={handleUpdateFinancialSetting}
        />

        <ExpensesCard 
          expenses={dashboardStats.expenses}
          exchangeRate={exchangeRate}
        />

        <ProfitDistributionCard
          profitNada={dashboardStats.profitNada}
          profitAhmed={dashboardStats.profitAhmed}
          exchangeRate={exchangeRate}
        />

        <AssetsCard
          totalValue={vehicleStats.totalValue}
          availableCount={vehicleStats.availableCount}
          totalCount={vehicleStats.totalCount}
          exchangeRate={exchangeRate}
        />
      </div>
    </div>
  );
}
