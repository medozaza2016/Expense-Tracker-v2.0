import { format } from 'date-fns';
import { Edit2, X } from 'lucide-react';
import type { VehicleExpense } from '../../services/vehicleService';

interface ExpenseTableProps {
  expenses: VehicleExpense[];
  totalExpenses: number;
  onEdit: (expense: VehicleExpense) => void;
  onDelete: (id: string) => void;
}

export function ExpenseTable({
  expenses,
  totalExpenses,
  onEdit,
  onDelete
}: ExpenseTableProps) {
  return (
    <div className="bg-card rounded-lg border border-gray-800 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-background">
              <th className="px-4 py-2 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Date</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Type</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Amount</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Recipient</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {expenses.map((expense) => (
              <tr key={expense.id} className="hover:bg-background/50 transition-colors">
                <td className="px-4 py-2 text-sm text-text-primary whitespace-nowrap">
                  {format(new Date(expense.date), 'MMM d, yyyy')}
                </td>
                <td className="px-4 py-2 text-sm text-text-primary">{expense.type}</td>
                <td className="px-4 py-2 text-sm text-red-400 whitespace-nowrap">
                  AED {expense.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-4 py-2 text-sm text-text-primary">{expense.recipient || '-'}</td>
                <td className="px-4 py-2 text-sm text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => onEdit(expense)}
                      className="p-1 text-text-secondary hover:text-accent transition-colors"
                      title="Edit expense"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => onDelete(expense.id)}
                      className="p-1 text-text-secondary hover:text-red-400 transition-colors"
                      title="Delete expense"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
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
          <tfoot className="bg-background">
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
  );
}
