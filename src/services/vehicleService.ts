import { supabase } from './supabase';
import { auditService } from './auditService';
import { transactionService } from './transactionService';

export interface Vehicle {
  id: string;
  vin: string;
  make: string;
  model: string;
  year: number;
  color: string;
  status: 'AVAILABLE' | 'SOLD';
  purchase_price: number;
  sale_price?: number | null;
  purchase_date: string;
  sale_date?: string | null;
  notes?: string;
  owner_name?: string | null;
  tc_number?: string | null;
  certificate_number?: string | null;
  registration_location?: string | null;
  created_at: string;
  updated_at: string;
}

export interface VehicleExpense {
  id: string;
  vehicle_id: string;
  date: string;
  type: string;
  amount: number;
  recipient?: string | null;
  notes?: string | null;
  created_at: string;
}

export interface ProfitDistribution {
  id: string;
  vehicle_id: string;
  recipient: string;
  amount: number;
  percentage: number;
  date: string;
  notes?: string | null;
  created_at: string;
}

export interface VehicleFinancials extends Vehicle {
  total_expenses: number;
  net_profit: number;
  total_distributed: number;
}

export const vehicleService = {
  async getVehicles(): Promise<Vehicle[]> {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      throw error;
    }
  },

  async getVehicleById(id: string): Promise<Vehicle | null> {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching vehicle:', error);
      throw error;
    }
  },

  async getVehicleFinancials(): Promise<VehicleFinancials[]> {
    try {
      const { data, error } = await supabase
        .from('vehicle_financials')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching vehicle financials:', error);
      throw error;
    }
  },

  async getVehicleExpenses(vehicleId: string): Promise<VehicleExpense[]> {
    try {
      const { data, error } = await supabase
        .from('vehicle_expenses')
        .select('*')
        .eq('vehicle_id', vehicleId)
        .order('date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching vehicle expenses:', error);
      throw error;
    }
  },

  async getProfitDistributions(vehicleId: string): Promise<ProfitDistribution[]> {
    try {
      const { data, error } = await supabase
        .from('profit_distributions')
        .select('*')
        .eq('vehicle_id', vehicleId)
        .order('date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching profit distributions:', error);
      throw error;
    }
  },

  async createVehicle(vehicle: Omit<Vehicle, 'id' | 'created_at' | 'updated_at'>): Promise<Vehicle> {
    try {
      if (!vehicle.vin || !vehicle.make || !vehicle.model || !vehicle.year || !vehicle.purchase_price) {
        throw new Error('Missing required fields');
      }

      const { data, error } = await supabase
        .from('vehicles')
        .insert({
          ...vehicle,
          color: vehicle.color || '',
          purchase_date: vehicle.purchase_date || new Date().toISOString().split('T')[0],
          sale_date: vehicle.status === 'SOLD' ? (vehicle.sale_date || new Date().toISOString().split('T')[0]) : null,
          owner_name: vehicle.owner_name || null,
          tc_number: vehicle.tc_number || null,
          certificate_number: vehicle.certificate_number || null,
          registration_location: vehicle.registration_location || null
        })
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Failed to create vehicle');

      // Create audit log
      await auditService.createAuditLog({
        user_id: (await supabase.auth.getUser()).data.user?.id,
        action_type: 'CREATE',
        entity_type: 'VEHICLE',
        entity_id: data.id,
        new_data: data,
        description: `Created vehicle: ${data.year} ${data.make} ${data.model}`
      });

      return data;
    } catch (error) {
      console.error('Error creating vehicle:', error);
      throw error;
    }
  },

  async updateVehicle(id: string, vehicle: Partial<Vehicle>): Promise<Vehicle> {
    try {
      // Get old data for audit and status check
      const { data: oldData, error: fetchError } = await supabase
        .from('vehicles')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      // Check if status is changing from SOLD to AVAILABLE
      const isChangingToAvailable = oldData?.status === 'SOLD' && vehicle.status === 'AVAILABLE';

      // If changing to AVAILABLE, clear sale-related fields
      if (isChangingToAvailable) {
        vehicle = {
          ...vehicle,
          sale_price: null,
          sale_date: null
        };

        // Delete all profit distributions
        const { error: deleteError } = await supabase
          .from('profit_distributions')
          .delete()
          .eq('vehicle_id', id);

        if (deleteError) throw deleteError;

        // Create audit log for clearing distributions
        await auditService.createAuditLog({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          action_type: 'DELETE',
          entity_type: 'PROFIT_DISTRIBUTION',
          entity_id: id,
          old_data: { vehicle_id: id },
          description: `Cleared profit distributions for vehicle ${oldData.year} ${oldData.make} ${oldData.model} due to status change to AVAILABLE`
        });
      }

      // Update vehicle
      const { data, error } = await supabase
        .from('vehicles')
        .update({
          ...vehicle,
          color: vehicle.color || '',
          updated_at: new Date().toISOString(),
          owner_name: vehicle.owner_name || null,
          tc_number: vehicle.tc_number || null,
          certificate_number: vehicle.certificate_number || null,
          registration_location: vehicle.registration_location || null
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Vehicle not found');

      // Create audit log
      const user = await supabase.auth.getUser();
      await auditService.createAuditLog({
        user_id: user.data.user?.id,
        action_type: 'UPDATE',
        entity_type: 'VEHICLE',
        entity_id: id,
        old_data: oldData,
        new_data: data,
        description: `Updated vehicle: ${data.year} ${data.make} ${data.model}`,
        metadata: {
          changes: Object.keys(vehicle).filter(key => 
            vehicle[key] !== oldData?.[key]
          )
        }
      });

      return data;
    } catch (error) {
      console.error('Error updating vehicle:', error);
      throw error;
    }
  },

  async addExpense(expense: Omit<VehicleExpense, 'id' | 'created_at'>): Promise<VehicleExpense> {
    try {
      // Get vehicle info for the transaction description
      const { data: vehicle, error: vehicleError } = await supabase
        .from('vehicles')
        .select('make, model, vin, year')
        .eq('id', expense.vehicle_id)
        .single();

      if (vehicleError) throw vehicleError;

      // Create the expense
      const { data, error } = await supabase
        .from('vehicle_expenses')
        .insert(expense)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Failed to add expense');

      // If the recipient is Ahmed, create a corresponding transaction
      if (data.recipient === 'Ahmed') {
        await transactionService.createTransaction({
          amount: data.amount,
          type: 'expense',
          category: 'Vehicle Expense',
          description: `Vehicle Expense - ${vehicle.year} ${vehicle.make} ${vehicle.model} (VIN: ${vehicle.vin || 'N/A'})`,
          date: data.date,
          reference_id: data.id
        });
      }

      // Create audit log
      await auditService.createAuditLog({
        user_id: (await supabase.auth.getUser()).data.user?.id,
        action_type: 'CREATE',
        entity_type: 'VEHICLE_EXPENSE',
        entity_id: data.id,
        new_data: data,
        description: `Added expense of AED ${data.amount} for vehicle ${data.vehicle_id}`
      });

      return data;
    } catch (error) {
      console.error('Error adding expense:', error);
      throw error;
    }
  },

  async updateExpense(id: string, expense: Partial<Omit<VehicleExpense, 'id' | 'vehicle_id' | 'created_at'>>): Promise<VehicleExpense> {
    try {
      // Get old data for audit and transaction handling
      const { data: oldExpense } = await supabase
        .from('vehicle_expenses')
        .select('*, vehicles!vehicle_expenses_vehicle_id_fkey(make, model, vin, year)')
        .eq('id', id)
        .single();

      if (!oldExpense) throw new Error('Expense not found');

      // Update the expense
      const { data, error } = await supabase
        .from('vehicle_expenses')
        .update(expense)
        .eq('id', id)
        .select('*, vehicles!vehicle_expenses_vehicle_id_fkey(make, model, vin, year)')
        .single();

      if (error) throw error;
      if (!data) throw new Error('Failed to update expense');

      // Handle transaction updates
      if (oldExpense.recipient === 'Ahmed' || expense.recipient === 'Ahmed') {
        if (expense.recipient === 'Ahmed') {
          // Update or create transaction
          const vehicle = data.vehicles;
          const transactionData = {
            amount: expense.amount || oldExpense.amount,
            type: 'expense',
            category: 'Vehicle Expense',
            description: `Vehicle Expense - ${vehicle.year} ${vehicle.make} ${vehicle.model} (VIN: ${vehicle.vin || 'N/A'})`,
            date: expense.date || oldExpense.date
          };

          try {
            // Try to update existing transaction
            await transactionService.updateTransactionByReference(id, transactionData);
          } catch (err) {
            // If update fails (no transaction exists), create new one
            await transactionService.createTransaction({
              ...transactionData,
              reference_id: id
            });
          }
        } else if (oldExpense.recipient === 'Ahmed') {
          // Delete transaction if recipient is no longer Ahmed
          await transactionService.deleteTransactionByReference(id);
        }
      }

      // Create audit log
      await auditService.createAuditLog({
        user_id: (await supabase.auth.getUser()).data.user?.id,
        action_type: 'UPDATE',
        entity_type: 'VEHICLE_EXPENSE',
        entity_id: id,
        old_data: oldExpense,
        new_data: data,
        description: `Updated expense of AED ${data.amount} for vehicle ${data.vehicle_id}`
      });

      return data;
    } catch (error) {
      console.error('Error updating expense:', error);
      throw error;
    }
  },

  async deleteExpense(id: string): Promise<void> {
    try {
      // Get expense data for audit log
      const { data: expense, error: fetchError } = await supabase
        .from('vehicle_expenses')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      // Delete corresponding transaction first if it exists
      if (expense && expense.recipient === 'Ahmed') {
        await transactionService.deleteTransactionByReference(id);
      }

      // Delete the expense
      const { error } = await supabase
        .from('vehicle_expenses')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Create audit log
      if (expense) {
        await auditService.createAuditLog({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          action_type: 'DELETE',
          entity_type: 'VEHICLE_EXPENSE',
          entity_id: id,
          old_data: expense,
          description: `Deleted expense of AED ${expense.amount} for vehicle ${expense.vehicle_id}`
        });
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
      throw error;
    }
  },

  async addProfitDistribution(distribution: Omit<ProfitDistribution, 'id' | 'created_at'>): Promise<ProfitDistribution> {
    try {
      const { data, error } = await supabase
        .from('profit_distributions')
        .insert(distribution)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Failed to add profit distribution');

      // Create audit log
      await auditService.createAuditLog({
        user_id: (await supabase.auth.getUser()).data.user?.id,
        action_type: 'AUTO_DISTRIBUTE',
        entity_type: 'PROFIT_DISTRIBUTION',
        entity_id: data.vehicle_id,
        new_data: data,
        description: `Auto-distributed profit for vehicle ID: ${data.vehicle_id}`
      });

      return data;
    } catch (error) {
      console.error('Error adding profit distribution:', error);
      throw error;
    }
  },

  async deleteVehicle(id: string): Promise<void> {
    try {
      // Get vehicle data for audit log
      const { data: vehicle } = await supabase
        .from('vehicles')
        .select('*')
        .eq('id', id)
        .single();

      const { error } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Create audit log
      if (vehicle) {
        await auditService.createAuditLog({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          action_type: 'DELETE',
          entity_type: 'VEHICLE',
          entity_id: id,
          old_data: vehicle,
          description: `Deleted vehicle: ${vehicle.year} ${vehicle.make} ${vehicle.model}`
        });
      }
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      throw error;
    }
  },

  async deleteProfitDistribution(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('profit_distributions')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting profit distribution:', error);
      throw error;
    }
  }
};
