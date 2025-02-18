import { format } from 'date-fns';
import { jsPDF } from 'jspdf';
import type { Transaction } from '../types/interfaces';

// Helper function to format currency
const formatCurrency = (amount: number) => {
  return amount.toLocaleString('en-US', { minimumFractionDigits: 2 });
};

// Helper function to format date
const formatDate = (date: string) => {
  return format(new Date(date), 'MMM d, yyyy');
};

// Export transactions to CSV
export const exportToCSV = (transactions: Transaction[]) => {
  // Define CSV headers
  const headers = [
    'Date',
    'Type',
    'Category',
    'Description',
    'Amount (AED)',
  ];

  // Convert transactions to CSV rows
  const rows = transactions.map(transaction => [
    formatDate(transaction.date),
    transaction.type,
    transaction.category,
    transaction.description,
    formatCurrency(transaction.amount)
  ]);

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  // Create and download the file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `transactions_${format(new Date(), 'yyyy-MM-dd')}.csv`);
  link.style.visibility = 'hidden'; // Make the link invisible
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Helper function to wrap text and return new Y position
const wrapText = (doc: jsPDF, text: string, x: number, y: number, maxWidth: number, lineHeight: number = 5): number => {
  const lines = doc.splitTextToSize(text, maxWidth);
  lines.forEach((line: string, index: number) => {
    doc.text(line, x, y + (index * lineHeight));
  });
  return y + (lines.length * lineHeight);
};

// Helper function to add table header
const addTableHeader = (doc: jsPDF, y: number, columns: any[], margin: number, pageWidth: number): number => {
  // Add header background
  doc.setFillColor(240, 240, 240);
  doc.rect(margin, y, pageWidth - (margin * 2), 8, 'F');
  
  // Add header text
  doc.setTextColor(0);
  let x = margin;
  columns.forEach(col => {
    doc.text(col.header, x + 2, y + 6); // Add 2pt padding
    x += col.width;
  });
  
  return y + 10; // Return new Y position
};

// Export transactions to PDF
export const exportToPDF = async (transactions: Transaction[]) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 15;
  let y = margin;

  // Set font
  doc.setFont('helvetica');

  // Add title
  doc.setFontSize(18);
  doc.setTextColor(0);
  doc.text('Transaction Report', pageWidth / 2, y, { align: 'center' });
  y += 12;

  // Add date
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated on ${format(new Date(), 'MMMM d, yyyy')}`, pageWidth / 2, y, { align: 'center' });
  y += 15;

  // Calculate totals
  const totals = transactions.reduce((acc, t) => {
    if (t.type === 'income') {
      acc.income += t.amount;
    } else {
      acc.expenses += t.amount;
    }
    return acc;
  }, { income: 0, expenses: 0 });

  // Add summary section
  doc.setFillColor(248, 250, 252);
  doc.rect(margin, y, pageWidth - (margin * 2), 35, 'F');
  
  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text('Summary', margin + 5, y + 8);
  
  doc.setFontSize(10);
  doc.text(`Total Income:`, margin + 5, y + 18);
  doc.text(`AED ${formatCurrency(totals.income)}`, pageWidth - margin - 5, y + 18, { align: 'right' });
  
  doc.text(`Total Expenses:`, margin + 5, y + 26);
  doc.text(`AED ${formatCurrency(totals.expenses)}`, pageWidth - margin - 5, y + 26, { align: 'right' });
  
  doc.setFontSize(11);
  doc.text(`Net Total:`, margin + 5, y + 34);
  doc.text(`AED ${formatCurrency(totals.income - totals.expenses)}`, pageWidth - margin - 5, y + 34, { align: 'right' });
  
  y += 45;

  // Define columns
  const columns = [
    { header: 'Date', width: 25 },
    { header: 'Type', width: 25 },
    { header: 'Category', width: 35 },
    { header: 'Amount', width: 35 },
    { header: 'Description', width: 65 }
  ];

  // Add initial table header
  y = addTableHeader(doc, y, columns, margin, pageWidth);

  // Add table rows
  doc.setFontSize(9);
  transactions.forEach((transaction, index) => {
    // Check if we need a new page
    if (y > pageHeight - 20) {
      doc.addPage();
      y = margin;
      y = addTableHeader(doc, y, columns, margin, pageWidth);
    }

    // Add zebra striping
    if (index % 2 === 0) {
      doc.setFillColor(252, 252, 252);
      doc.rect(margin, y - 4, pageWidth - (margin * 2), 12, 'F');
    }

    let x = margin;
    let maxY = y;

    // Date
    doc.text(formatDate(transaction.date), x + 2, y);
    x += columns[0].width;

    // Type
    doc.text(transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1), x + 2, y);
    x += columns[1].width;

    // Category
    const wrappedCategoryY = wrapText(doc, transaction.category, x + 2, y, columns[2].width - 4);
    maxY = Math.max(maxY, wrappedCategoryY);
    x += columns[2].width;

    // Amount
    doc.text(`AED ${formatCurrency(transaction.amount)}`, x + 2, y);
    x += columns[3].width;

    // Description (with wrapping)
    const wrappedDescY = wrapText(doc, transaction.description, x + 2, y, columns[4].width - 4);
    maxY = Math.max(maxY, wrappedDescY);

    // Update y position for next row (use the highest Y value from wrapped text)
    y = maxY + 4;
  });

  // Add page numbers
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth - margin,
      pageHeight - 10,
      { align: 'right' }
    );
  }

  // Save the PDF
  doc.save(`transactions_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
};
