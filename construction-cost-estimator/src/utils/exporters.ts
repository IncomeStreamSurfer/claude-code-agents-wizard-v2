import type { Project, CostItem, AnnotationData } from '../types';
import { exportCostItemsAsCSV, exportAnnotationsAsCSV, exportCostSummaryAsCSV } from './csvExporter';
import { exportCostEstimateAsPDF, exportProjectAsPDF } from './pdfExporter';
import { exportCostEstimateAsExcel, exportFullProjectAsExcel } from './excelExporter';

/**
 * Main Export Utilities
 * Provides high-level export functions for all data types and formats
 */

// ========== JSON Export Functions ==========

/**
 * Exports project data as JSON string
 */
export function exportProjectAsJSON(
  project: Project,
  options: {
    includeMetadata?: boolean;
    prettyPrint?: boolean;
  } = {}
): string {
  const { includeMetadata = true, prettyPrint = true } = options;

  const data: any = {
    project: {
      id: project.id,
      name: project.name,
      description: project.description,
      pdfFileName: project.pdfFileName,
      pdfFileSize: project.pdfFileSize,
      totalPages: project.totalPages,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    },
  };

  if (includeMetadata) {
    data.export = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      format: 'json',
    };
  }

  return prettyPrint ? JSON.stringify(data, null, 2) : JSON.stringify(data);
}

/**
 * Exports cost items as JSON string
 */
export function exportCostEstimateAsJSON(
  costItems: CostItem[],
  options: {
    includeMetadata?: boolean;
    prettyPrint?: boolean;
    markup?: number;
  } = {}
): string {
  const { includeMetadata = true, prettyPrint = true, markup = 0 } = options;

  const subtotal = costItems.reduce((sum, item) => sum + item.totalCost, 0);
  const markupAmount = subtotal * (markup / 100);
  const total = subtotal + markupAmount;

  const data: any = {
    costItems: costItems.map(item => ({
      id: item.id,
      description: item.description,
      quantity: item.quantity,
      unit: item.unit,
      unitCost: item.unitCost,
      totalCost: item.totalCost,
      category: item.category,
      pageNumber: item.pageNumber,
      notes: item.notes,
      createdAt: item.createdAt,
    })),
    summary: {
      itemCount: costItems.length,
      subtotal,
      markup: markup > 0 ? { percentage: markup, amount: markupAmount } : null,
      total,
    },
  };

  if (includeMetadata) {
    data.export = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      format: 'json',
    };
  }

  return prettyPrint ? JSON.stringify(data, null, 2) : JSON.stringify(data);
}

/**
 * Exports annotations as JSON string
 */
export function exportAnnotationsAsJSON(
  annotations: AnnotationData[],
  options: {
    includeMetadata?: boolean;
    prettyPrint?: boolean;
  } = {}
): string {
  const { includeMetadata = true, prettyPrint = true } = options;

  const data: any = {
    annotations: annotations.map(annotation => ({
      id: annotation.id,
      type: annotation.type,
      pageNumber: annotation.pageNumber,
      x: annotation.x,
      y: annotation.y,
      width: annotation.width,
      height: annotation.height,
      color: annotation.color,
      labelId: annotation.labelId,
      text: annotation.text,
      notes: annotation.notes,
      quantity: annotation.quantity,
      unit: annotation.unit,
      points: annotation.points,
      lineLength: annotation.lineLength,
      polygonArea: annotation.polygonArea,
      createdAt: annotation.createdAt,
    })),
  };

  if (includeMetadata) {
    data.export = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      format: 'json',
      annotationCount: annotations.length,
    };
  }

  return prettyPrint ? JSON.stringify(data, null, 2) : JSON.stringify(data);
}

/**
 * Exports annotations as GeoJSON (for mapping tools)
 */
export function exportAnnotationsAsGeoJSON(annotations: AnnotationData[]): string {
  const features = annotations.map(annotation => ({
    type: 'Feature',
    properties: {
      id: annotation.id,
      type: annotation.type,
      pageNumber: annotation.pageNumber,
      color: annotation.color,
      labelId: annotation.labelId,
      text: annotation.text,
      notes: annotation.notes,
      quantity: annotation.quantity,
      unit: annotation.unit,
    },
    geometry: annotation.points
      ? {
          type: annotation.type === 'polygon' ? 'Polygon' : 'LineString',
          coordinates: annotation.points.map(p => [p.x, p.y]),
        }
      : {
          type: 'Point',
          coordinates: [annotation.x, annotation.y],
        },
  }));

  const geoJSON = {
    type: 'FeatureCollection',
    features,
  };

  return JSON.stringify(geoJSON, null, 2);
}

// ========== CSV Export Functions ==========

/**
 * Exports project metadata as CSV
 */
