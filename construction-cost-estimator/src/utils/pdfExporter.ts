import jsPDF from 'jspdf';
import type { CostItem, Project, AnnotationData } from '../types';

/**
 * PDF Export Utilities
 * Provides functions for generating professional PDF reports
 */

interface PDFOptions {
  includeCoverPage?: boolean;
  includeSummary?: boolean;
  includeDetails?: boolean;
  includeAnnotations?: boolean;
  includeCharts?: boolean;
  pageNumbers?: boolean;
  headerFooter?: boolean;
  markup?: number;
  projectName?: string;
  companyName?: string;
  companyLogo?: string;
}

/**
 * PDF page dimensions and margins
 */
const PAGE_WIDTH = 210; // A4 width in mm
const PAGE_HEIGHT = 297; // A4 height in mm
const MARGIN = 20;
const CONTENT_WIDTH = PAGE_WIDTH - 2 * MARGIN;

/**
 * Colors for PDF
 */
const COLORS = {
  primary: '#2563eb',
  secondary: '#64748b',
  text: '#1e293b',
  textLight: '#64748b',
  border: '#e2e8f0',
  background: '#f8fafc',
};

/**
 * Adds header to PDF page
 */
function addHeader(
  doc: jsPDF,
  title: string,
  pageNumber: number,
  totalPages: number
): void {
  doc.setFontSize(10);
  doc.setTextColor(COLORS.textLight);
  doc.text(title, MARGIN, 15);
  doc.text(`Page ${pageNumber} of ${totalPages}`, PAGE_WIDTH - MARGIN, 15, { align: 'right' });

  // Header line
  doc.setDrawColor(COLORS.border);
  doc.setLineWidth(0.5);
  doc.line(MARGIN, 18, PAGE_WIDTH - MARGIN, 18);
}

/**
 * Adds footer to PDF page
 */
function addFooter(doc: jsPDF): void {
  const y = PAGE_HEIGHT - 15;

  // Footer line
  doc.setDrawColor(COLORS.border);
  doc.setLineWidth(0.5);
  doc.line(MARGIN, y - 3, PAGE_WIDTH - MARGIN, y - 3);

  doc.setFontSize(8);
  doc.setTextColor(COLORS.textLight);
  const dateStr = new Date().toLocaleDateString();
  doc.text(`Generated on ${dateStr}`, MARGIN, y);
  doc.text('Construction Cost Estimator', PAGE_WIDTH - MARGIN, y, { align: 'right' });
}

/**
 * Adds cover page to PDF
 */
function addCoverPage(
  doc: jsPDF,
  projectName: string,
  options: PDFOptions
): void {
  // Company logo area (if provided)
  if (options.companyLogo) {
    // Add logo here - would need image data
  }

  // Title
  doc.setFontSize(28);
  doc.setTextColor(COLORS.primary);
  doc.text('COST ESTIMATE', PAGE_WIDTH / 2, 80, { align: 'center' });

  // Project name
  doc.setFontSize(20);
  doc.setTextColor(COLORS.text);
  doc.text(projectName, PAGE_WIDTH / 2, 100, { align: 'center' });

  // Company name
  if (options.companyName) {
    doc.setFontSize(14);
    doc.setTextColor(COLORS.textLight);
    doc.text(options.companyName, PAGE_WIDTH / 2, 115, { align: 'center' });
  }

  // Date
  doc.setFontSize(12);
  doc.setTextColor(COLORS.textLight);
  const dateStr = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  doc.text(dateStr, PAGE_WIDTH / 2, 140, { align: 'center' });

  // Decorative line
  doc.setDrawColor(COLORS.primary);
  doc.setLineWidth(1);
  doc.line(PAGE_WIDTH / 2 - 30, 150, PAGE_WIDTH / 2 + 30, 150);

  // Footer
  doc.setFontSize(10);
  doc.setTextColor(COLORS.textLight);
  doc.text('Prepared using Construction Cost Estimator', PAGE_WIDTH / 2, PAGE_HEIGHT - 30, { align: 'center' });
}

/**
 * Adds cost summary page to PDF
 */
