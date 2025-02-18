import type { Vehicle } from '../../services/vehicleService';

interface VehicleNotesProps {
  vehicle: Vehicle;
}

export function VehicleNotes({ vehicle }: VehicleNotesProps) {
  if (!vehicle.notes) return null;

  return (
    <div className="bg-card p-6 rounded-lg border border-gray-800">
      <h3 className="text-lg font-medium text-text-primary mb-4">Notes</h3>
      <p className="text-text-secondary whitespace-pre-wrap">{vehicle.notes}</p>
    </div>
  );
}
