import { format, parseISO } from 'date-fns';
import { ArrowUpDown, Edit2, Trash2, Check, X } from 'lucide-react';
import type { Transaction } from '../../types/interfaces';

interface TransactionTableProps {
  transactions: Transaction[];
  sortField: string;
  sortDirection: string;
  onSort: (field: string) => void;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
}

// Category color mapping
const getCategoryColor = (category: string) => {
  switch (category.toLowerCase()) {
    // Income categories
    case 'sales':
      return 'bg-emerald-500/10 text-emerald-400';
    case 'profit-ahmed':
    case 'profit-nada':
      return 'bg-green-500/10 text-green-400';
    case 'contribution':
      return 'bg-blue-500/10 text-blue-400';
    case 'capital':
      return 'bg-indigo-500/10 text-indigo-400';
    case 'investment':
      return 'bg-purple-500/10 text-purple-400';

    // Expense categories
    case 'asset':
      return 'bg-amber-500/10 text-amber-400';
    case 'distribution':
      return 'bg-orange-500/10 text-orange-400';
    case 'personal expenses':
      return 'bg-red-500/10 text-red-400';
    
    // Default for other categories
    default:
      return 'bg-gray-500/10 text-gray-400';
  }
};

export function TransactionTable({
  transactions,
  sortField,
  sortDirection,
  onSort,
  onEdit,
  onDelete
}: TransactionTableProps) {
  // Function to format date with timezone handling
  const formatTransactionDate = (dateString: string) => {
    // Parse the ISO date string
    const date = parseISO(dateString);
    
    // Create a new date with the local timezone
    const localDate = new Date(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate()
    );
    
    return format(localDate, 'MMM d, yyyy');
  };

  return (
    <div className="bg-card rounded-lg shadow border border-gray-800 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-background">
            <tr>
              <th 
                className="px-4 py-2 text-left text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer hover:text-accent"
                onClick={() => onSort('date')}
              >
                <div className="flex items-center gap-2">
                  Date
                  <ArrowUpDown className={`w-4 h-4 ${sortField === 'date' ? 'text-accent' : ''}`} />
                </div>
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                Description
              </th>
              <th 
                className="px-4 py-2 text-left text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer hover:text-accent"
                onClick={() => onSort('category')}
              >
                <div className="flex items-center gap-2">
                  Category
                  <ArrowUpDown className={`w-4 h-4 ${sortField === 'category' ? 'text-accent' : ''}`} />
                </div>
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                Amount
              </th>
              <th 
                className="px-4 py-2 text-left text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer hover:text-accent"
                onClick={() => onSort('type')}
              >
                <div className="flex items-center gap-2">
                  Type
                  <ArrowUpDown className={`w-4 h-4 ${sortField === 'type' ? 'text-accent' : ''}`} />
                </div>
              </th>
              <th className="px-4 py-2 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-card divide-y divide-gray-800">
            {transactions.map((transaction) => (
              <tr 
                key={transaction.id} 
                className="hover:bg-background/50 transition-colors cursor-pointer"
                onClick={() => onEdit(transaction)}
              >
                <td className="px-4 py-2 whitespace-nowrap text-sm text-text-primary">
                  {formatTransactionDate(transaction.date)}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-text-primary">
                  {transaction.description}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm">
                  <span className={`px-2 py-0.5 text-xs rounded-full ${getCategoryColor(transaction.category)}`}>
                    {transaction.category}
                  </span>
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm">
                  <span className={transaction.type === 'income' ? 'text-green-400' : 'text-red-400'}>
                    AED {transaction.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm">
                  <span className={`px-2 py-0.5 text-xs rounded-full ${
                    transaction.type === 'income'
                      ? 'bg-green-500/10 text-green-400'
                      : 'bg-red-500/10 text-red-400'
                  }`}>
                    {transaction.type === 'income' ? 'Income' : 'Expense'}
                  </span>
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-text-secondary text-right">
                  <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onEdit(transaction)}
                      className="p-1 hover:text-accent transition-colors"
                      title="Edit transaction"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(transaction.id)}
                      className="p-1 hover:text-red-400 transition-colors"
                      title="Delete transaction"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {transactions.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-text-secondary">
                  No transactions found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