function addCostSummary(
  doc: jsPDF,
  costItems: CostItem[],
  markup: number,
  pageNumber: number,
  totalPages: number,
  projectName: string
): number {
  let y = MARGIN + 10;

  // Add header
  if (pageNumber > 1) {
    addHeader(doc, projectName, pageNumber, totalPages);
    y = 30;
  }

  // Section title
  doc.setFontSize(18);
  doc.setTextColor(COLORS.primary);
  doc.text('Cost Summary', MARGIN, y);
  y += 15;

  // Calculate totals by category
  const categoryTotals: Record<string, number> = {};
  costItems.forEach(item => {
    const category = item.category || 'Uncategorized';
    categoryTotals[category] = (categoryTotals[category] || 0) + item.totalCost;
  });

  // Summary table header
  doc.setFillColor(COLORS.background);
  doc.rect(MARGIN, y, CONTENT_WIDTH, 10, 'F');

  doc.setFontSize(11);
  doc.setTextColor(COLORS.text);
  doc.setFont('helvetica', 'bold');
  doc.text('Category', MARGIN + 5, y + 7);
  doc.text('Amount', PAGE_WIDTH - MARGIN - 5, y + 7, { align: 'right' });
  y += 10;

  // Category rows
  doc.setFont('helvetica', 'normal');
  Object.entries(categoryTotals).forEach(([category, amount]) => {
    if (y > PAGE_HEIGHT - 40) {
      doc.addPage();
      pageNumber++;
      addHeader(doc, projectName, pageNumber, totalPages);
      y = 40;
    }

    doc.setDrawColor(COLORS.border);
    doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);

    doc.text(category, MARGIN + 5, y + 7);
    doc.text(`$${amount.toFixed(2)}`, PAGE_WIDTH - MARGIN - 5, y + 7, { align: 'right' });
    y += 10;
  });

  // Bottom border
  doc.setDrawColor(COLORS.border);
  doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
  y += 5;

  // Subtotal
  const subtotal = costItems.reduce((sum, item) => sum + item.totalCost, 0);
  doc.setFont('helvetica', 'bold');
  doc.text('Subtotal:', MARGIN + 5, y + 7);
  doc.text(`$${subtotal.toFixed(2)}`, PAGE_WIDTH - MARGIN - 5, y + 7, { align: 'right' });
  y += 12;

  // Markup
  if (markup > 0) {
    const markupAmount = subtotal * (markup / 100);
    doc.setFont('helvetica', 'normal');
    doc.text(`Markup (${markup}%):`, MARGIN + 5, y + 7);
    doc.text(`$${markupAmount.toFixed(2)}`, PAGE_WIDTH - MARGIN - 5, y + 7, { align: 'right' });
    y += 12;

    // Total
    const total = subtotal + markupAmount;
    doc.setFillColor(COLORS.primary);
    doc.rect(MARGIN, y, CONTENT_WIDTH, 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Total Cost:', MARGIN + 5, y + 8);
    doc.text(`$${total.toFixed(2)}`, PAGE_WIDTH - MARGIN - 5, y + 8, { align: 'right' });
    y += 15;
  } else {
    // Total without markup
    doc.setFillColor(COLORS.primary);
    doc.rect(MARGIN, y, CONTENT_WIDTH, 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Total Cost:', MARGIN + 5, y + 8);
    doc.text(`$${subtotal.toFixed(2)}`, PAGE_WIDTH - MARGIN - 5, y + 8, { align: 'right' });
    y += 15;
  }

  addFooter(doc);
  return pageNumber;
}

/**
 * Adds detailed cost items to PDF
 */
function addDetailedCosts(
  doc: jsPDF,
  costItems: CostItem[],
  pageNumber: number,
  totalPages: number,
  projectName: string
): number {
  doc.addPage();
  pageNumber++;

  let y = 30;
  addHeader(doc, projectName, pageNumber, totalPages);

  // Section title
  doc.setFontSize(18);
  doc.setTextColor(COLORS.primary);
  doc.text('Detailed Cost Breakdown', MARGIN, y);
  y += 15;

  // Group by category
  const categorized = costItems.reduce((acc, item) => {
    const category = item.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, CostItem[]>);

  // Table header styling
  const tableHeaders = ['Description', 'Qty', 'Unit', 'Unit Cost', 'Total'];
  const colWidths = [80, 20, 25, 30, 30]; // mm
  let xPos = MARGIN;

  Object.entries(categorized).forEach(([category, items]) => {
    if (y > PAGE_HEIGHT - 50) {
      doc.addPage();
      pageNumber++;
      addHeader(doc, projectName, pageNumber, totalPages);
      y = 40;
    }

    // Category header
    doc.setFillColor(COLORS.background);
    doc.rect(MARGIN, y, CONTENT_WIDTH, 10, 'F');
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(COLORS.text);
    doc.text(category, MARGIN + 5, y + 7);
    y += 10;

    // Table headers
    doc.setFillColor(COLORS.primary);
    doc.rect(MARGIN, y, CONTENT_WIDTH, 8, 'F');
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    xPos = MARGIN + 2;
    tableHeaders.forEach((header, i) => {
      const align = i > 0 ? 'right' : 'left';
      const x = i > 0 ? xPos + colWidths[i] - 2 : xPos;
      doc.text(header, x, y + 6, { align: align as any });
      xPos += colWidths[i];
    });
    y += 8;

    // Items
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(COLORS.text);
    items.forEach(item => {
      if (y > PAGE_HEIGHT - 30) {
        doc.addPage();
        pageNumber++;
        addHeader(doc, projectName, pageNumber, totalPages);
        y = 40;
      }

      xPos = MARGIN + 2;
      const rowData = [
        item.description,
        item.quantity.toString(),
        item.unit,
        `$${item.unitCost.toFixed(2)}`,
        `$${item.totalCost.toFixed(2)}`,
      ];

      doc.setDrawColor(COLORS.border);
      doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);

      rowData.forEach((text, i) => {
        const align = i > 0 ? 'right' : 'left';
        const x = i > 0 ? xPos + colWidths[i] - 2 : xPos;
        // Truncate long descriptions
        const displayText = i === 0 && text.length > 35 ? text.substring(0, 32) + '...' : text;
        doc.text(displayText, x, y + 6, { align: align as any });
        xPos += colWidths[i];
      });
      y += 8;
    });

    // Category subtotal
    const categoryTotal = items.reduce((sum, item) => sum + item.totalCost, 0);
    doc.setFont('helvetica', 'bold');
    doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
    y += 1;
    doc.text('Subtotal', MARGIN + 2, y + 6);
    doc.text(`$${categoryTotal.toFixed(2)}`, PAGE_WIDTH - MARGIN - 2, y + 6, { align: 'right' });
    y += 12;

    doc.setFont('helvetica', 'normal');
  });

  addFooter(doc);
  return pageNumber;
}

/**
 * Adds annotations list to PDF
 * Note: Currently unused but kept for future feature implementation
 */
// function addAnnotationsList(
//   doc: jsPDF,
//   annotations: AnnotationData[],
//   pageNumber: number,
//   totalPages: number,
//   projectName: string
// ): number {
//   doc.addPage();
//   pageNumber++;

//   let y = 30;
//   addHeader(doc, projectName, pageNumber, totalPages);

//   // Section title
//   doc.setFontSize(18);
//   doc.setTextColor(COLORS.primary);
//   doc.text('Annotations', MARGIN, y);
//   y += 15;

//   doc.setFontSize(9);
//   doc.setTextColor(COLORS.text);

//   annotations.forEach((annotation, index) => {
//     if (y > PAGE_HEIGHT - 40) {
//       doc.addPage();
//       pageNumber++;
//       addHeader(doc, projectName, pageNumber, totalPages);
//       y = 40;
//     }

//     doc.setFont('helvetica', 'bold');
//     doc.text(`${index + 1}. ${annotation.type} (Page ${annotation.pageNumber})`, MARGIN, y);
//     y += 5;

//     doc.setFont('helvetica', 'normal');
//     if (annotation.text) {
//       doc.text(`   Text: ${annotation.text}`, MARGIN, y);
//       y += 5;
//     }
//     if (annotation.notes) {
//       doc.text(`   Notes: ${annotation.notes}`, MARGIN, y);
//       y += 5;
//     }
//     if (annotation.quantity) {
//       doc.text(`   Quantity: ${annotation.quantity} ${annotation.unit || ''}`, MARGIN, y);
//       y += 5;
//     }
//     y += 3;
//   });

//   addFooter(doc);
//   return pageNumber;
// }

/**
 * Main function to export cost estimate as PDF
 */
export async function exportCostEstimateAsPDF(
  costItems: CostItem[],
  options: PDFOptions = {}
): Promise<Blob> {
  const {
    includeCoverPage = true,
    includeSummary = true,
    includeDetails = true,
    includeAnnotations = false,
    markup = 0,
    projectName = 'Cost Estimate',
  } = options;

  // Note: pageNumbers and headerFooter are always true for now
  // Future enhancement: make these configurable

  const doc = new jsPDF();
  let currentPage = 0;

  // Calculate total pages (approximate)
  let totalPages = 0;
  if (includeCoverPage) totalPages++;
  if (includeSummary) totalPages++;
  if (includeDetails) totalPages += Math.ceil(costItems.length / 20);
  if (includeAnnotations) totalPages++;

  // Cover page
  if (includeCoverPage) {
    currentPage = 1;
    addCoverPage(doc, projectName, options);
  }

  // Summary page
  if (includeSummary) {
    if (currentPage > 0) doc.addPage();
    currentPage++;
    currentPage = addCostSummary(doc, costItems, markup, currentPage, totalPages, projectName);
  }

  // Detailed breakdown
  if (includeDetails && costItems.length > 0) {
    currentPage = addDetailedCosts(doc, costItems, currentPage, totalPages, projectName);
  }

  // Annotations list (if provided)
  // Would need to pass annotations separately

  return doc.output('blob');
}

/**
 * Exports project data as PDF
 */
export async function exportProjectAsPDF(
  project: Project,
  costItems: CostItem[],
  annotations: AnnotationData[],
  options: PDFOptions = {}
): Promise<Blob> {
  return exportCostEstimateAsPDF(costItems, {
    ...options,
    projectName: project.name,
    includeAnnotations: annotations.length > 0,
  });
}

/**
 * Generates a report header string
 */
export function generateReportHeader(title: string, date: Date): string {
  return `${title}\nGenerated: ${date.toLocaleString()}`;
}
