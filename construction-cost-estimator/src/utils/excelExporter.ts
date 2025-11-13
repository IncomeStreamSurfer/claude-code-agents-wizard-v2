import * as XLSX from 'xlsx';
import type { CostItem, AnnotationData, Project } from '../types';

/**
 * Excel Export Utilities
 * Provides functions for exporting data to Excel format with formatting
 */

interface ExcelExportOptions {
  includeCharts?: boolean;
  includeSummary?: boolean;
  includeAnnotations?: boolean;
  markup?: number;
  sheetNames?: {
    summary?: string;
    costs?: string;
    annotations?: string;
  };
}

/**
 * Creates a formatted workbook for cost estimates
 */
export async function exportCostEstimateAsExcel(
  costItems: CostItem[],
  options: ExcelExportOptions = {}
): Promise<Blob> {
  const {
    includeSummary = true,
    markup = 0,
    sheetNames = {},
  } = options;

  const workbook = XLSX.utils.book_new();

  // Summary sheet
  if (includeSummary) {
    const summarySheet = createSummarySheet(costItems, markup);
    XLSX.utils.book_append_sheet(
      workbook,
      summarySheet,
      sheetNames.summary || 'Summary'
    );
  }

  // Cost items sheet
  const costsSheet = createCostItemsSheet(costItems);
  XLSX.utils.book_append_sheet(
    workbook,
    costsSheet,
    sheetNames.costs || 'Cost Items'
  );

  // Write to blob
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  return new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}

/**
 * Creates summary sheet with category totals
 */
function createSummarySheet(costItems: CostItem[], markup: number): XLSX.WorkSheet {
  const data: any[][] = [];

  // Title
  data.push(['COST ESTIMATE SUMMARY']);
  data.push([`Generated: ${new Date().toLocaleString()}`]);
  data.push([]);

  // Calculate category totals
  const categoryTotals: Record<string, number> = {};
  costItems.forEach(item => {
    const category = item.category || 'Uncategorized';
    categoryTotals[category] = (categoryTotals[category] || 0) + item.totalCost;
  });

  // Headers
  data.push(['Category', 'Amount']);

  // Category rows
  Object.entries(categoryTotals).forEach(([category, amount]) => {
    data.push([category, amount]);
  });

  // Empty row
  data.push([]);

  // Subtotal
  const subtotal = costItems.reduce((sum, item) => sum + item.totalCost, 0);
  data.push(['Subtotal', subtotal]);

  // Markup
  if (markup > 0) {
    const markupAmount = subtotal * (markup / 100);
    data.push([`Markup (${markup}%)`, markupAmount]);
    const total = subtotal + markupAmount;
    data.push(['TOTAL', total]);
  } else {
    data.push(['TOTAL', subtotal]);
  }

  // Empty row
  data.push([]);

  // Statistics
  data.push(['Statistics']);
  data.push(['Total Items', costItems.length]);
  data.push(['Total Categories', Object.keys(categoryTotals).length]);

  const worksheet = XLSX.utils.aoa_to_sheet(data);

  // Set column widths
  worksheet['!cols'] = [
    { wch: 25 }, // Category
    { wch: 15 }, // Amount
  ];

  // Apply currency formatting to amount columns
  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
  for (let row = 4; row <= range.e.r; row++) {
    const cellAddress = XLSX.utils.encode_cell({ r: row, c: 1 });
    if (worksheet[cellAddress] && typeof worksheet[cellAddress].v === 'number') {
      worksheet[cellAddress].z = '$#,##0.00';
    }
  }

  return worksheet;
}

/**
 * Creates detailed cost items sheet
 */
