import { supabase } from './supabase';
import { auditService } from './auditService';
import type { Transaction } from '../types/interfaces';

export const transactionService = {
  async getTransactions(): Promise<Transaction[]> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error loading transactions:', error);
      throw error;
    }
  },

  async createTransaction(transaction: Omit<Transaction, 'id' | 'user_id' | 'created_at'>): Promise<Transaction> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert(transaction)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Failed to create transaction');

      // Create audit log
      await auditService.createAuditLog({
        user_id: (await supabase.auth.getUser()).data.user?.id,
        action_type: 'CREATE',
        entity_type: 'TRANSACTION',
        entity_id: data.id,
        new_data: data,
        description: `Created ${data.type} transaction: ${data.description}`
      });

      return data;
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  },

  async updateTransaction(id: string, transaction: Partial<Transaction>): Promise<Transaction> {
    try {
      // Get old data for audit log
      const { data: oldData, error: fetchError } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      const { data, error } = await supabase
        .from('transactions')
        .update(transaction)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Transaction not found');

      // Create audit log
      await auditService.createAuditLog({
        user_id: (await supabase.auth.getUser()).data.user?.id,
        action_type: 'UPDATE',
        entity_type: 'TRANSACTION',
        entity_id: id,
        old_data: oldData,
        new_data: data,
        description: `Updated ${data.type} transaction: ${data.description}`
      });

      return data;
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  },

  async deleteTransaction(id: string): Promise<void> {
    try {
      // Get transaction data for audit log
      const { data: transaction, error: fetchError } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Create audit log
      if (transaction) {
        await auditService.createAuditLog({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          action_type: 'DELETE',
          entity_type: 'TRANSACTION',
          entity_id: id,
          old_data: transaction,
          description: `Deleted ${transaction.type} transaction: ${transaction.description}`
        });
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  },

  async deleteTransactionByReference(referenceId: string): Promise<void> {
    try {
      // First find all transactions with this reference
      const { data: transactions, error: findError } = await supabase
        .from('transactions')
        .select('*')
        .eq('reference_id', referenceId);

      if (findError) throw findError;

      // If no transactions found, nothing to do
      if (!transactions || transactions.length === 0) {
        return;
      }

      // Delete all transactions with this reference
      const { error: deleteError } = await supabase
        .from('transactions')
        .delete()
        .eq('reference_id', referenceId);

      if (deleteError) throw deleteError;

      // Create audit log for each deleted transaction
      for (const transaction of transactions) {
        await auditService.createAuditLog({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          action_type: 'DELETE',
          entity_type: 'TRANSACTION',
          entity_id: transaction.id,
          old_data: transaction,
          description: `Deleted linked transaction for expense ${referenceId}`
        });
      }
    } catch (error) {
      console.error('Error deleting transaction by reference:', error);
      throw error;
    }
  },

  async updateTransactionByReference(
    referenceId: string, 
    data: Partial<Omit<Transaction, 'id' | 'user_id' | 'created_at'>>
  ): Promise<void> {
    try {
      // First find all transactions with this reference
      const { data: existingTransactions, error: findError } = await supabase
        .from('transactions')
        .select('*')
        .eq('reference_id', referenceId);

      if (findError) throw findError;

      // If no transactions exist, create a new one
      if (!existingTransactions || existingTransactions.length === 0) {
        const { error: createError } = await supabase
          .from('transactions')
          .insert({
            ...data,
            reference_id: referenceId
          });

        if (createError) throw createError;
        return;
      }

      // Delete all existing transactions except the first one
      if (existingTransactions.length > 1) {
        const keepId = existingTransactions[0].id;
        const { error: cleanupError } = await supabase
          .from('transactions')
          .delete()
          .eq('reference_id', referenceId)
          .neq('id', keepId);

        if (cleanupError) throw cleanupError;
      }

      // Update the remaining transaction
      const { data: updatedTransaction, error: updateError } = await supabase
        .from('transactions')
        .update(data)
        .eq('id', existingTransactions[0].id)
        .select()
        .single();

      if (updateError) throw updateError;

      // Create audit log
      await auditService.createAuditLog({
        user_id: (await supabase.auth.getUser()).data.user?.id,
        action_type: 'UPDATE',
        entity_type: 'TRANSACTION',
        entity_id: updatedTransaction.id,
        old_data: existingTransactions[0],
        new_data: updatedTransaction,
        description: `Updated linked transaction for expense ${referenceId}`
      });
    } catch (error) {
      console.error('Error updating transaction by reference:', error);
      throw error;
    }
  }
};
