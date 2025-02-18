import { format } from 'date-fns';
import type { Vehicle } from '../../services/vehicleService';

interface VehicleSaleDetailsProps {
  vehicle: Vehicle;
}

export function VehicleSaleDetails({ vehicle }: VehicleSaleDetailsProps) {
  return (
    <div className="bg-card p-6 rounded-lg border border-gray-800">
      <h3 className="text-lg font-medium text-text-primary mb-4">Sale Details</h3>
      <div className="space-y-2">
        {vehicle.status === 'SOLD' ? (
          <>
            <p className="text-text-secondary">
              Sale Date: {vehicle.sale_date ? format(new Date(vehicle.sale_date), 'MMM d, yyyy') : 'N/A'}
            </p>
            <p className="text-text-secondary">
              Sale Price: AED {vehicle.sale_price?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || 'N/A'}
            </p>
          </>
        ) : (
          <p className="text-text-secondary">Vehicle not sold yet</p>
        )}
      </div>
    </div>
  );
}
