import { useEffect, useState } from 'react';
import { Car } from 'lucide-react';
import { settingsService } from '../../services/settingsService';

export function CompanyLogo() {
  const [companyName, setCompanyName] = useState('Finance App');
  const [companyInitial, setCompanyInitial] = useState('F');

  useEffect(() => {
    loadCompanyName();
  }, []);

  const loadCompanyName = async () => {
    try {
      const settings = await settingsService.getSettings();
      if (settings?.company_name) {
        setCompanyName(settings.company_name);
        setCompanyInitial(settings.company_name.charAt(0));
      }
    } catch (error) {
      console.error('Error loading company name:', error);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <div className="relative flex items-center justify-center">
        <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
          <Car className="w-6 h-6 text-accent" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-accent flex items-center justify-center text-white text-xs font-bold">
          {companyInitial}
        </div>
      </div>
      <h1 className="text-2xl font-extrabold tracking-tight text-text-primary">
        {companyName}
      </h1>
    </div>
  );
}
