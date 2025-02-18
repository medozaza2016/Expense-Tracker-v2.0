import React, { useState, useEffect } from 'react';
import { Plus, Filter, Search, FileText, FileSpreadsheet, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { transactionService } from '../../services/transactionService';
import { categoryService } from '../../services/categoryService';
import type { Transaction } from '../../types/interfaces';
import type { Category } from '../../services/categoryService';
import { TransactionFilters } from './TransactionFilters';
import { TransactionTable } from './TransactionTable';
import { TransactionModal } from './TransactionModal';
import { FilterModal } from './FilterModal';
import { exportToCSV, exportToPDF } from '../../utils/exportUtils';

type SortField = 'date' | 'category' | 'type';
type SortDirection = 'asc' | 'desc';
type PageSize = 25 | 50 | 100 | 'all';

export function TransactionList() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [displayedTransactions, setDisplayedTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSize>(25);
  const [totalPages, setTotalPages] = useState(1);
  
  // Filter states
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    type: '',
    category: ''
  });

  // Form states
  const [formData, setFormData] = useState({
    amount: '',
    type: 'expense',
    category: '',
    description: '',
    date: format(new Date(), 'yyyy-MM-dd')
  });

  useEffect(() => {
    loadTransactions();
    loadCategories();
  }, []);

  useEffect(() => {
    filterAndSortTransactions();
  }, [transactions, searchTerm, filters, sortField, sortDirection]);

  useEffect(() => {
    updateDisplayedTransactions();
  }, [filteredTransactions, currentPage, pageSize]);

  const loadTransactions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await transactionService.getTransactions();
      setTransactions(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load transactions';
      setError(errorMessage);
      console.error('Error loading transactions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await categoryService.getCategories();
      setCategories(data);
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filterAndSortTransactions = () => {
    let filtered = [...transactions];

    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(transaction => 
        transaction.description.toLowerCase().includes(search) ||
        transaction.category.toLowerCase().includes(search)
      );
    }

    // Apply date filters
    if (filters.startDate) {
      filtered = filtered.filter(transaction => 
        transaction.date >= filters.startDate
      );
    }
    if (filters.endDate) {
      filtered = filtered.filter(transaction => 
        transaction.date <= filters.endDate
      );
    }

    // Apply type filter
    if (filters.type) {
      filtered = filtered.filter(transaction => 
        transaction.type === filters.type
      );
    }

    // Apply category filter
    if (filters.category) {
      filtered = filtered.filter(transaction => 
        transaction.category === filters.category
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    setFilteredTransactions(filtered);
    setCurrentPage(1); // Reset to first page when filters change
    setTotalPages(Math.ceil(filtered.length / (pageSize === 'all' ? filtered.length : pageSize)));
  };

  const updateDisplayedTransactions = () => {
    if (pageSize === 'all') {
      setDisplayedTransactions(filteredTransactions);
      return;
    }

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    setDisplayedTransactions(filteredTransactions.slice(startIndex, endIndex));
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newSize: PageSize) => {
    setPageSize(newSize);
    setCurrentPage(1); // Reset to first page when changing page size
    setTotalPages(Math.ceil(filteredTransactions.length / (newSize === 'all' ? filteredTransactions.length : newSize)));
  };

  const handleAddTransaction = async () => {
    try {
      setError(null);

      // Validate amount
      const amount = parseFloat(formData.amount);
      if (isNaN(amount)) {
        throw new Error('Please enter a valid amount');
      }
      if (amount <= 0) {
        throw new Error('Amount must be greater than 0');
      }

      // Validate category
      if (!formData.category) {
        throw new Error('Please select a category');
      }

      // Validate description
      if (!formData.description.trim()) {
        throw new Error('Please enter a description');
      }

      // Validate date
      if (!formData.date) {
        throw new Error('Please select a date');
      }

      // Validate type
      if (!['income', 'expense'].includes(formData.type)) {
        throw new Error('Invalid transaction type');
      }

      // Create the transaction
      const transaction = await transactionService.createTransaction({
        amount,
        type: formData.type as 'income' | 'expense',
        category: formData.category.trim(),
        description: formData.description.trim(),
        date: formData.date
      });

      // Update state only if transaction was created successfully
      if (transaction) {
        setTransactions(prev => [transaction, ...prev]);
        setShowAddModal(false);
        setFormData({
          amount: '',
          type: 'expense',
          category: '',
          description: '',
          date: format(new Date(), 'yyyy-MM-dd')
        });
      } else {
        throw new Error('Failed to create transaction');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create transaction';
      setError(errorMessage);
      console.error('Error creating transaction:', err);
    }
  };

  const handleUpdateTransaction = async (id: string) => {
    try {
      setError(null);
      const amount = parseFloat(formData.amount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Please enter a valid amount');
      }

      const updated = await transactionService.updateTransaction(id, {
        ...formData,
        amount
      });

      setTransactions(transactions.map(t => 
        t.id === id ? updated : t
      ));
      setEditingTransaction(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update transaction';
      setError(errorMessage);
      console.error('Error updating transaction:', err);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;
    
    try {
      setError(null);
      await transactionService.deleteTransaction(id);
      setTransactions(transactions.filter(t => t.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete transaction';
      setError(errorMessage);
      console.error('Error deleting transaction:', err);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    
    try {
      const newCategory = await categoryService.createCategory(newCategoryName);
      setCategories([...categories, newCategory]);
      setFormData({
        ...formData,
        category: newCategory.name
      });
      setNewCategoryName('');
      setIsAddingCategory(false);
    } catch (err) {
      setError('Failed to create category');
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

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-text-primary">Transactions</h1>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search transactions..."
              className="w-full px-4 py-2 pl-10 pr-4 bg-background border border-gray-700 rounded-lg text-text-primary placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-text-secondary" />
          </div>

          <button
            onClick={() => setShowFilterModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-background border border-gray-700 rounded-lg text-text-primary hover:bg-card/60 transition-colors"
          >
            <Filter className="w-5 h-5" />
            Filter
          </button>

          <button
            onClick={() => exportToCSV(filteredTransactions)}
            className="flex items-center gap-2 px-4 py-2 bg-background border border-gray-700 rounded-lg text-text-primary hover:bg-card/60 transition-colors"
          >
            <FileSpreadsheet className="w-5 h-5" />
            Export CSV
          </button>

          <button
            onClick={() => exportToPDF(filteredTransactions)}
            className="flex items-center gap-2 px-4 py-2 bg-background border border-gray-700 rounded-lg text-text-primary hover:bg-card/60 transition-colors"
          >
            <FileText className="w-5 h-5" />
            Export PDF
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Transaction
          </button>
        </div>
      </div>

      <TransactionFilters
        filters={filters}
        searchTerm={searchTerm}
        onFilterChange={(key, value) => setFilters(prev => ({ ...prev, [key]: value }))}
        onSearchChange={setSearchTerm}
        onReset={() => {
          setFilters({
            startDate: '',
            endDate: '',
            type: '',
            category: ''
          });
          setSearchTerm('');
        }}
      />

      <TransactionTable
        transactions={displayedTransactions}
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={handleSort}
        onEdit={transaction => {
          setEditingTransaction(transaction);
          setFormData({
            amount: transaction.amount.toString(),
            type: transaction.type,
            category: transaction.category,
            description: transaction.description,
            date: transaction.date
          });
        }}
        onDelete={handleDeleteTransaction}
      />

      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-card p-4 rounded-lg border border-gray-800">
        <div className="flex items-center gap-2">
          <span className="text-sm text-text-secondary">
            Showing {displayedTransactions.length} of {filteredTransactions.length} transactions
          </span>
          <select
            value={pageSize.toString()}
            onChange={(e) => handlePageSizeChange(e.target.value === 'all' ? 'all' : Number(e.target.value) as PageSize)}
            className="px-2 py-1 bg-background border border-gray-700 rounded text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50"
          >
            <option value="25">25 per page</option>
            <option value="50">50 per page</option>
            <option value="100">100 per page</option>
            <option value="all">Show all</option>
          </select>
        </div>

        {pageSize !== 'all' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1 text-text-secondary hover:text-accent disabled:opacity-50 disabled:hover:text-text-secondary"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1 rounded ${
                    currentPage === page
                      ? 'bg-accent text-white'
                      : 'text-text-secondary hover:bg-background'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-1 text-text-secondary hover:text-accent disabled:opacity-50 disabled:hover:text-text-secondary"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      <TransactionModal
        isOpen={showAddModal || editingTransaction !== null}
        mode={editingTransaction ? 'edit' : 'add'}
        formData={formData}
        categories={categories}
        isAddingCategory={isAddingCategory}
        newCategoryName={newCategoryName}
        onClose={() => {
          setShowAddModal(false);
          setEditingTransaction(null);
          setFormData({
            amount: '',
            type: 'expense',
            category: '',
            description: '',
            date: format(new Date(), 'yyyy-MM-dd')
          });
        }}
        onSubmit={() => {
          if (editingTransaction) {
            handleUpdateTransaction(editingTransaction.id);
          } else {
            handleAddTransaction();
          }
        }}
        onChange={(field, value) => setFormData(prev => ({ ...prev, [field]: value }))}
        onAddCategory={handleAddCategory}
        onCancelAddCategory={() => {
          setIsAddingCategory(false);
          setNewCategoryName('');
        }}
        onNewCategoryNameChange={setNewCategoryName}
        onStartAddCategory={() => setIsAddingCategory(true)}
      />

      <FilterModal
        isOpen={showFilterModal}
        filters={filters}
        categories={categories}
        onClose={() => setShowFilterModal(false)}
        onApply={() => setShowFilterModal(false)}
        onReset={() => {
          setFilters({
            startDate: '',
            endDate: '',
            type: '',
            category: ''
          });
          setShowFilterModal(false);
        }}
        onChange={(key, value) => setFilters(prev => ({ ...prev, [key]: value }))}
      />
    </div>
  );
}
