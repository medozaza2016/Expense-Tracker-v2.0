import { supabase } from './supabase';
import { auditService } from './auditService';

interface FinancialSettings {
  id: string;
  user_id: string;
  cash_on_hand: number;
  showroom_balance: number;
  personal_loan: number;
  additional: number;
  expenses: number;
  updated_at: string;
}

// Use a fixed ID for the single financial settings record
const SETTINGS_ID = 'ef87c799-ef55-4608-bf91-a902229ee6b6';

export const financialService = {
  async getSettings(): Promise<FinancialSettings | null> {
    try {
      // First try to get existing settings
      const { data: settings, error: fetchError } = await supabase
        .from('financial_settings')
        .select('*')
        .eq('id', SETTINGS_ID)
        .maybeSingle();

      // If settings exist, return them
      if (settings) {
        return settings;
      }

      // If error is not "no rows returned", throw it
      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      // If no settings exist, create initial settings
      const initialSettings = {
        id: SETTINGS_ID,
        user_id: SETTINGS_ID, // Same as ID for consistency
        cash_on_hand: 18400,
        showroom_balance: 20135,
        personal_loan: 22500,
        additional: -4100,
        expenses: 0
      };

      const { data: newSettings, error: insertError } = await supabase
        .from('financial_settings')
        .insert(initialSettings)
        .select()
        .single();

      if (insertError) {
        // If insert failed due to race condition, try fetching one last time
        if (insertError.code === '23505') {
          const { data: existingSettings, error: finalFetchError } = await supabase
            .from('financial_settings')
            .select('*')
            .eq('id', SETTINGS_ID)
            .single();

          if (finalFetchError) {
            console.error('Failed to fetch settings after race condition:', finalFetchError);
            return null;
          }

          return existingSettings;
        }
        console.error('Failed to create initial settings:', insertError);
        return null;
      }

      return newSettings;
    } catch (error) {
      console.error('Error fetching financial settings:', error);
      // Return default settings instead of throwing
      return {
        id: SETTINGS_ID,
        user_id: SETTINGS_ID,
        cash_on_hand: 18400,
        showroom_balance: 20135,
        personal_loan: 22500,
        additional: -4100,
        expenses: 0,
        updated_at: new Date().toISOString()
      };
    }
  },

  async updateSettings(settings: Partial<Omit<FinancialSettings, 'id' | 'user_id' | 'updated_at'>>): Promise<FinancialSettings> {
    try {
      // Get old settings for audit log
      const { data: oldSettings, error: fetchError } = await supabase
        .from('financial_settings')
        .select('*')
        .eq('id', SETTINGS_ID)
        .single();

      if (fetchError) throw fetchError;

      // Update settings
      const { data, error } = await supabase
        .from('financial_settings')
        .update({
          ...settings,
          updated_at: new Date().toISOString()
        })
        .eq('id', SETTINGS_ID)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Failed to update settings');

      // Create audit log
      const user = await supabase.auth.getUser();
      await auditService.createAuditLog({
        user_id: user.data.user?.id,
        action_type: 'UPDATE',
        entity_type: 'SETTINGS',
        entity_id: SETTINGS_ID,
        old_data: oldSettings,
        new_data: data,
        description: 'Updated financial settings',
        metadata: {
          changes: Object.keys(settings).filter(key => 
            settings[key] !== oldSettings?.[key]
          )
        }
      });

      return data;
    } catch (error) {
      console.error('Error updating financial settings:', error);
      throw error instanceof Error ? error : new Error('An unexpected error occurred');
    }
  }
};
