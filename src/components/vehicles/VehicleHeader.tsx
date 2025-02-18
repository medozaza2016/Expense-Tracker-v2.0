import { VehicleReport } from './VehicleReport';
import { ChevronLeft, Edit2 } from 'lucide-react';
import type { Vehicle, VehicleExpense, ProfitDistribution } from '../../services/vehicleService';

interface VehicleHeaderProps {
  vehicle: Vehicle;
  expenses: VehicleExpense[];
  distributions: ProfitDistribution[];
  totalExpenses: number;
  netProfit: number;
  onBack: () => void;
  onEdit: () => void;
}

export function VehicleHeader({ 
  vehicle, 
  expenses, 
  distributions, 
  totalExpenses, 
  netProfit,
  onBack,
  onEdit
}: VehicleHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 text-text-secondary rounded-lg hover:bg-gray-800 hover:text-text-primary transition-colors"
          title="Back to vehicles"
        >
          <ChevronLeft className="w-5 h-5" />
          Back
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-text-primary">
            {vehicle.make} {vehicle.model} ({vehicle.year})
          </h1>
          <p className="text-sm text-text-secondary">VIN: {vehicle.vin}</p>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
        <button
          onClick={onEdit}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-accent/10 text-accent rounded-lg hover:bg-accent/20 transition-colors"
          title="Edit Vehicle"
        >
          <Edit2 className="w-5 h-5" />
          <span>Edit Vehicle</span>
        </button>
        <VehicleReport
          vehicle={vehicle}
          expenses={expenses}
          distributions={distributions}
          totalExpenses={totalExpenses}
          netProfit={netProfit}
        />
      </div>
    </div>
  );
}
