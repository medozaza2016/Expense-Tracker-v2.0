import { useState } from 'react';
import { Download, Upload, AlertCircle } from 'lucide-react';
import { backupService } from '../../services/backupService';
import { BackupProgress } from './BackupProgress';

export function BackupRestoreSection() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showProgress, setShowProgress] = useState(false);
  const [progressStatus, setProgressStatus] = useState<'in_progress' | 'completed' | 'failed'>('in_progress');
  const [progressOperation, setProgressOperation] = useState<'backup' | 'restore'>('backup');
  const [progressError, setProgressError] = useState<string>();

  const handleCreateBackup = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);
      setProgressOperation('backup');
      setProgressStatus('in_progress');
      setShowProgress(true);

      const backupJSON = await backupService.createBackup();
      backupService.downloadBackup(backupJSON); // Attempt download

      setProgressStatus('completed');
      setSuccess('Backup created and downloaded successfully');
    } catch (err) {
      setProgressStatus('failed');
      setProgressError(err instanceof Error ? err.message : 'Failed to create backup');
      setError('Failed to create backup');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestoreBackup = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);
      setProgressOperation('restore');
      setProgressStatus('in_progress');
      setShowProgress(true);

      const backup = await backupService.uploadBackup(file);

      // Ask for confirmation
      if (!window.confirm(
        'Are you sure you want to restore this backup? This will replace all current data and cannot be undone.'
      )) {
        setShowProgress(false);
        return;
      }

      await backupService.restoreBackup(backup);
      setProgressStatus('completed');
      setSuccess('Backup restored successfully');

      // Reload the page to reflect changes
      window.location.reload();
    } catch (err) {
      setProgressStatus('failed');
      setProgressError(err instanceof Error ? err.message : 'Failed to restore backup');
      setError('Failed to restore backup');
      console.error(err);
    } finally {
      setIsLoading(false);
      // Clear the file input
      event.target.value = '';
    }
  };

  return (
    <div className="bg-card rounded-lg border border-gray-800 p-6">
      <h2 className="text-lg font-medium text-text-primary mb-4">Backup & Restore</h2>

      {error && (
        <div className="mb-4 flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded">
          <AlertCircle className="w-5 h-5" />
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded">
          <AlertCircle className="w-5 h-5" />
          <p>{success}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-text-primary">Create Backup</h3>
          <p className="text-sm text-text-secondary">
            Create a backup file of all your data that you can download and store safely.
          </p>
          <button
            onClick={handleCreateBackup}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50"
          >
            <Download className="w-5 h-5" />
            {isLoading ? 'Creating Backup...' : 'Create Backup'}
          </button>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-medium text-text-primary">Restore Backup</h3>
          <p className="text-sm text-text-secondary">
            Restore your data from a previously created backup file.
          </p>
          <label className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50 cursor-pointer">
            <Upload className="w-5 h-5" />
            <span>{isLoading ? 'Restoring...' : 'Restore Backup'}</span>
            <input
              type="file"
              accept=".json"
              onChange={handleRestoreBackup}
              disabled={isLoading}
              className="hidden"
            />
          </label>
        </div>
      </div>

      <BackupProgress
        isOpen={showProgress}
        operation={progressOperation}
        status={progressStatus}
        error={progressError}
        onClose={() => {
          setShowProgress(false);
          setProgressError(undefined);
        }}
      />
    </div>
  );
}
