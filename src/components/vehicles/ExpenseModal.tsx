import { format } from 'date-fns';
import { X } from 'lucide-react';
import type { VehicleExpense } from '../../services/vehicleService';

interface ExpenseModalProps {
  isOpen: boolean;
  expense: {
    type: string;
    amount: string;
    recipient: string;
    notes: string;
    date: string;
  };
  isEditing: boolean;
  error: string | null;
  onClose: () => void;
  onChange: (field: string, value: string) => void;
  onSubmit: () => void;
}

export function ExpenseModal({
  isOpen,
  expense,
  isEditing,
  error,
  onClose,
  onChange,
  onSubmit
}: ExpenseModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm z-50">
      <div className="bg-card p-6 rounded-lg border border-gray-800 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-text-primary">
            {isEditing ? 'Edit Expense' : 'Add Expense'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-background/50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Date
            </label>
            <input
              type="date"
              value={expense.date}
              onChange={(e) => onChange('date', e.target.value)}
              className="w-full px-3 py-2 bg-background border border-gray-700 rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Type
            </label>
            <input
              type="text"
              value={expense.type}
              onChange={(e) => onChange('type', e.target.value)}
              placeholder="e.g., Repairs, Insurance, etc."
              className="w-full px-3 py-2 bg-background border border-gray-700 rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Amount
            </label>
            <input
              type="number"
              value={expense.amount}
              onChange={(e) => onChange('amount', e.target.value)}
              placeholder="0.00"
              step="0.01"
              min="0"
              className="w-full px-3 py-2 bg-background border border-gray-700 rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Recipient
            </label>
            <select
              value={expense.recipient}
              onChange={(e) => onChange('recipient', e.target.value)}
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
              value={expense.notes}
              onChange={(e) => onChange('notes', e.target.value)}
              placeholder="Additional details..."
              rows={3}
              className="w-full px-3 py-2 bg-background border border-gray-700 rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-text-primary hover:bg-background rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            className="px-4 py-2 bg-accent text-white rounded-md hover:bg-accent/90 transition-colors"
          >
            {isEditing ? 'Save Changes' : 'Add Expense'}
          </button>
        </div>
      </div>
    </div>
  );
}
