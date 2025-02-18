import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { categoryService, type Category } from '../../services/categoryService';

export function CategoryList() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      const data = await categoryService.getCategories();
      setCategories(data);
    } catch (err) {
      setError('Failed to load categories');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      setError('Category name is required');
      return;
    }
    
    try {
      setError(null);
      const newCategory = await categoryService.createCategory(newCategoryName.trim());
      setCategories(prev => [...prev, newCategory]);
      setNewCategoryName('');
      setIsAddingCategory(false);
    } catch (err) {
      setError('Failed to create category');
      console.error(err);
    }
  };

  const handleUpdateCategory = async (id: string, name: string) => {
    if (!name.trim()) {
      setError('Category name is required');
      return;
    }

    try {
      setError(null);
      const updatedCategory = await categoryService.updateCategory(id, name.trim());
      setCategories(categories.map(cat => 
        cat.id === id ? updatedCategory : cat
      ));
      setEditingCategory(null);
    } catch (err) {
      setError('Failed to update category');
      console.error(err);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    const confirmMessage = 'Are you sure you want to delete this category? This action cannot be undone.';
    
    if (!window.confirm(confirmMessage)) return;
    
    try {
      setError(null);
      await categoryService.deleteCategory(id);
      setCategories(categories.filter(cat => cat.id !== id));
    } catch (err) {
      setError('Failed to delete category');
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

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-text-primary">Categories</h1>
        <button
          onClick={() => setIsAddingCategory(true)}
          className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Category
        </button>
      </div>

      {isAddingCategory && (
        <div className="bg-card p-4 rounded-lg shadow border border-gray-800">
          <div className="flex gap-4">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Category name"
              className="flex-1 px-3 py-2 bg-background border border-gray-700 rounded-lg text-text-primary placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleAddCategory();
                }
              }}
            />
            <button
              onClick={handleAddCategory}
              className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
            >
              Add
            </button>
            <button
              onClick={() => {
                setIsAddingCategory(false);
                setNewCategoryName('');
                setError(null);
              }}
              className="px-4 py-2 border border-gray-700 text-text-primary rounded-lg hover:bg-background transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <div key={category.id} className="bg-card p-4 rounded-lg shadow border border-gray-800">
            <div className="flex justify-between items-center">
              {editingCategory?.id === category.id ? (
                <input
                  type="text"
                  value={editingCategory.name}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                  className="px-2 py-1 bg-background border border-gray-700 rounded text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50"
                  autoFocus
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleUpdateCategory(category.id, editingCategory.name);
                    }
                  }}
                />
              ) : (
                <h3 className="text-lg font-medium text-text-primary">{category.name}</h3>
              )}
              <div className="flex gap-2">
                {editingCategory?.id === category.id ? (
                  <>
                    <button
                      onClick={() => handleUpdateCategory(category.id, editingCategory.name)}
                      className="text-sm text-accent hover:text-accent/80"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditingCategory(null);
                        setError(null);
                      }}
                      className="text-sm text-text-secondary hover:text-text-primary"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setEditingCategory(category)}
                      className="p-1 text-text-secondary hover:text-accent"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="p-1 text-text-secondary hover:text-red-400"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>
            </div>
            <div className="mt-2 flex justify-between items-center text-sm text-text-secondary">
              <span>Used in {category.transaction_count || 0} transactions</span>
              {category.total_income !== undefined && category.total_expenses !== undefined && (
                <div className="flex gap-4">
                  <span className="text-green-400">+{category.total_income.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  <span className="text-red-400">-{category.total_expenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
