import { supabase } from './supabase';

export interface Category {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
  transaction_count?: number;
  total_income?: number;
  total_expenses?: number;
}

export const categoryService = {
  async getCategories(): Promise<Category[]> {
    try {
      // First get all categories
      const { data: categories, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (categoriesError) {
        console.error('Error loading categories:', categoriesError);
        return [];
      }

      if (!categories) return [];

      // Then get transaction stats for each category
      const { data: transactions, error: transactionsError } = await supabase
        .from('transactions')
        .select('category, type, amount');

      if (transactionsError) {
        console.error('Error loading transactions:', transactionsError);
        return categories;
      }

      // Calculate stats for each category
      return categories.map(category => {
        const categoryTransactions = transactions?.filter(t => t.category === category.name) || [];
        const transaction_count = categoryTransactions.length;
        const total_income = categoryTransactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + (t.amount || 0), 0);
        const total_expenses = categoryTransactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + (t.amount || 0), 0);

        return {
          ...category,
          transaction_count,
          total_income,
          total_expenses
        };
      });
    } catch (error) {
      console.error('Error loading categories:', error);
      return [];
    }
  },

  async createCategory(name: string): Promise<Category> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert({ name })
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Category not created');
      
      return {
        ...data,
        transaction_count: 0,
        total_income: 0,
        total_expenses: 0
      };
    } catch (error) {
      console.error('Error creating category:', error);
      throw error instanceof Error ? error : new Error('An unexpected error occurred');
    }
  },

  async updateCategory(id: string, name: string): Promise<Category> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .update({ name })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Category not found');

      // Get transaction stats for the updated category
      const { data: transactions } = await supabase
        .from('transactions')
        .select('type, amount')
        .eq('category', name);

      const transaction_count = transactions?.length || 0;
      const total_income = transactions
        ?.filter(t => t.type === 'income')
        .reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
      const total_expenses = transactions
        ?.filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
      
      return {
        ...data,
        transaction_count,
        total_income,
        total_expenses
      };
    } catch (error) {
      console.error('Error updating category:', error);
      throw error instanceof Error ? error : new Error('An unexpected error occurred');
    }
  },

  async deleteCategory(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error instanceof Error ? error : new Error('An unexpected error occurred');
    }
  }
};