function createCostItemsSheet(costItems: CostItem[]): XLSX.WorkSheet {
  const data: any[][] = [];

  // Headers
  data.push([
    'Description',
    'Quantity',
    'Unit',
    'Unit Cost',
    'Total Cost',
    'Category',
    'Page',
    'Notes',
    'Created Date',
  ]);

  // Group by category for better organization
  const categorized = costItems.reduce((acc, item) => {
    const category = item.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, CostItem[]>);

  // Add data rows grouped by category
  Object.entries(categorized).forEach(([category, items]) => {
    // Category header row
    data.push([category, '', '', '', '', '', '', '', '']);

    // Items in this category
    items.forEach(item => {
      data.push([
        item.description,
        item.quantity,
        item.unit,
        item.unitCost,
        item.totalCost,
        item.category || '',
        item.pageNumber,
        item.notes || '',
        item.createdAt instanceof Date
          ? item.createdAt.toISOString().split('T')[0]
          : new Date(item.createdAt).toISOString().split('T')[0],
      ]);
    });

    // Category subtotal
    const categoryTotal = items.reduce((sum, item) => sum + item.totalCost, 0);
    data.push([
      `${category} Subtotal`,
      '',
      '',
      '',
      categoryTotal,
      '',
      '',
      '',
      '',
    ]);

    // Empty row between categories
    data.push([]);
  });

  const worksheet = XLSX.utils.aoa_to_sheet(data);

  // Set column widths
  worksheet['!cols'] = [
    { wch: 40 }, // Description
    { wch: 10 }, // Quantity
    { wch: 12 }, // Unit
    { wch: 12 }, // Unit Cost
    { wch: 12 }, // Total Cost
    { wch: 15 }, // Category
    { wch: 8 },  // Page
    { wch: 30 }, // Notes
    { wch: 12 }, // Created Date
  ];

  // Apply number formatting
  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
  for (let row = 1; row <= range.e.r; row++) {
    // Quantity (column B)
    const qtyCell = XLSX.utils.encode_cell({ r: row, c: 1 });
    if (worksheet[qtyCell] && typeof worksheet[qtyCell].v === 'number') {
      worksheet[qtyCell].z = '0.00';
    }

    // Unit Cost (column D)
    const unitCostCell = XLSX.utils.encode_cell({ r: row, c: 3 });
    if (worksheet[unitCostCell] && typeof worksheet[unitCostCell].v === 'number') {
      worksheet[unitCostCell].z = '$#,##0.00';
    }

    // Total Cost (column E)
    const totalCostCell = XLSX.utils.encode_cell({ r: row, c: 4 });
    if (worksheet[totalCostCell] && typeof worksheet[totalCostCell].v === 'number') {
      worksheet[totalCostCell].z = '$#,##0.00';
    }
  }

  return worksheet;
}

/**
 * Creates annotations sheet
 */
function createAnnotationsSheet(annotations: AnnotationData[]): XLSX.WorkSheet {
  const data: any[][] = [];

  // Headers
  data.push([
    'ID',
    'Type',
    'Page',
    'X',
    'Y',
    'Width',
    'Height',
    'Color',
    'Text',
    'Notes',
    'Quantity',
    'Unit',
    'Created Date',
  ]);

  // Data rows
  annotations.forEach(annotation => {
    data.push([
      annotation.id,
      annotation.type,
      annotation.pageNumber,
      annotation.x,
      annotation.y,
      annotation.width,
      annotation.height,
      annotation.color,
      annotation.text || '',
      annotation.notes || '',
      annotation.quantity || '',
      annotation.unit || '',
      annotation.createdAt instanceof Date
        ? annotation.createdAt.toISOString().split('T')[0]
        : new Date(annotation.createdAt).toISOString().split('T')[0],
    ]);
  });

  const worksheet = XLSX.utils.aoa_to_sheet(data);

  // Set column widths
  worksheet['!cols'] = [
    { wch: 25 }, // ID
    { wch: 12 }, // Type
    { wch: 8 },  // Page
    { wch: 10 }, // X
    { wch: 10 }, // Y
    { wch: 10 }, // Width
    { wch: 10 }, // Height
    { wch: 10 }, // Color
    { wch: 20 }, // Text
    { wch: 30 }, // Notes
    { wch: 10 }, // Quantity
    { wch: 12 }, // Unit
    { wch: 12 }, // Created Date
  ];

  return worksheet;
}

/**
 * Exports full project data to Excel with multiple sheets
 */
export async function exportFullProjectAsExcel(
  project: Project,
  costItems: CostItem[],
  annotations: AnnotationData[],
  options: ExcelExportOptions = {}
): Promise<Blob> {
  const workbook = XLSX.utils.book_new();

  // Project info sheet
  const projectSheet = createProjectInfoSheet(project);
  XLSX.utils.book_append_sheet(workbook, projectSheet, 'Project Info');

  // Summary sheet
  if (options.includeSummary !== false) {
    const summarySheet = createSummarySheet(costItems, options.markup || 0);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
  }

  // Cost items sheet
  const costsSheet = createCostItemsSheet(costItems);
  XLSX.utils.book_append_sheet(workbook, costsSheet, 'Cost Items');

  // Annotations sheet
  if (options.includeAnnotations && annotations.length > 0) {
    const annotationsSheet = createAnnotationsSheet(annotations);
    XLSX.utils.book_append_sheet(workbook, annotationsSheet, 'Annotations');
  }

  // Write to blob
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  return new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}

/**
 * Creates project info sheet
 */
function createProjectInfoSheet(project: Project): XLSX.WorkSheet {
  const data: any[][] = [];

  data.push(['PROJECT INFORMATION']);
  data.push([]);
  data.push(['Project Name', project.name]);
  data.push(['Description', project.description || '']);
  data.push(['PDF File', project.pdfFileName]);
  data.push(['File Size', `${(project.pdfFileSize / 1024 / 1024).toFixed(2)} MB`]);
  data.push(['Total Pages', project.totalPages]);
  data.push(['Created Date', project.createdAt instanceof Date
    ? project.createdAt.toISOString().split('T')[0]
    : new Date(project.createdAt).toISOString().split('T')[0]]);
  data.push(['Last Updated', project.updatedAt instanceof Date
    ? project.updatedAt.toISOString().split('T')[0]
    : new Date(project.updatedAt).toISOString().split('T')[0]]);

  const worksheet = XLSX.utils.aoa_to_sheet(data);

  // Set column widths
  worksheet['!cols'] = [
    { wch: 20 }, // Label
    { wch: 50 }, // Value
  ];

  return worksheet;
}
