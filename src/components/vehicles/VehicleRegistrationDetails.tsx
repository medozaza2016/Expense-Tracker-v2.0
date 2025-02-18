import type { Vehicle } from '../../services/vehicleService';

interface VehicleRegistrationDetailsProps {
  vehicle: Vehicle;
}

export function VehicleRegistrationDetails({ vehicle }: VehicleRegistrationDetailsProps) {
  return (
    <div className="bg-card p-6 rounded-lg border border-gray-800">
      <h3 className="text-lg font-medium text-text-primary mb-4">Registration Details</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <p className="text-sm font-medium text-text-secondary">Owner Name</p>
          <p className="text-text-primary">{vehicle.owner_name || '-'}</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium text-text-secondary">TC#</p>
          <p className="text-text-primary">{vehicle.tc_number || '-'}</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium text-text-secondary">Certificate Number</p>
          <p className="text-text-primary">{vehicle.certificate_number || '-'}</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium text-text-secondary">Registration Location</p>
          <p className="text-text-primary">{vehicle.registration_location || '-'}</p>
        </div>
      </div>
    </div>
  );
}
