import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { vehicleService } from '../../services/vehicleService';
import { transactionService } from '../../services/transactionService';
import { VehicleReport } from './VehicleReport';
import { VehicleHeader } from './VehicleHeader';
import { VehiclePurchaseDetails } from './VehiclePurchaseDetails';
import { VehicleSaleDetails } from './VehicleSaleDetails';
import { VehicleRegistrationDetails } from './VehicleRegistrationDetails';
import { VehicleNotes } from './VehicleNotes';
import { VehicleProfitDistribution } from './VehicleProfitDistribution';
import { ExpenseHeader } from './ExpenseHeader';
import { ExpenseTable } from './ExpenseTable';
import { ExpenseModal } from './ExpenseModal';
import { VehicleModal } from './VehicleModal';

export function VehicleDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [expenses, setExpenses] = useState<VehicleExpense[]>([]);
  const [distributions, setDistributions] = useState<ProfitDistribution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showEditVehicle, setShowEditVehicle] = useState(false);
  const [editingExpense, setEditingExpense] = useState<VehicleExpense | null>(null);
  const [expenseForm, setExpenseForm] = useState({
    type: '',
    amount: '',
    recipient: '',
    notes: '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (id) {
      loadVehicleDetails();
    }
  }, [id]);

  const loadVehicleDetails = async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      setError(null);
      const [vehicleData, expensesData, distributionsData] = await Promise.all([
        vehicleService.getVehicleById(id),
        vehicleService.getVehicleExpenses(id),
        vehicleService.getProfitDistributions(id)
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
    if (!id) return;

    try {
      setError(null);

      // Validate required fields
      if (!expenseForm.date) {
        throw new Error('Date is required');
      }

      if (!expenseForm.type.trim()) {
        throw new Error('Type is required');
      }

      const amount = parseFloat(expenseForm.amount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Please enter a valid amount greater than 0');
      }

      if (!expenseForm.recipient) {
        throw new Error('Recipient is required');
      }

      await vehicleService.addExpense({
        vehicle_id: id,
        type: expenseForm.type.trim(),
        amount,
        recipient: expenseForm.recipient.trim(),
        notes: expenseForm.notes.trim() || null,
        date: expenseForm.date
      });

      await loadVehicleDetails();
      setShowAddExpense(false);
      setExpenseForm({
        type: '',
        amount: '',
        recipient: '',
        notes: '',
        date: new Date().toISOString().split('T')[0]
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add expense');
      console.error(err);
    }
  };

  const handleUpdateExpense = async () => {
    if (!editingExpense?.id) return;

    try {
      setError(null);

      // Validate required fields
      if (!expenseForm.date) {
        throw new Error('Date is required');
      }

      if (!expenseForm.type.trim()) {
        throw new Error('Type is required');
      }

      const amount = parseFloat(expenseForm.amount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Please enter a valid amount greater than 0');
      }

      if (!expenseForm.recipient) {
        throw new Error('Recipient is required');
      }

      await vehicleService.updateExpense(editingExpense.id, {
        type: expenseForm.type.trim(),
        amount,
        recipient: expenseForm.recipient.trim(),
        notes: expenseForm.notes.trim() || null,
        date: expenseForm.date
      });

      await loadVehicleDetails();
      setEditingExpense(null);
      setShowAddExpense(false);
      setExpenseForm({
        type: '',
        amount: '',
        recipient: '',
        notes: '',
        date: new Date().toISOString().split('T')[0]
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update expense');
      console.error(err);
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    const confirmMessage = 'Are you sure you want to delete this expense? This action cannot be undone.';
    
    if (!window.confirm(confirmMessage)) return;
    
    try {
      setError(null);
      await vehicleService.deleteExpense(expenseId);
      await loadVehicleDetails();
    } catch (err) {
      setError('Failed to delete expense');
      console.error(err);
    }
  };

  const handleEditExpense = (expense: VehicleExpense) => {
    setEditingExpense(expense);
    setExpenseForm({
      type: expense.type,
      amount: expense.amount.toString(),
      recipient: expense.recipient || '',
      notes: expense.notes || '',
      date: expense.date
    });
    setShowAddExpense(true);
  };

  const handleAutoDistribute = async () => {
    if (!id || !vehicle) return;
    
    try {
      setError(null);
      const netProfit = calculateNetProfit();
      const expensesByRecipient = calculateExpensesByRecipient();

      // Delete existing distributions
      for (const dist of distributions) {
        await vehicleService.deleteProfitDistribution(dist.id);
      }

      // Calculate and add new distributions
      const newDistributions = [
        {
          recipient: 'Ahmed',
          percentage: 35,
          baseAmount: netProfit * 0.35,
          expenses: expensesByRecipient['Ahmed'] || 0,
          purchasePrice: vehicle.purchase_price,
          amount: (netProfit * 0.35) + (expensesByRecipient['Ahmed'] || 0) + vehicle.purchase_price,
          profitOnly: (netProfit * 0.35) + (expensesByRecipient['Ahmed'] || 0),
          notes: `35% of net profit (AED ${(netProfit * 0.35).toLocaleString('en-US', { minimumFractionDigits: 2 })})${
            expensesByRecipient['Ahmed'] ? ` + reimbursement (AED ${expensesByRecipient['Ahmed'].toLocaleString('en-US', { minimumFractionDigits: 2 })})` : ''
          } + purchase price (AED ${vehicle.purchase_price.toLocaleString('en-US', { minimumFractionDigits: 2 })})`
        },
        {
          recipient: 'Nada',
          percentage: 15,
          baseAmount: netProfit * 0.15,
          expenses: expensesByRecipient['Nada'] || 0,
          amount: (netProfit * 0.15) + (expensesByRecipient['Nada'] || 0),
          notes: `15% of net profit (AED ${(netProfit * 0.15).toLocaleString('en-US', { minimumFractionDigits: 2 })})${
            expensesByRecipient['Nada'] ? ` + reimbursement (AED ${expensesByRecipient['Nada'].toLocaleString('en-US', { minimumFractionDigits: 2 })})` : ''
          }`
        },
        {
          recipient: 'Shaker',
          percentage: 50,
          baseAmount: netProfit * 0.50,
          expenses: expensesByRecipient['Shaker'] || 0,
          amount: (netProfit * 0.50) + (expensesByRecipient['Shaker'] || 0),
          notes: `50% of net profit (AED ${(netProfit * 0.50).toLocaleString('en-US', { minimumFractionDigits: 2 })})${
            expensesByRecipient['Shaker'] ? ` + reimbursement (AED ${expensesByRecipient['Shaker'].toLocaleString('en-US', { minimumFractionDigits: 2 })})` : ''
          }`
        }
      ];

      // Create sales transaction
      await transactionService.createTransaction({
        amount: vehicle.purchase_price,
        type: 'income',
        category: 'Vehicle Sale',
        description: `Vehicle Sold - ${vehicle.year} ${vehicle.make} ${vehicle.model} (${vehicle.vin})`,
        date: vehicle.sale_date || new Date().toISOString().split('T')[0]
      });

      // Create profit transaction for Nada
      const nadaDistribution = newDistributions.find(d => d.recipient === 'Nada');
      if (nadaDistribution) {
        await transactionService.createTransaction({
          amount: (netProfit * 0.15) + (expensesByRecipient['Nada'] || 0), // 15% of net profit plus any expenses
          type: 'income',
          category: 'Profit-NADA',
          description: `Vehicle Sold - ${vehicle.year} ${vehicle.make} ${vehicle.model} (${vehicle.vin})\n15% of net profit (AED ${(netProfit * 0.15).toLocaleString('en-US', { minimumFractionDigits: 2 })})${
            expensesByRecipient['Nada'] ? ` + reimbursement (AED ${expensesByRecipient['Nada'].toLocaleString('en-US', { minimumFractionDigits: 2 })})` : ''
          }`,
          date: vehicle.sale_date || new Date().toISOString().split('T')[0]
        });
      }

      // Create profit transaction for Ahmed (without purchase price)
      const ahmedDistribution = newDistributions.find(d => d.recipient === 'Ahmed');
      if (ahmedDistribution) {
        await transactionService.createTransaction({
          amount: ahmedDistribution.profitOnly, // Use profitOnly amount which excludes purchase price
          type: 'income',
          category: 'Profit-AHMED',
          description: `Vehicle Sold - ${vehicle.year} ${vehicle.make} ${vehicle.model} (${vehicle.vin})\n35% of net profit (AED ${(netProfit * 0.35).toLocaleString('en-US', { minimumFractionDigits: 2 })})${
            expensesByRecipient['Ahmed'] ? ` + reimbursement (AED ${expensesByRecipient['Ahmed'].toLocaleString('en-US', { minimumFractionDigits: 2 })})` : ''
          }`,
          date: vehicle.sale_date || new Date().toISOString().split('T')[0]
        });
      }

      // Add new distributions
      for (const dist of newDistributions) {
        await vehicleService.addProfitDistribution({
          vehicle_id: id,
          recipient: dist.recipient,
          amount: dist.amount,
          percentage: dist.percentage,
          date: new Date().toISOString().split('T')[0],
          notes: dist.notes
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
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <p className="text-text-secondary">Vehicle not found</p>
        <button
          onClick={() => navigate('/vehicles')}
          className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
        >
          Back to Vehicles
        </button>
      </div>
    );
  }

  const totalExpenses = calculateTotalExpenses();
  const netProfit = calculateNetProfit();

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded text-sm">
          {error}
        </div>
      )}

      <VehicleHeader
        vehicle={vehicle}
        expenses={expenses}
        distributions={distributions}
        totalExpenses={totalExpenses}
        netProfit={netProfit}
        onBack={() => navigate('/vehicles')}
        onEdit={() => setShowEditVehicle(true)}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <VehiclePurchaseDetails vehicle={vehicle} />
        <VehicleSaleDetails vehicle={vehicle} />
      </div>

      <VehicleRegistrationDetails vehicle={vehicle} />

      <VehicleNotes vehicle={vehicle} />

      <div className="space-y-4 sm:space-y-6">
        <ExpenseHeader onAddExpense={() => setShowAddExpense(true)} />

        <div className="overflow-x-auto -mx-2 sm:mx-0">
          <div className="min-w-[600px] px-2 sm:px-0">
            <ExpenseTable
              expenses={expenses}
              totalExpenses={totalExpenses}
              onEdit={handleEditExpense}
              onDelete={handleDeleteExpense}
            />
          </div>
        </div>

        <VehicleProfitDistribution
          vehicle={vehicle}
          distributions={distributions}
          netProfit={netProfit}
          onAutoDistribute={handleAutoDistribute}
        />
      </div>

      <ExpenseModal
        isOpen={showAddExpense}
        expense={expenseForm}
        isEditing={!!editingExpense}
        error={error}
        onClose={() => {
          setShowAddExpense(false);
          setEditingExpense(null);
          setExpenseForm({
            type: '',
            amount: '',
            recipient: '',
            notes: '',
            date: new Date().toISOString().split('T')[0]
          });
        }}
        onChange={(field, value) => setExpenseForm(prev => ({ ...prev, [field]: value }))}
        onSubmit={() => editingExpense ? handleUpdateExpense() : handleAddExpense()}
      />

      {showEditVehicle && (
        <VehicleModal
          vehicle={vehicle}
          onClose={() => setShowEditVehicle(false)}
          onSave={async (updatedVehicle) => {
            try {
              await vehicleService.updateVehicle(vehicle.id, updatedVehicle);
              await loadVehicleDetails();
              setShowEditVehicle(false);
            } catch (err) {
              console.error(err);
              setError('Failed to update vehicle');
            }
          }}
        />
      )}
    </div>
  );
}
