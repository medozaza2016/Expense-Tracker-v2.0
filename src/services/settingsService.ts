import { supabase } from './supabase';
import { auditService } from './auditService';

export interface GlobalSettings {
  id: string;
  company_name: string;
  company_address: string;
  company_phone: string;
  company_email: string;
  currency: string;
  exchange_rate: number;
  date_format: string;
  auto_logout_minutes: number;
  created_at: string;
  updated_at: string;
}

// Default settings to use if database fetch fails
const DEFAULT_SETTINGS: GlobalSettings = {
  id: 'global-settings',
  company_name: 'Challenger Used Cars',
  company_address: 'Showroom No 801/290, Opposite Tamouh Souq Al Haraj - Al Ruqa Al Hamra, Sharjah, United Arab Emirates',
  company_phone: '+971 50 123 4567',
  company_email: 'info@challengerucars.com',
  currency: 'AED',
  exchange_rate: 3.6725,
  date_format: 'YYYY-MM-DD',
  auto_logout_minutes: 30,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

export const settingsService = {
  async getSettings(): Promise<GlobalSettings> {
    try {
      const { data, error } = await supabase
        .from('global_settings')
        .select('*')
        .eq('id', 'global-settings')
        .maybeSingle();

      if (error) {
        console.error('Error fetching settings:', error);
        return DEFAULT_SETTINGS;
      }

      // If no data found, return defaults
      if (!data) {
        return DEFAULT_SETTINGS;
      }

      // Merge with defaults to ensure all fields exist
      return {
        ...DEFAULT_SETTINGS,
        ...data,
        currency: 'AED', // Always ensure AED currency
      };
    } catch (error) {
      console.error('Error in getSettings:', error);
      return DEFAULT_SETTINGS;
    }
  },

  async updateSettings(settings: Partial<Omit<GlobalSettings, 'id' | 'created_at' | 'updated_at'>>): Promise<GlobalSettings> {
    try {
      // Get old data for audit
      const { data: oldSettings } = await supabase
        .from('global_settings')
        .select('*')
        .eq('id', 'global-settings')
        .single();

      const updatedSettings = {
        ...settings,
        currency: 'AED', // Always ensure AED currency
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('global_settings')
        .update(updatedSettings)
        .eq('id', 'global-settings')
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('No data returned after update');

      // Create audit log
      await auditService.createAuditLog({
        user_id: (await supabase.auth.getUser()).data.user?.id,
        action_type: 'UPDATE',
        entity_type: 'GLOBAL_SETTINGS',
        entity_id: 'global-settings',
        old_data: oldSettings,
        new_data: data,
        description: 'Updated global settings'
      });

      return {
        ...DEFAULT_SETTINGS,
        ...data,
        currency: 'AED',
      };
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error instanceof Error ? error : new Error('Failed to update settings');
    }
  }
};
