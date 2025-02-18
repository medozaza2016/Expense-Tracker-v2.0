import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { settingsService, type GlobalSettings } from '../../services/settingsService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [settings, setSettings] = useState<Partial<GlobalSettings>>({
    company_name: '',
    company_address: '',
    company_phone: '',
    company_email: '',
    currency: 'AED',
    tax_rate: 0,
    date_format: 'YYYY-MM-DD'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadSettings();
    }
  }, [isOpen]);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await settingsService.getSettings();
      if (data) {
        setSettings(data);
      }
    } catch (err) {
      setError('Failed to load settings');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setError(null);
      setIsSaving(true);
      await settingsService.updateSettings(settings);
      onClose();
    } catch (err) {
      setError('Failed to save settings');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm z-50">
      <div className="bg-card p-6 rounded-lg border border-gray-800 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-text-primary">Global Settings</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-background/50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  value={settings.company_name || ''}
                  onChange={(e) => setSettings({ ...settings, company_name: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-gray-700 rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50"
                  disabled={isSaving}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Company Email
                </label>
                <input
                  type="email"
                  value={settings.company_email || ''}
                  onChange={(e) => setSettings({ ...settings, company_email: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-gray-700 rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50"
                  disabled={isSaving}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Company Phone
                </label>
                <input
                  type="tel"
                  value={settings.company_phone || ''}
                  onChange={(e) => setSettings({ ...settings, company_phone: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-gray-700 rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50"
                  disabled={isSaving}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Currency
                </label>
                <select
                  value={settings.currency || 'AED'}
                  onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-gray-700 rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50"
                  disabled={isSaving}
                >
                  <option value="AED">AED</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Company Address
                </label>
                <textarea
                  value={settings.company_address || ''}
                  onChange={(e) => setSettings({ ...settings, company_address: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 bg-background border border-gray-700 rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50"
                  disabled={isSaving}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Tax Rate (%)
                </label>
                <input
                  type="number"
                  value={settings.tax_rate || 0}
                  onChange={(e) => setSettings({ ...settings, tax_rate: parseFloat(e.target.value) })}
                  min="0"
                  max="100"
                  step="0.01"
                  className="w-full px-3 py-2 bg-background border border-gray-700 rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50"
                  disabled={isSaving}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Date Format
                </label>
                <select
                  value={settings.date_format || 'YYYY-MM-DD'}
                  onChange={(e) => setSettings({ ...settings, date_format: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-gray-700 rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50"
                  disabled={isSaving}
                >
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
              <button
                onClick={onClose}
                className="px-4 py-2 text-text-primary hover:bg-background rounded-md transition-colors"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-accent text-white rounded-md hover:bg-accent/90 transition-colors disabled:opacity-50"
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
