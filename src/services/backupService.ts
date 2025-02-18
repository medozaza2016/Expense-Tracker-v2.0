import { supabase } from './supabase';
import { auditService } from './auditService';

export interface BackupLog {
  id: string;
  created_at: string;
  created_by: string;
  file_name: string;
  file_size: number;
  backup_type: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  error_message?: string;
  completed_at?: string;
}

export interface BackupData {
  backup_id: string;
  created_at: string;
  type: string;
  tables: {
    vehicles: any[];
    vehicle_expenses: any[];
    profit_distributions: any[];
    transactions: any[];
    categories: any[];
    financial_settings: any[];
    global_settings: any[];
  };
}

export const backupService = {
  async createBackup(): Promise<string> {
    try {
      const { data, error } = await supabase
        .rpc('create_backup', { p_type: 'manual' });

      if (error) throw error;
      if (!data) throw new Error('No backup data received');

      // Audit log for successful backup creation
      await auditService.createAuditLog({
        user_id: (await supabase.auth.getUser()).data.user?.id,
        action_type: 'BACKUP',
        entity_type: 'SYSTEM',
        entity_id: data.backup_id,
        description: 'Backup created successfully',
        metadata: { file_name: `backup_manual_${new Date().toISOString().split('T')[0]}.json` }
      });

      return JSON.stringify(data, null, 2);
    } catch (error: any) {
      console.error('Error creating backup:', error);
      // Audit log for failed backup
      await auditService.createAuditLog({
        user_id: (await supabase.auth.getUser()).data.user?.id,
        action_type: 'BACKUP',
        entity_type: 'SYSTEM',
        entity_id: null, // We might not have a backup ID on failure
        description: 'Backup creation failed',
        metadata: { error: error.message || 'Unknown error' }
      });
      throw error;
    }
  },

  async restoreBackup(backup: BackupData): Promise<void> {
    try {
      const { error } = await supabase
        .rpc('restore_backup', { p_backup_data: backup });

      if (error) throw error;

      // Audit log for successful restore
      await auditService.createAuditLog({
        user_id: (await supabase.auth.getUser()).data.user?.id,
        action_type: 'RESTORE',
        entity_type: 'SYSTEM',
        entity_id: backup.backup_id,
        description: 'Data restored from backup',
        metadata: { backup_type: backup.type }
      });

    } catch (error: any) {
      console.error('Error restoring backup:', error);
      // Audit log for failed restore
      await auditService.createAuditLog({
        user_id: (await supabase.auth.getUser()).data.user?.id,
        action_type: 'RESTORE',
        entity_type: 'SYSTEM',
        entity_id: backup.backup_id,
        description: 'Data restore failed',
        metadata: { error: error.message || 'Unknown error' }
      });
      throw error;
    }
  },

  downloadBackup(backupData: string): void {
    try {
      const blob = new Blob([backupData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = url;
      link.download = `backup_${new Date().toISOString().split('T')[0]}.json`;

      // Fallback for IE/Edge
      if (window.navigator.msSaveBlob) {
        window.navigator.msSaveBlob(blob, link.download);
        return;
      }

      // Standard download approach for modern browsers
      link.style.visibility = 'hidden'; // Make the link invisible
      document.body.appendChild(link);

      // More robust click handling
      const clickEvent = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true
      });
      link.dispatchEvent(clickEvent);

      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error during download:', error);
      throw new Error('Failed to download backup file. Please try again.');
    }
  },

  async uploadBackup(file: File): Promise<BackupData> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const backup = JSON.parse(e.target?.result as string);
          if (!this.isValidBackup(backup)) {
            throw new Error('Invalid backup file format');
          }
          resolve(backup);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read backup file'));
      reader.readAsText(file);
    });
  },

  isValidBackup(backup: any): backup is BackupData {
    return (
      backup &&
      typeof backup.backup_id === 'string' &&
      typeof backup.created_at === 'string' &&
      typeof backup.type === 'string' &&
      backup.tables &&
      Array.isArray(backup.tables.vehicles) &&
      Array.isArray(backup.tables.vehicle_expenses) &&
      Array.isArray(backup.tables.profit_distributions) &&
      Array.isArray(backup.tables.transactions) &&
      Array.isArray(backup.tables.categories) &&
      Array.isArray(backup.tables.financial_settings) &&
      Array.isArray(backup.tables.global_settings)
    );
  }
};
