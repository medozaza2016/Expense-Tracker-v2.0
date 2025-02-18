import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import type { Vehicle, VehicleExpense, ProfitDistribution } from '../services/vehicleService';
import { settingsService } from '../services/settingsService';

interface VehicleReport {
  vehicle: Vehicle;
  expenses: VehicleExpense[];
  distributions: ProfitDistribution[];
  totalExpenses: number;
  netProfit: number;
}

const colors = {
  primary: '#1a1a1a',
  accent: '#e85c33',
  success: '#22c55e',
  danger: '#ef4444',
  border: '#374151',
  text: '#1a1a1a',
  textLight: '#4b5563',
  tableHeader: '#f3f4f6',
  tableStripe: '#f9fafb',
  tableStripeDark: '#f3f4f6'
};

const formatCurrency = (amount: number) => {
  return `AED ${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
};

const addHeader = async (doc: jsPDF) => {
  try {
    const settings = await settingsService.getSettings();
    const companyName = settings?.company_name || 'Challenger Used Cars';
    const companyAddress = settings?.company_address || 'Showroom No 801/290\nOpposite Tamouh Souq Al Haraj - Al Ruqa Al Hamra\nSharjah, United Arab Emirates';
    const companyPhone = settings?.company_phone || '';
    const companyEmail = settings?.company_email || '';

    // Add colored header background
    doc.setFillColor(colors.primary);
    doc.rect(0, 0, 210, 40, 'F');

    // Company name
    doc.setTextColor('#ffffff');
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text(companyName, 20, 20);

    // Address and contact info
    doc.setTextColor('#ffffff');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const addressLines = companyAddress.split('\n');
    let y = 30;
    addressLines.forEach(line => {
      doc.text(line, 20, y);
      y += 5;
    });

    // Contact info on the right
    if (companyPhone || companyEmail) {
      doc.setTextColor('#ffffff');
      doc.setFontSize(10);
      let contactY = 30;
      if (companyPhone) {
        doc.text(`Tel: ${companyPhone}`, 150, contactY);
        contactY += 5;
      }
      if (companyEmail) {
        doc.text(`Email: ${companyEmail}`, 150, contactY);
      }
    }

    return y + 15;
  } catch (error) {
    console.error('Error adding header:', error);
    throw new Error('Failed to add header to PDF');
  }
};

const addSection = (doc: jsPDF, title: string, y: number): number => {
  try {
    // Section title with accent color
    doc.setTextColor(colors.accent);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 20, y);

    // Accent colored line
    doc.setDrawColor(colors.accent);
    doc.setLineWidth(0.5);
    doc.line(20, y + 2, 190, y + 2);

    doc.setTextColor(colors.text);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    return y + 10;
  } catch (error) {
    console.error('Error adding section:', error);
    throw new Error('Failed to add section to PDF');
  }
};

const addTableHeader = (doc: jsPDF, headers: string[], cols: number[], y: number): number => {
  try {
    // Table header background
    doc.setFillColor(colors.tableHeader);
    doc.rect(20, y - 5, 170, 8, 'F');

    // Header text
    doc.setTextColor(colors.text);
    doc.setFont('helvetica', 'bold');
    headers.forEach((header, i) => {
      doc.text(header, cols[i], y);
    });
    doc.setTextColor(colors.text);
    doc.setFont('helvetica', 'normal');
    return y + 8;
  } catch (error) {
    console.error('Error adding table header:', error);
    throw new Error('Failed to add table header to PDF');
  }
};

const wrapText = (doc: jsPDF, text: string, x: number, y: number, maxWidth: number): number => {
  try {
    const words = text.split(' ');
    let line = '';
    let currentY = y;
    const lineHeight = 5;

    words.forEach(word => {
      const testLine = line + (line ? ' ' : '') + word;
      const testWidth = doc.getTextWidth(testLine);

      if (testWidth > maxWidth) {
        doc.text(line, x, currentY);
        line = word;
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    });

    if (line.trim()) {
      doc.text(line, x, currentY);
      currentY += lineHeight;
    }

    return currentY;
  } catch (error) {
    console.error('Error wrapping text:', error);
    throw new Error('Failed to wrap text in PDF');
  }
};

export const generateVehicleReport = async (data: VehicleReport): Promise<jsPDF> => {
  try {
    // Validate required data
    if (!data.vehicle) {
      throw new Error('Vehicle data is required');
    }

    const doc = new jsPDF();
    
    // Add header with minimal top margin
    let y = await addHeader(doc);
    y -= 5; // Reduce space after header

    // Report Title - moved closer to header
    doc.setTextColor(colors.primary);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Vehicle Sales Report', 105, y + 5, { align: 'center' });
    y += 15;

    // Vehicle Information
    y = addSection(doc, 'Vehicle Information', y);
    const vehicleInfo = [
      ['Make:', data.vehicle.make || '-'],
      ['Model:', data.vehicle.model || '-'],
      ['Year:', data.vehicle.year?.toString() || '-'],
      ['VIN:', data.vehicle.vin || '-'],
      ['Color:', data.vehicle.color || '-'],
      ['Purchase Date:', data.vehicle.purchase_date ? format(new Date(data.vehicle.purchase_date), 'MMM d, yyyy') : '-'],
      ['Sale Date:', data.vehicle.sale_date ? format(new Date(data.vehicle.sale_date), 'MMM d, yyyy') : '-']
    ];

    vehicleInfo.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(colors.textLight);
      doc.text(label, 25, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(colors.text);
      doc.text(value, 70, y);
      y += 6;
    });
    y += 3;

    // Registration Details
    y = addSection(doc, 'Registration Details', y);
    const registrationInfo = [
      ['Owner Name:', data.vehicle.owner_name || '-'],
      ['TC#:', data.vehicle.tc_number || '-'],
      ['Certificate Number:', data.vehicle.certificate_number || '-'],
      ['Registration Location:', data.vehicle.registration_location || '-']
    ];

    registrationInfo.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(colors.textLight);
      doc.text(label, 25, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(colors.text);
      doc.text(value, 70, y);
      y += 6;
    });
    y += 3;

    // Financial Summary
    y = addSection(doc, 'Financial Summary', y);
    const financialInfo = [
      ['Purchase Price:', formatCurrency(data.vehicle.purchase_price || 0)],
      ['Sale Price:', data.vehicle.sale_price ? formatCurrency(data.vehicle.sale_price) : '-'],
      ['Total Expenses:', formatCurrency(data.totalExpenses || 0)],
      ['Net Profit:', formatCurrency(data.netProfit || 0)]
    ];

    financialInfo.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(colors.textLight);
      doc.text(label, 25, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(value.includes('-') ? colors.danger : colors.success);
      doc.text(value, 70, y);
      y += 6;
    });
    y += 3;

    // Expenses
    if (y > 200) {
      doc.addPage();
      y = 20;
    }

    y = addSection(doc, 'Expenses', y);
    if (data.expenses && data.expenses.length > 0) {
      const cols = [25, 60, 100, 140];
      y = addTableHeader(doc, ['Date', 'Type', 'Amount', 'Recipient'], cols, y);

      data.expenses.forEach((expense, index) => {
        if (y > 260) {
          doc.addPage();
          y = 20;
          y = addTableHeader(doc, ['Date', 'Type', 'Amount', 'Recipient'], cols, y);
        }

        if (index % 2 === 0) {
          doc.setFillColor(245, 245, 245);
          doc.rect(20, y - 4, 170, 6, 'F');
        }

        doc.setTextColor(colors.text);
        doc.text(format(new Date(expense.date), 'MMM d, yyyy'), cols[0], y);
        doc.text(expense.type || '-', cols[1], y);
        doc.setTextColor(colors.danger);
        doc.text(formatCurrency(expense.amount || 0), cols[2], y);
        doc.setTextColor(colors.text);
        doc.text(expense.recipient || '-', cols[3], y);
        y += 6;
      });
    } else {
      doc.text('No expenses recorded', 25, y);
    }
    y += 5;

    // Profit Distribution
    if (y > 200) {
      doc.addPage();
      y = 20;
    }

    y = addSection(doc, 'Profit Distribution', y);
    if (data.distributions && data.distributions.length > 0) {
      const cols = [25, 70, 110, 140];
      const colWidths = [40, 35, 25, 45];
      
      y = addTableHeader(doc, ['Recipient', 'Amount', 'Percentage', 'Notes'], cols, y);

      data.distributions.forEach((dist, index) => {
        if (y > 260) {
          doc.addPage();
          y = 20;
          y = addTableHeader(doc, ['Recipient', 'Amount', 'Percentage', 'Notes'], cols, y);
        }

        if (index % 2 === 0) {
          doc.setFillColor(colors.tableStripe);
        } else {
          doc.setFillColor(colors.tableStripeDark);
        }
        doc.rect(20, y - 4, 170, 8, 'F');

        doc.setTextColor(colors.text);
        doc.text(dist.recipient || '-', cols[0], y);
        doc.setTextColor(colors.success);
        doc.text(formatCurrency(dist.amount || 0), cols[1], y);
        doc.setTextColor(colors.text);
        doc.text(`${dist.percentage || 0}%`, cols[2], y);

        doc.setTextColor(colors.textLight);
        const maxY = wrapText(doc, dist.notes || '-', cols[3], y, colWidths[3]);
        y = maxY + 4;
      });

      doc.setDrawColor(colors.border);
      doc.setLineWidth(0.1);
      doc.line(20, y, 190, y);
    } else {
      doc.text('No profit distributions recorded', 25, y);
    }

    // Notes Section
    if (data.vehicle.notes) {
      if (y > 200) {
        doc.addPage();
        y = 20;
      }

      y = addSection(doc, 'Notes', y);
      doc.setTextColor(colors.text);
      doc.setFontSize(10);
      const maxY = wrapText(doc, data.vehicle.notes, 25, y, 160);
      y = maxY + 10;
    }

    // Footer on each page
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      
      doc.setDrawColor(colors.border);
      doc.setLineWidth(0.5);
      doc.line(20, 285, 190, 285);

      doc.setFontSize(8);
      doc.setTextColor(colors.textLight);
      doc.text(
        `Generated on ${format(new Date(), 'MMM d, yyyy')} - Page ${i} of ${pageCount}`,
        105,
        288,
        { align: 'center' }
      );
    }

    return doc;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};
