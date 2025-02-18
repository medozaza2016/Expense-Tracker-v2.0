import { Plus } from 'lucide-react';

interface ExpenseHeaderProps {
  onAddExpense: () => void;
}

export function ExpenseHeader({ onAddExpense }: ExpenseHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg font-medium text-text-primary">Expenses</h3>
      <button
        onClick={onAddExpense}
        className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
      >
        <Plus className="w-5 h-5" />
        Add Expense
      </button>
    </div>
  );
}
