import { X } from 'lucide-react';

interface TransactionFiltersProps {
  filters: {
    startDate: string;
    endDate: string;
    type: string;
    category: string;
  };
  searchTerm: string;
  onFilterChange: (key: string, value: string) => void;
  onSearchChange: (value: string) => void;
  onReset: () => void;
}

export function TransactionFilters({ 
  filters, 
  searchTerm, 
  onFilterChange, 
  onSearchChange,
  onReset 
}: TransactionFiltersProps) {
  if (!(filters.startDate || filters.endDate || filters.type || filters.category || searchTerm)) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {filters.startDate && (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-accent/10 text-accent rounded-full text-sm">
          From: {filters.startDate}
          <X 
            className="w-4 h-4 cursor-pointer" 
            onClick={() => onFilterChange('startDate', '')} 
          />
        </span>
      )}
      {filters.endDate && (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-accent/10 text-accent rounded-full text-sm">
          To: {filters.endDate}
          <X 
            className="w-4 h-4 cursor-pointer" 
            onClick={() => onFilterChange('endDate', '')} 
          />
        </span>
      )}
      {filters.type && (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-accent/10 text-accent rounded-full text-sm">
          Type: {filters.type}
          <X 
            className="w-4 h-4 cursor-pointer" 
            onClick={() => onFilterChange('type', '')} 
          />
        </span>
      )}
      {filters.category && (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-accent/10 text-accent rounded-full text-sm">
          Category: {filters.category}
          <X 
            className="w-4 h-4 cursor-pointer" 
            onClick={() => onFilterChange('category', '')} 
          />
        </span>
      )}
      {searchTerm && (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-accent/10 text-accent rounded-full text-sm">
          Search: {searchTerm}
          <X 
            className="w-4 h-4 cursor-pointer" 
            onClick={() => onSearchChange('')} 
          />
        </span>
      )}
      <button
        onClick={onReset}
        className="text-sm text-text-secondary hover:text-text-primary transition-colors"
      >
        Clear all filters
      </button>
    </div>
  );
}
