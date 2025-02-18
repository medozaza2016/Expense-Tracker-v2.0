import { FileText } from 'lucide-react';
import { generateVehicleReport } from '../../utils/pdfUtils';
import type { Vehicle, VehicleExpense, ProfitDistribution } from '../../services/vehicleService';

interface VehicleReportProps {
  vehicle: Vehicle;
  expenses: VehicleExpense[];
  distributions: ProfitDistribution[];
  totalExpenses: number;
  netProfit: number;
}

export function VehicleReport({ vehicle, expenses, distributions, totalExpenses, netProfit }: VehicleReportProps) {
  const handleExport = async () => {
    try {
      // Validate required data
      if (!vehicle) {
        throw new Error('Vehicle data is required');
      }

      // Generate the report
      const doc = await generateVehicleReport({
        vehicle,
        expenses: expenses || [],
        distributions: distributions || [],
        totalExpenses,
        netProfit
      });

      // Generate filename
      const filename = `${vehicle.make}_${vehicle.model}_${vehicle.vin}_report.pdf`
        .replace(/[^a-z0-9-_]/gi, '_') // Replace invalid characters
        .toLowerCase();
      
      // Save the PDF
      doc.save(filename);
    } catch (error) {
      console.error('Error generating PDF:', error);
      // You could add a toast notification here to show the error to the user
    }
  };

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-2 px-4 py-2 bg-accent/10 text-accent rounded-lg hover:bg-accent/20 transition-colors"
      title="Export PDF Report"
    >
      <FileText className="w-5 h-5" />
      Export Report
    </button>
  );
}
