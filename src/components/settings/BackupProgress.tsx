import { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Loader } from 'lucide-react';

interface BackupProgressProps {
  isOpen: boolean;
  operation: 'backup' | 'restore';
  status: 'in_progress' | 'completed' | 'failed';
  error?: string;
  onClose: () => void;
}

export function BackupProgress({ isOpen, operation, status, error, onClose }: BackupProgressProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (status === 'in_progress') {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 10;
        });
      }, 500);

      return () => clearInterval(interval);
    } else if (status === 'completed') {
      setProgress(100);
    }
  }, [status]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm z-50">
      <div className="bg-card p-6 rounded-lg border border-gray-800 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium text-text-primary">
            {operation === 'backup' ? 'Creating Backup' : 'Restoring Backup'}
          </h3>
          {status !== 'in_progress' && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-background/50 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-text-secondary" />
            </button>
          )}
        </div>

        <div className="space-y-4">
          {status === 'in_progress' && (
            <>
              <div className="flex items-center gap-3">
                <Loader className="w-5 h-5 text-accent animate-spin" />
                <p className="text-text-primary">
                  {operation === 'backup' ? 'Creating backup...' : 'Restoring data...'}
                </p>
              </div>
              <div className="h-2 bg-background rounded-full overflow-hidden">
                <div 
                  className="h-full bg-accent transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-text-secondary">
                Please wait while the operation completes...
              </p>
            </>
          )}

          {status === 'completed' && (
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <p className="text-text-primary">
                {operation === 'backup' ? 'Backup created successfully!' : 'Data restored successfully!'}
              </p>
            </div>
          )}

          {status === 'failed' && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <p className="text-red-400">
                  {operation === 'backup' ? 'Failed to create backup' : 'Failed to restore data'}
                </p>
              </div>
              {error && (
                <p className="text-sm text-red-400/80 bg-red-400/10 p-3 rounded-lg">
                  {error}
                </p>
              )}
            </div>
          )}
        </div>

        {status !== 'in_progress' && (
          <div className="flex justify-end mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
