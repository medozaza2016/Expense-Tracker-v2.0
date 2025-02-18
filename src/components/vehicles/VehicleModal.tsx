import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { vehicleService, type Vehicle } from '../../services/vehicleService';

interface VehicleModalProps {
  vehicle?: Vehicle;
  onClose: () => void;
  onSave: (vehicle: Omit<Vehicle, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
}

export function VehicleModal({ vehicle, onClose, onSave }: VehicleModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Vehicle>>({
    vin: vehicle?.vin || '',
    make: vehicle?.make || '',
    model: vehicle?.model || '',
    year: vehicle?.year || new Date().getFullYear(),
    color: vehicle?.color || '',
    status: vehicle?.status || 'AVAILABLE',
    purchase_price: vehicle?.purchase_price || 0,
    sale_price: vehicle?.sale_price || 0,
    purchase_date: vehicle?.purchase_date || new Date().toISOString().split('T')[0],
    sale_date: vehicle?.sale_date || new Date().toISOString().split('T')[0],
    notes: vehicle?.notes || '',
    owner_name: vehicle?.owner_name || '',
    tc_number: vehicle?.tc_number || '',
    certificate_number: vehicle?.certificate_number || '',
    registration_location: vehicle?.registration_location || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setError(null);
      setIsSubmitting(true);

      // Validate required fields
      if (!formData.vin?.trim()) throw new Error('VIN is required');
      if (!formData.make?.trim()) throw new Error('Make is required');
      if (!formData.model?.trim()) throw new Error('Model is required');
      if (!formData.year) throw new Error('Year is required');
      if (!formData.purchase_price || formData.purchase_price <= 0) {
        throw new Error('Valid purchase price is required');
      }
      if (formData.status === 'SOLD') {
        if (!formData.sale_price || formData.sale_price <= 0) {
          throw new Error('Valid sale price is required for sold vehicles');
        }
        if (!formData.sale_date) {
          throw new Error('Sale date is required for sold vehicles');
        }
      }

      // Prepare vehicle data with all fields
      const vehicleData = {
        vin: formData.vin.trim(),
        make: formData.make.trim(),
        model: formData.model.trim(),
        year: formData.year,
        color: formData.color?.trim() || '',
        status: formData.status as Vehicle['status'],
        purchase_price: Number(formData.purchase_price),
        sale_price: formData.status === 'SOLD' ? Number(formData.sale_price) : null,
        purchase_date: formData.purchase_date || new Date().toISOString().split('T')[0],
        sale_date: formData.status === 'SOLD' ? formData.sale_date : null,
        notes: formData.notes?.trim() || '',
        owner_name: formData.owner_name?.trim() || null,
        tc_number: formData.tc_number?.trim() || null,
        certificate_number: formData.certificate_number?.trim() || null,
        registration_location: formData.registration_location?.trim() || null
      } as Omit<Vehicle, 'id' | 'created_at' | 'updated_at'>;

      // Save the vehicle
      await onSave(vehicleData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      console.error('Error saving vehicle:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm z-50">
      <div className="bg-card p-6 rounded-lg border border-gray-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-text-primary">
            {vehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
          </h2>
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

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                VIN
              </label>
              <input
                type="text"
                value={formData.vin || ''}
                onChange={(e) => setFormData({ ...formData, vin: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-gray-700 rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50"
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Make
              </label>
              <input
                type="text"
                value={formData.make || ''}
                onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-gray-700 rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50"
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Model
              </label>
              <input
                type="text"
                value={formData.model || ''}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-gray-700 rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50"
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Year
              </label>
              <input
                type="number"
                value={formData.year || ''}
                onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                className="w-full px-3 py-2 bg-background border border-gray-700 rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50"
                min="1900"
                max={new Date().getFullYear() + 1}
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Color
              </label>
              <input
                type="text"
                value={formData.color || ''}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-gray-700 rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Status
              </label>
              <select
                value={formData.status || 'AVAILABLE'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as Vehicle['status'] })}
                className="w-full px-3 py-2 bg-background border border-gray-700 rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50"
                required
                disabled={isSubmitting}
              >
                <option value="AVAILABLE">Available</option>
                <option value="SOLD">Sold</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Purchase Price
              </label>
              <input
                type="number"
                value={formData.purchase_price || ''}
                onChange={(e) => setFormData({ ...formData, purchase_price: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 bg-background border border-gray-700 rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50"
                min="0"
                step="0.01"
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Purchase Date
              </label>
              <input
                type="date"
                value={formData.purchase_date || ''}
                onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-gray-700 rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50"
                required
                disabled={isSubmitting}
              />
            </div>

            {formData.status === 'SOLD' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Sale Price
                  </label>
                  <input
                    type="number"
                    value={formData.sale_price || ''}
                    onChange={(e) => setFormData({ ...formData, sale_price: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 bg-background border border-gray-700 rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50"
                    min="0"
                    step="0.01"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Sale Date
                  </label>
                  <input
                    type="date"
                    value={formData.sale_date || ''}
                    onChange={(e) => setFormData({ ...formData, sale_date: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-gray-700 rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50"
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Owner Name
              </label>
              <input
                type="text"
                value={formData.owner_name || ''}
                onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-gray-700 rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                TC#
              </label>
              <input
                type="text"
                value={formData.tc_number || ''}
                onChange={(e) => setFormData({ ...formData, tc_number: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-gray-700 rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Certificate Number
              </label>
              <input
                type="text"
                value={formData.certificate_number || ''}
                onChange={(e) => setFormData({ ...formData, certificate_number: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-gray-700 rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Registration Location
              </label>
              <input
                type="text"
                value={formData.registration_location || ''}
                onChange={(e) => setFormData({ ...formData, registration_location: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-gray-700 rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50"
                disabled={isSubmitting}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-text-primary mb-1">
                Notes
              </label>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 bg-background border border-gray-700 rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50"
                disabled={isSubmitting}
                placeholder="Enter any additional notes or comments about the vehicle..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-text-primary hover:bg-background rounded-md transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-accent text-white rounded-md hover:bg-accent/90 transition-colors disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : vehicle ? 'Save Changes' : 'Add Vehicle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
