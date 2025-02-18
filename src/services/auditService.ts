import { supabase } from './supabase';

export interface AuditLog {
  id: string;
  created_at: string;
  user_id: string;
  user_email?: string;
  action_type: string;
  entity_type: string;
  entity_id: string;
  old_data?: any;
  new_data?: any;
  description: string;
  metadata?: any;
  ip_address?: string;
  user_agent?: string;
  formatted_details?: string;
}

export const auditService = {
  async createAuditLog(data: Omit<AuditLog, 'id' | 'created_at' | 'user_email' | 'formatted_details'>): Promise<void> {
    try {
      // Get client info
      const userAgent = window.navigator.userAgent;
      
      const { error } = await supabase
        .from('audit_logs')
        .insert({
          ...data,
          user_agent: userAgent
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error creating audit log:', error);
      // Don't throw error from audit log creation - we don't want it to affect the main operation
    }
  },

  async getLogs(): Promise<AuditLog[]> {
    try {
      const { data, error } = await supabase
        .from('formatted_audit_logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      return [];
    }
  },

  async getLogStats() {
    try {
      const { data, error } = await supabase
        .from('audit_log_stats')
        .select('*')
        .order('day', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching audit log stats:', error);
      return [];
    }
  }
};