export function exportProjectAsCSV(project: Project): string {
  const lines = [
    'Field,Value',
    `Name,"${project.name}"`,
    `Description,"${project.description || ''}"`,
    `PDF File,"${project.pdfFileName}"`,
    `File Size (MB),${(project.pdfFileSize / 1024 / 1024).toFixed(2)}`,
    `Total Pages,${project.totalPages}`,
    `Created Date,${project.createdAt instanceof Date ? project.createdAt.toISOString().split('T')[0] : new Date(project.createdAt).toISOString().split('T')[0]}`,
    `Updated Date,${project.updatedAt instanceof Date ? project.updatedAt.toISOString().split('T')[0] : new Date(project.updatedAt).toISOString().split('T')[0]}`,
  ];

  return lines.join('\n');
}

/**
 * Re-export CSV functions from csvExporter
 */
export { exportCostItemsAsCSV, exportAnnotationsAsCSV, exportCostSummaryAsCSV };

// ========== PDF Export Functions ==========

/**
 * Re-export PDF functions from pdfExporter
 */
export { exportCostEstimateAsPDF, exportProjectAsPDF };

// ========== Excel Export Functions ==========

/**
 * Re-export Excel functions from excelExporter
 */
export { exportCostEstimateAsExcel, exportFullProjectAsExcel };

// ========== Batch Export Functions ==========

/**
 * Exports complete project data as a single JSON file
 */
export function exportFullProject(
  project: Project,
  costItems: CostItem[],
  annotations: AnnotationData[],
  calibrationData?: any,
  options: {
    includeCalibration?: boolean;
    includeAnnotations?: boolean;
    includeCostItems?: boolean;
    markup?: number;
  } = {}
): string {
  const {
    includeCalibration = true,
    includeAnnotations = true,
    includeCostItems = true,
    markup = 0,
  } = options;

  const subtotal = costItems.reduce((sum, item) => sum + item.totalCost, 0);
  const markupAmount = subtotal * (markup / 100);
  const total = subtotal + markupAmount;

  const data: any = {
    export: {
      version: '1.0',
      exportDate: new Date().toISOString(),
      format: 'json',
    },
    project: {
      id: project.id,
      name: project.name,
      description: project.description,
      pdfFileName: project.pdfFileName,
      pdfFileSize: project.pdfFileSize,
      totalPages: project.totalPages,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    },
  };

  if (includeCalibration && calibrationData) {
    data.calibration = calibrationData;
  }

  if (includeAnnotations) {
    data.annotations = annotations;
  }

  if (includeCostItems) {
    data.costItems = costItems;
    data.summary = {
      itemCount: costItems.length,
      subtotal,
      markup: markup > 0 ? { percentage: markup, amount: markupAmount } : null,
      total,
    };
  }

  return JSON.stringify(data, null, 2);
}

// ========== Utility Functions ==========

/**
 * Downloads a blob to the user's computer
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Downloads text content as a file
 */
export function downloadText(text: string, filename: string, mimeType: string = 'text/plain'): void {
  const blob = new Blob([text], { type: mimeType });
  downloadBlob(blob, filename);
}

/**
 * Formats currency for CSV (removes currency symbols)
 */
export function formatCurrencyForCSV(amount: number): string {
  return amount.toFixed(2);
}

/**
 * Generates a standardized report header
 */
export function generateReportHeader(title: string, date: Date = new Date()): string {
  return `${title}\nGenerated: ${date.toLocaleString()}`;
}

/**
 * Estimates file size for a given export format
 */
export function estimateExportSize(
  itemCount: number,
  format: 'json' | 'csv' | 'pdf' | 'excel'
): string {
  let bytesPerItem: number;

  switch (format) {
    case 'json':
      bytesPerItem = 500; // Approximate JSON size per item
      break;
    case 'csv':
      bytesPerItem = 200; // CSV is more compact
      break;
    case 'pdf':
      bytesPerItem = 1000; // PDF includes formatting
      break;
    case 'excel':
      bytesPerItem = 300; // Excel is somewhat compact
      break;
    default:
      bytesPerItem = 500;
  }

  const estimatedBytes = itemCount * bytesPerItem;

  if (estimatedBytes < 1024) {
    return `${estimatedBytes} B`;
  } else if (estimatedBytes < 1024 * 1024) {
    return `${(estimatedBytes / 1024).toFixed(1)} KB`;
  } else {
    return `${(estimatedBytes / 1024 / 1024).toFixed(1)} MB`;
  }
}

/**
 * Validates export data before processing
 */
export function validateExportData(
  data: Project | CostItem[] | AnnotationData[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data) {
    errors.push('No data provided for export');
    return { valid: false, errors };
  }

  if (Array.isArray(data) && data.length === 0) {
    errors.push('Empty array provided for export');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Sanitizes filename for safe downloads
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-z0-9_\-\.]/gi, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_+|_+$/g, '');
}

/**
 * Generates a filename with timestamp
 */
export function generateFilename(
  prefix: string,
  extension: string,
  includeTimestamp: boolean = true
): string {
  const sanitized = sanitizeFilename(prefix);
  const timestamp = includeTimestamp
    ? `_${new Date().toISOString().split('T')[0]}`
    : '';
  return `${sanitized}${timestamp}.${extension}`;
}
