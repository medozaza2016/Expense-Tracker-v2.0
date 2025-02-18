import React, { useState, useEffect } from 'react';
import { X, Plus, Edit2, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { vehicleService, type Vehicle, type VehicleExpense, type ProfitDistribution } from '../../services/vehicleService';
import { VehicleReport } from './VehicleReport';

interface VehicleDetailsModalProps {
  vehicleId: string;
  onClose: () => void;
  onUpdate: () => void;
}

export function VehicleDetailsModal({ vehicleId, onClose, onUpdate }: VehicleDetailsModalProps) {
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [expenses, setExpenses] = useState<VehicleExpense[]>([]);
  const [distributions, setDistributions] = useState<ProfitDistribution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [newExpense, setNewExpense] = useState({
    type: '',
    amount: '',
    recipient: '',
    notes: '',
    date: format(new Date(), 'yyyy-MM-dd')
  });

  useEffect(() => {
    loadVehicleDetails();
  }, [vehicleId]);

  const loadVehicleDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [vehicleData, expensesData, distributionsData] = await Promise.all([
        vehicleService.getVehicleById(vehicleId),
        vehicleService.getVehicleExpenses(vehicleId),
        vehicleService.getProfitDistributions(vehicleId)
      ]);

      if (!vehicleData) throw new Error('Vehicle not found');

      setVehicle(vehicleData);
      setExpenses(expensesData);
      setDistributions(distributionsData);
    } catch (err) {
      setError('Failed to load vehicle details');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTotalExpenses = () => {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
  };

  const calculateNetProfit = () => {
    if (!vehicle || vehicle.status !== 'SOLD' || !vehicle.sale_price) return 0;
    return vehicle.sale_price - vehicle.purchase_price - calculateTotalExpenses();
  };

  const calculateExpensesByRecipient = () => {
    return expenses.reduce((acc, expense) => {
      const recipient = expense.recipient || 'Other';
      acc[recipient] = (acc[recipient] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);
  };

  const handleAddExpense = async () => {
    try {
      setError(null);
      const amount = parseFloat(newExpense.amount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Please enter a valid amount');
      }
      if (!newExpense.type.trim()) {
        throw new Error('Please enter an expense type');
      }

      await vehicleService.addExpense({
        vehicle_id: vehicleId,
        type: newExpense.type.trim(),
        amount,
        recipient: newExpense.recipient.trim() || null,
        notes: newExpense.notes.trim() || null,
        date: newExpense.date
      });

      await loadVehicleDetails();
      setShowAddExpense(false);
      setNewExpense({
        type: '',
        amount: '',
        recipient: '',
        notes: '',
        date: format(new Date(), 'yyyy-MM-dd')
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add expense');
      console.error(err);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      setError(null);
      await vehicleService.deleteExpense(id);
      await loadVehicleDetails();
    } catch (err) {
      setError('Failed to delete expense');
      console.error(err);
    }
  };

  const handleAutoDistribute = async () => {
    try {
      setError(null);
      const netProfit = calculateNetProfit();
      const expensesByRecipient = calculateExpensesByRecipient();

      // Delete existing distributions
      for (const dist of distributions) {
        await vehicleService.deleteProfitDistribution(dist.id);
      }

      // Calculate and add new distributions
      const distributions = [
        {
          recipient: 'Ahmed',
          percentage: 35,
          amount: (netProfit * 0.35) + (expensesByRecipient['Ahmed'] || 0) + vehicle!.purchase_price
        },
        {
          recipient: 'Nada',
          percentage: 15,
          amount: (netProfit * 0.15) + (expensesByRecipient['Nada'] || 0)
        },
        {
          recipient: 'Shaker',
          percentage: 50,
          amount: (netProfit * 0.50) + (expensesByRecipient['Shaker'] || 0)
        }
      ];

      for (const dist of distributions) {
        await vehicleService.addProfitDistribution({
          vehicle_id: vehicleId,
          recipient: dist.recipient,
          amount: dist.amount,
          percentage: dist.percentage,
          date: new Date().toISOString().split('T')[0],
          notes: `Auto-distributed profit including expenses${dist.recipient === 'Ahmed' ? ' and purchase price' : ''}`
        });
      }

      await loadVehicleDetails();
    } catch (err) {
      setError('Failed to distribute profit');
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm z-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm z-50">
        <div className="bg-card p-6 rounded-lg border border-gray-800">
          <p className="text-red-400">Vehicle not found</p>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-accent text-white rounded-md hover:bg-accent/90 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const totalExpenses = calculateTotalExpenses();
  const netProfit = calculateNetProfit();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm z-50">
      <div className="bg-card p-6 rounded-lg border border-gray-800 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-bold text-text-primary">
              {vehicle.make} {vehicle.model} ({vehicle.year})
            </h2>
            <p className="text-text-secondary">VIN: {vehicle.vin}</p>
          </div>
          <div className="flex items-center gap-4">
            <VehicleReport
              vehicle={vehicle}
              expenses={expenses}
              distributions={distributions}
              totalExpenses={totalExpenses}
              netProfit={netProfit}
            />
            <button
              onClick={onClose}
              className="p-2 hover:bg-background/50 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-text-secondary" />
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-background p-4 rounded-lg">
            <h3 className="text-lg font-medium text-text-primary mb-2">Purchase Details</h3>
            <div className="space-y-2">
              <p className="text-text-secondary">
                Purchase Date: {format(new Date(vehicle.purchase_date), 'MMM d, yyyy')}
              </p>
              <p className="text-text-secondary">
                Purchase Price: AED {vehicle.purchase_price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          <div className="bg-background p-4 rounded-lg">
            <h3 className="text-lg font-medium text-text-primary mb-2">Sale Details</h3>
            <div className="space-y-2">
              {vehicle.status === 'SOLD' ? (
                <>
                  <p className="text-text-secondary">
                    Sale Date: {vehicle.sale_date ? format(new Date(vehicle.sale_date), 'MMM d, yyyy') : 'N/A'}
                  </p>
                  <p className="text-text-secondary">
                    Sale Price: AED {vehicle.sale_price?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || 'N/A'}
                  </p>
                </>
              ) : (
                <p className="text-text-secondary">Vehicle not sold yet</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-text-primary">Expenses</h3>
              <button
                onClick={() => setShowAddExpense(true)}
                className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Add Expense
              </button>
            </div>

            <div className="bg-background rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-card">
                    <th className="px-4 py-2 text-left text-sm font-medium text-text-secondary">Date</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-text-secondary">Type</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-text-secondary">Amount</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-text-secondary">Recipient</th>
                    <th className="px-4 py-2 text-right text-sm font-medium text-text-secondary">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {expenses.map((expense) => (
                    <tr key={expense.id} className="hover:bg-card/60 transition-colors">
                      <td className="px-4 py-2 text-sm text-text-primary">
                        {format(new Date(expense.date), 'MMM d, yyyy')}
                      </td>
                      <td className="px-4 py-2 text-sm text-text-primary">{expense.type}</td>
                      <td className="px-4 py-2 text-sm text-red-400">
                        AED {expense.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-2 text-sm text-text-primary">{expense.recipient || '-'}</td>
                      <td className="px-4 py-2 text-sm text-right">
                        <button
                          onClick={() => handleDeleteExpense(expense.id)}
                          className="p-1 text-text-secondary hover:text-red-400 transition-colors"
                          title="Delete expense"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {expenses.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-text-secondary">
                        No expenses recorded
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot className="bg-card">
                  <tr>
                    <td colSpan={2} className="px-4 py-2 text-sm font-medium text-text-primary">
                      Total Expenses
                    </td>
                    <td colSpan={3} className="px-4 py-2 text-sm font-medium text-red-400">
                      AED {totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {vehicle.status === 'SOLD' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-text-primary">Profit Distribution</h3>
                <button
                  onClick={handleAutoDistribute}
                  className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
                >
                  Auto Distribute
                </button>
              </div>

              <div className="bg-background rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-card">
                      <th className="px-4 py-2 text-left text-sm font-medium text-text-secondary">Recipient</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-text-secondary">Amount</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-text-secondary">Percentage</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-text-secondary">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {distributions.map((dist) => (
                      <tr key={dist.id} className="hover:bg-card/60 transition-colors">
                        <td className="px-4 py-2 text-sm text-text-primary">{dist.recipient}</td>
                        <td className="px-4 py-2 text-sm text-green-400">
                          AED {dist.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-2 text-sm text-text-primary">{dist.percentage}%</td>
                        <td className="px-4 py-2 text-sm text-text-secondary">{dist.notes || '-'}</td>
                      </tr>
                    ))}
                    {distributions.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-text-secondary">
                          No distributions recorded
                        </td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot className="bg-card">
                    <tr>
                      <td className="px-4 py-2 text-sm font-medium text-text-primary">Net Profit</td>
                      <td colSpan={3} className="px-4 py-2 text-sm font-medium text-green-400">
                        AED {netProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {showAddExpense && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm z-50">
          <div className="bg-card p-6 rounded-lg border border-gray-800 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-text-primary">Add Expense</h3>
              <button
                onClick={() => setShowAddExpense(false)}
                className="p-2 hover:bg-background/50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-text-secondary" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={newExpense.date}
                  onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-gray-700 rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Type
                </label>
                <input
                  type="text"
                  value={newExpense.type}
                  onChange={(e) => setNewExpense({ ...newExpense, type: e.target.value })}
                  placeholder="e.g., Repairs, Insurance, etc."
                  className="w-full px-3 py-2 bg-background border border-gray-700 rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Amount
                </label>
                <input
                  type="number"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 bg-background border border-gray-700 rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Recipient
                </label>
                <select
                  value={newExpense.recipient}
                  onChange={(e) => setNewExpense({ ...newExpense, recipient: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-gray-700 rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50"
                >
                  <option value="">Select recipient</option>
                  <option value="Ahmed">Ahmed</option>
                  <option value="Nada">Nada</option>
                  <option value="Shaker">Shaker</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Notes
                </label>
                <textarea
                  value={newExpense.notes}
                  onChange={(e) => setNewExpense({ ...newExpense, notes: e.target.value })}
                  placeholder="Additional details..."
                  rows={3}
                  className="w-full px-3 py-2 bg-background border border-gray-700 rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowAddExpense(false)}
                className="px-4 py-2 text-text-primary hover:bg-background rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddExpense}
                className="px-4 py-2 bg-accent text-white rounded-md hover:bg-accent/90 transition-colors"
              >
                Add Expense
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
