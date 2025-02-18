import React, { useState, useEffect } from 'react';
import { settingsService, type GlobalSettings } from '../../services/settingsService';
import { BackupRestoreSection } from './BackupRestoreSection';

export function SettingsPage() {
  const [settings, setSettings] = useState<Partial<GlobalSettings>>({
    company_name: '',
    company_address: '',
    company_phone: '',
    company_email: '',
    currency: 'AED',
    exchange_rate: 3.6725,
    date_format: 'YYYY-MM-DD',
    auto_logout_minutes: 30
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

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
      setSaveSuccess(false);
      await settingsService.updateSettings(settings);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setError('Failed to save settings');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-text-primary">Global Settings</h1>
        <div className="flex items-center gap-3">
          {saveSuccess && (
            <span className="text-green-400">Settings saved successfully!</span>
          )}
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-accent text-white rounded-md hover:bg-accent/90 transition-colors disabled:opacity-50"
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="bg-card rounded-lg border border-gray-800 p-6">
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
            <input
              type="text"
              value="AED"
              className="w-full px-3 py-2 bg-background border border-gray-700 rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50"
              disabled
            />
            <p className="mt-1 text-sm text-text-secondary">Default currency is set to AED</p>
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
              USD to AED Exchange Rate
            </label>
            <input
              type="number"
              value={settings.exchange_rate || 3.6725}
              onChange={(e) => setSettings({ ...settings, exchange_rate: parseFloat(e.target.value) })}
              min="0"
              step="0.0001"
              className="w-full px-3 py-2 bg-background border border-gray-700 rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50"
              disabled={isSaving}
            />
            <p className="mt-1 text-sm text-text-secondary">Default: 1 USD = 3.6725 AED</p>
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

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Auto Logout Timer (minutes)
            </label>
            <input
              type="number"
              value={settings.auto_logout_minutes || 30}
              onChange={(e) => setSettings({ ...settings, auto_logout_minutes: parseInt(e.target.value) })}
              min="1"
              max="480"
              className="w-full px-3 py-2 bg-background border border-gray-700 rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50"
              disabled={isSaving}
            />
            <p className="mt-1 text-sm text-text-secondary">Set between 1 and 480 minutes (8 hours)</p>
          </div>
        </div>
      </div>

      <BackupRestoreSection />
    </div>
  );
}
