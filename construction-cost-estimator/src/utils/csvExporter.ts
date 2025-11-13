import type { CostItem, AnnotationData } from '../types';

/**
 * CSV Export Utilities
 * Provides functions for exporting cost items and annotations to CSV format
 */

/**
 * Escapes special CSV characters (quotes, commas, newlines)
 */
function escapeCSVValue(value: string | number | undefined): string {
  if (value === undefined || value === null) {
    return '';
  }

  const stringValue = String(value);

  // If the value contains quotes, commas, or newlines, wrap it in quotes
  if (stringValue.includes('"') || stringValue.includes(',') || stringValue.includes('\n')) {
    // Escape internal quotes by doubling them
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

/**
 * Formats currency for CSV (removes currency symbols for Excel compatibility)
 */
export function formatCurrencyForCSV(amount: number): string {
  return amount.toFixed(2);
}

/**
 * Formats date for CSV
 */
function formatDateForCSV(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toISOString().split('T')[0]; // YYYY-MM-DD
}

/**
 * Exports cost items to CSV format
 */
export function exportCostItemsAsCSV(
  costItems: CostItem[],
  options: {
    includeHeaders?: boolean;
    includeMetadata?: boolean;
    groupByCategory?: boolean;
    includeSubtotals?: boolean;
    markup?: number;
  } = {}
): string {
  const {
    includeHeaders = true,
    includeMetadata = true,
    groupByCategory = true,
    includeSubtotals = true,
    markup = 0,
  } = options;

  const lines: string[] = [];

  // Add metadata header
  if (includeMetadata) {
    lines.push(`# Cost Estimate Export`);
    lines.push(`# Generated: ${new Date().toISOString()}`);
    lines.push(`# Total Items: ${costItems.length}`);
    lines.push('');
  }

  // Add column headers
  if (includeHeaders) {
    lines.push([
      'Description',
      'Quantity',
      'Unit',
      'Unit Cost',
      'Total Cost',
      'Category',
      'Page',
      'Notes',
      'Created Date',
    ].map(escapeCSVValue).join(','));
  }

  if (groupByCategory) {
    // Group items by category
    const categorized = costItems.reduce((acc, item) => {
      const category = item.category || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    }, {} as Record<string, CostItem[]>);

    // Export each category
    Object.entries(categorized).forEach(([category, items]) => {
      // Category header
      lines.push('');
      lines.push(`"${category}"`);

      // Items in this category
      items.forEach(item => {
        lines.push([
          escapeCSVValue(item.description),
          escapeCSVValue(item.quantity),
          escapeCSVValue(item.unit),
          formatCurrencyForCSV(item.unitCost),
          formatCurrencyForCSV(item.totalCost),
          escapeCSVValue(item.category || ''),
          escapeCSVValue(item.pageNumber),
          escapeCSVValue(item.notes || ''),
          formatDateForCSV(item.createdAt),
        ].join(','));
      });

      // Category subtotal
      if (includeSubtotals) {
        const categoryTotal = items.reduce((sum, item) => sum + item.totalCost, 0);
        lines.push([
          `"${category} Subtotal"`,
          '',
          '',
          '',
          formatCurrencyForCSV(categoryTotal),
          '',
          '',
          '',
          '',
        ].join(','));
      }
    });
  } else {
    // Export without grouping
    costItems.forEach(item => {
      lines.push([
        escapeCSVValue(item.description),
        escapeCSVValue(item.quantity),
        escapeCSVValue(item.unit),
        formatCurrencyForCSV(item.unitCost),
        formatCurrencyForCSV(item.totalCost),
        escapeCSVValue(item.category || ''),
        escapeCSVValue(item.pageNumber),
        escapeCSVValue(item.notes || ''),
        formatDateForCSV(item.createdAt),
      ].join(','));
    });
  }

  // Add total summary
  lines.push('');
  const subtotal = costItems.reduce((sum, item) => sum + item.totalCost, 0);
  lines.push(['SUBTOTAL', '', '', '', formatCurrencyForCSV(subtotal), '', '', '', ''].join(','));

  if (markup > 0) {
    const markupAmount = subtotal * (markup / 100);
    lines.push([`Markup (${markup}%)`, '', '', '', formatCurrencyForCSV(markupAmount), '', '', '', ''].join(','));
    const total = subtotal + markupAmount;
    lines.push(['TOTAL', '', '', '', formatCurrencyForCSV(total), '', '', '', ''].join(','));
  } else {
    lines.push(['TOTAL', '', '', '', formatCurrencyForCSV(subtotal), '', '', '', ''].join(','));
  }

  return lines.join('\n');
}

/**
 * Exports annotations to CSV format
 */
export function exportAnnotationsAsCSV(annotations: AnnotationData[]): string {
  const lines: string[] = [];

  // Add metadata header
  lines.push('# Annotations Export');
  lines.push(`# Generated: ${new Date().toISOString()}`);
  lines.push(`# Total Annotations: ${annotations.length}`);
  lines.push('');

  // Column headers
  lines.push([
    'ID',
    'Type',
    'Page',
    'X',
    'Y',
    'Width',
    'Height',
    'Color',
    'Label',
    'Text',
    'Notes',
    'Quantity',
    'Unit',
    'Created Date',
  ].map(escapeCSVValue).join(','));

  // Data rows
  annotations.forEach(annotation => {
    lines.push([
      escapeCSVValue(annotation.id),
      escapeCSVValue(annotation.type),
      escapeCSVValue(annotation.pageNumber),
      escapeCSVValue(annotation.x.toFixed(4)),
      escapeCSVValue(annotation.y.toFixed(4)),
      escapeCSVValue(annotation.width.toFixed(4)),
      escapeCSVValue(annotation.height.toFixed(4)),
      escapeCSVValue(annotation.color),
      escapeCSVValue(annotation.labelId || ''),
      escapeCSVValue(annotation.text || ''),
      escapeCSVValue(annotation.notes || ''),
      escapeCSVValue(annotation.quantity || ''),
      escapeCSVValue(annotation.unit || ''),
      formatDateForCSV(annotation.createdAt),
    ].join(','));
  });

  return lines.join('\n');
}

/**
 * Exports a simple cost summary (for quick reports)
 */
export function exportCostSummaryAsCSV(
  costsByCategory: Record<string, number>,
  totalCost: number,
  markup?: number
): string {
  const lines: string[] = [];

  // Header
  lines.push('Category,Amount');

  // Categories
  Object.entries(costsByCategory).forEach(([category, amount]) => {
    lines.push(`${escapeCSVValue(category)},${formatCurrencyForCSV(amount)}`);
  });

  // Totals
  lines.push('');
  lines.push(`Subtotal,${formatCurrencyForCSV(totalCost)}`);

  if (markup && markup > 0) {
    const markupAmount = totalCost * (markup / 100);
    lines.push(`Markup (${markup}%),${formatCurrencyForCSV(markupAmount)}`);
    lines.push(`Total,${formatCurrencyForCSV(totalCost + markupAmount)}`);
  } else {
    lines.push(`Total,${formatCurrencyForCSV(totalCost)}`);
  }

  return lines.join('\n');
}
