import { X } from 'lucide-react';
import { format } from 'date-fns';
import type { Category } from '../../services/categoryService';

interface TransactionFormData {
  amount: string;
  type: string;
  category: string;
  description: string;
  date: string;
}

interface TransactionModalProps {
  isOpen: boolean;
  mode: 'add' | 'edit';
  formData: TransactionFormData;
  categories: Category[];
  isAddingCategory: boolean;
  newCategoryName: string;
  onClose: () => void;
  onSubmit: () => void;
  onChange: (field: keyof TransactionFormData, value: string) => void;
  onAddCategory: () => Promise<void>;
  onCancelAddCategory: () => void;
  onNewCategoryNameChange: (value: string) => void;
  onStartAddCategory: () => void;
}

export function TransactionModal({
  isOpen,
  mode,
  formData,
  categories,
  isAddingCategory,
  newCategoryName,
  onClose,
  onSubmit,
  onChange,
  onAddCategory,
  onCancelAddCategory,
  onNewCategoryNameChange,
  onStartAddCategory
}: TransactionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm z-50">
      <div className="bg-card p-6 rounded-lg border border-gray-800 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-text-primary">
            {mode === 'add' ? 'Add New Transaction' : 'Edit Transaction'}
          </h3>
          <button
            onClick={onClose}
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
              value={formData.date}
              onChange={(e) => onChange('date', e.target.value)}
              className="w-full px-3 py-2 bg-background border border-gray-700 rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Description
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => onChange('description', e.target.value)}
              className="w-full px-3 py-2 bg-background border border-gray-700 rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50"
              placeholder="Transaction description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => onChange('type', e.target.value)}
              className="w-full px-3 py-2 bg-background border border-gray-700 rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50"
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Category
            </label>
            {isAddingCategory ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => onNewCategoryNameChange(e.target.value)}
                  placeholder="New category name"
                  className="flex-1 px-3 py-2 bg-background border border-gray-700 rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50"
                  autoFocus
                />
                <button
                  onClick={onAddCategory}
                  className="px-4 py-2 bg-accent text-white rounded-md hover:bg-accent/90 transition-colors"
                >
                  Add
                </button>
                <button
                  onClick={onCancelAddCategory}
                  className="px-4 py-2 text-text-primary hover:bg-background rounded-md transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <select
                  value={formData.category}
                  onChange={(e) => onChange('category', e.target.value)}
                  className="flex-1 px-3 py-2 bg-background border border-gray-700 rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50"
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={onStartAddCategory}
                  className="px-3 py-2 bg-accent text-white rounded-md hover:bg-accent/90 transition-colors"
                  title="Add new category"
                >
                  +
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Amount
            </label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => onChange('amount', e.target.value)}
              className="w-full px-3 py-2 bg-background border border-gray-700 rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50"
              placeholder="0.00"
              step="0.01"
              min="0"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
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
            {mode === 'add' ? 'Add Transaction' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
