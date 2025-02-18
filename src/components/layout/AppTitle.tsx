import { useEffect, useState } from 'react';
import { BarChart } from 'lucide-react';
import { settingsService } from '../../services/settingsService';

export function AppTitle() {
  const [companyName, setCompanyName] = useState('Finance App');

  useEffect(() => {
    loadCompanyName();
  }, []);

  const loadCompanyName = async () => {
    try {
      const settings = await settingsService.getSettings();
      if (settings?.company_name) {
        setCompanyName(settings.company_name);
      }
    } catch (error) {
      console.error('Error loading company name:', error);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <BarChart className="w-8 h-8 text-accent" />
      <h1 className="text-2xl font-extrabold tracking-tight text-text-primary">
        {companyName}
      </h1>
    </div>
  );
}
