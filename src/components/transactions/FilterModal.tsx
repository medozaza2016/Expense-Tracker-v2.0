import { X, Calendar } from 'lucide-react';
import type { Category } from '../../services/categoryService';

interface FilterModalProps {
  isOpen: boolean;
  filters: {
    startDate: string;
    endDate: string;
    type: string;
    category: string;
  };
  categories: Category[];
  onClose: () => void;
  onApply: () => void;
  onReset: () => void;
  onChange: (key: string, value: string) => void;
}

export function FilterModal({
  isOpen,
  filters,
  categories,
  onClose,
  onApply,
  onReset,
  onChange
}: FilterModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm z-50">
      <div className="bg-card p-6 rounded-lg border border-gray-800 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium text-text-primary">Filter Transactions</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-background/50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-3">
              Date Range
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-text-secondary mb-1">From</label>
                <div className="relative">
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => onChange('startDate', e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-gray-700 rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50"
                  />
                  <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-text-secondary pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-text-secondary mb-1">To</label>
                <div className="relative">
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => onChange('endDate', e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-gray-700 rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50"
                  />
                  <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-text-secondary pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Type
            </label>
            <select
              value={filters.type}
              onChange={(e) => onChange('type', e.target.value)}
              className="w-full px-3 py-2 bg-background border border-gray-700 rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50"
            >
              <option value="">All types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Category
            </label>
            <select
              value={filters.category}
              onChange={(e) => onChange('category', e.target.value)}
              className="w-full px-3 py-2 bg-background border border-gray-700 rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50"
            >
              <option value="">All categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-800">
            <button
              onClick={onReset}
              className="px-4 py-2 text-text-primary hover:bg-background rounded-md transition-colors"
            >
              Reset
            </button>
            <button
              onClick={onApply}
              className="px-4 py-2 bg-accent text-white rounded-md hover:bg-accent/90 transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
