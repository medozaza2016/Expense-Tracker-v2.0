import { format } from 'date-fns';
import type { Vehicle } from '../../services/vehicleService';

interface VehiclePurchaseDetailsProps {
  vehicle: Vehicle;
}

export function VehiclePurchaseDetails({ vehicle }: VehiclePurchaseDetailsProps) {
  return (
    <div className="bg-card p-6 rounded-lg border border-gray-800">
      <h3 className="text-lg font-medium text-text-primary mb-4">Purchase Details</h3>
      <div className="space-y-2">
        <p className="text-text-secondary">
          Purchase Date: {format(new Date(vehicle.purchase_date), 'MMM d, yyyy')}
        </p>
        <p className="text-text-secondary">
          Purchase Price: AED {vehicle.purchase_price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </p>
      </div>
    </div>
  );
}
