import type { AnnotationData, LabelDefinition, CalibrationData } from '../types/store';
import type { CostItem } from '../types';

/**
 * Result of quantity calculation for an annotation
 */
export interface QuantityResult {
  quantity: number;
  unit: string;
  rawValue?: number; // Value before conversion (e.g., pixels)
}

/**
 * Cost calculation result for a single annotation
 */
export interface AnnotationCostResult extends CostItem {
  annotation: AnnotationData;
}

/**
 * Category totals for cost aggregation
 */
export interface CategoryTotals {
  quantity: number;
  cost: number;
  count: number; // Number of items in category
  percentage?: number; // Percentage of total cost
}

/**
 * Calculate quantity from an annotation based on its type and calibration
 *
 * @param annotation - The annotation to measure
 * @param calibrationData - Calibration data for unit conversion
 * @returns Object with quantity and unit
 */
export function calculateAnnotationQuantity(
  annotation: AnnotationData,
  calibrationData: CalibrationData
): QuantityResult {
  const { metersPerPixel, isCalibrated } = calibrationData;

  // Point markers - always count as 1
  if (annotation.type === 'marker' || annotation.type === 'label') {
    return {
      quantity: 1,
      unit: 'count',
      rawValue: 1,
    };
  }

  // Line measurements
  if (annotation.type === 'line' && annotation.lineLength) {
    if (isCalibrated) {
      return {
        quantity: annotation.lineLength * metersPerPixel,
        unit: 'linear_meters',
        rawValue: annotation.lineLength,
      };
    }
    return {
      quantity: annotation.lineLength,
      unit: 'pixels',
      rawValue: annotation.lineLength,
    };
  }

  // Polygon areas
  if (annotation.type === 'polygon' && annotation.polygonArea) {
    if (isCalibrated) {
      return {
        quantity: annotation.polygonArea * (metersPerPixel ** 2),
        unit: 'square_meters',
        rawValue: annotation.polygonArea,
      };
    }
    return {
      quantity: annotation.polygonArea,
      unit: 'pixels²',
      rawValue: annotation.polygonArea,
    };
  }

  // Rectangle areas
  if (annotation.type === 'rectangle' && annotation.width && annotation.height) {
    const areaPixels = annotation.width * annotation.height;
    if (isCalibrated) {
      return {
        quantity: areaPixels * (metersPerPixel ** 2),
        unit: 'square_meters',
        rawValue: areaPixels,
      };
    }
    return {
      quantity: areaPixels,
      unit: 'pixels²',
      rawValue: areaPixels,
    };
  }

  // Default: count as 1
  return {
    quantity: 1,
    unit: 'count',
    rawValue: 1,
  };
}

/**
 * Calculate cost for a single annotation with its associated label
 *
 * @param annotation - The annotation to calculate cost for
 * @param calibrationData - Calibration data for unit conversion
 * @param label - The label definition with cost information
 * @returns Complete cost item or null if label not found
 */
export function calculateAnnotationCost(
  annotation: AnnotationData,
  calibrationData: CalibrationData,
  label: LabelDefinition
): AnnotationCostResult | null {
  if (!label) {
    return null;
  }

  // Calculate quantity
  const { quantity, unit } = calculateAnnotationQuantity(annotation, calibrationData);

  // Get unit cost from label
  const unitCost = label.costPerUnit || 0;

  // Calculate total cost
  const totalCost = quantity * unitCost;

  // Create cost item
  const costItem: AnnotationCostResult = {
    id: `cost-${annotation.id}`,
    description: label.name,
    quantity: Math.round(quantity * 100) / 100, // Round to 2 decimals
    unit: getDisplayUnit(unit),
    unitCost,
    totalCost: Math.round(totalCost * 100) / 100,
    category: label.category,
    labelId: label.id,
    annotationId: annotation.id,
    pageNumber: annotation.pageNumber,
    notes: annotation.notes,
    createdAt: annotation.createdAt,
    updatedAt: annotation.updatedAt,
    annotation,
  };

  return costItem;
}

/**
 * Aggregate all annotations into cost items
 * Groups by label and sums quantities
 *
 * @param annotations - All annotations to aggregate
 * @param calibrationData - Calibration data for unit conversion
 * @param labels - Available label definitions
 * @returns Array of aggregated cost items
 */
export function aggregateAnnotationsToCosts(
  annotations: AnnotationData[],
  calibrationData: CalibrationData,
  labels: LabelDefinition[]
): CostItem[] {
  // Create label lookup map
  const labelMap = new Map(labels.map(label => [label.id, label]));

  // Group annotations by label
  const annotationsByLabel = new Map<string, AnnotationData[]>();

  annotations.forEach(annotation => {
    if (annotation.labelId) {
      if (!annotationsByLabel.has(annotation.labelId)) {
        annotationsByLabel.set(annotation.labelId, []);
      }
      annotationsByLabel.get(annotation.labelId)!.push(annotation);
    }
  });

  // Calculate cost items for each label group
  const costItems: CostItem[] = [];

  annotationsByLabel.forEach((annots, labelId) => {
    const label = labelMap.get(labelId);
    if (!label) return;

    // Calculate total quantity for this label
    let totalQuantity = 0;
    let unit = 'count';

    annots.forEach(annotation => {
      const result = calculateAnnotationQuantity(annotation, calibrationData);
      totalQuantity += result.quantity;
      unit = result.unit;
    });

    // Get unit cost
    const unitCost = label.costPerUnit || 0;

    // Calculate total cost
    const totalCost = totalQuantity * unitCost;

    // Create aggregated cost item
    const costItem: CostItem = {
      id: `cost-${labelId}`,
      description: label.name,
      quantity: Math.round(totalQuantity * 100) / 100,
      unit: getDisplayUnit(unit),
      unitCost,
      totalCost: Math.round(totalCost * 100) / 100,
      category: label.category,
      labelId: label.id,
      pageNumber: annots[0]?.pageNumber || 1,
      notes: `Aggregated from ${annots.length} annotation(s)`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    costItems.push(costItem);
  });

  return costItems;
}

/**
 * Group cost items by category
 *
 * @param costItems - Cost items to group
 * @returns Object with category as key and array of cost items as value
 */
export function groupCostsByCategory(
  costItems: CostItem[]
): Record<string, CostItem[]> {
  const grouped: Record<string, CostItem[]> = {};

  costItems.forEach(item => {
    const category = item.category || 'Uncategorized';
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(item);
  });

  return grouped;
}

/**
 * Calculate totals by category
 *
 * @param costItems - Cost items to calculate
 * @returns Object with category totals including quantity, cost, and count
 */
export function calculateCategoryTotals(
  costItems: CostItem[]
): Record<string, CategoryTotals> {
  const totals: Record<string, CategoryTotals> = {};
  const grandTotal = calculateGrandTotal(costItems);

  costItems.forEach(item => {
    const category = item.category || 'Uncategorized';

    if (!totals[category]) {
      totals[category] = {
        quantity: 0,
        cost: 0,
        count: 0,
      };
    }

    totals[category].quantity += item.quantity;
    totals[category].cost += item.totalCost;
    totals[category].count += 1;
  });

  // Calculate percentages
  Object.keys(totals).forEach(category => {
    totals[category].percentage = grandTotal > 0
      ? (totals[category].cost / grandTotal) * 100
      : 0;
  });

  return totals;
}

/**
 * Calculate grand total of all cost items
 *
 * @param costItems - Cost items to sum
 * @returns Total cost
 */
export function calculateGrandTotal(costItems: CostItem[]): number {
  return costItems.reduce((sum, item) => sum + item.totalCost, 0);
}

/**
 * Format currency value with proper formatting
 *
 * @param amount - Amount to format
 * @param currency - Currency code (default: USD)
 * @param locale - Locale for formatting (default: en-US)
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Calculate cost with markup percentage
 *
 * @param baseCost - Base cost before markup
 * @param markupPercent - Markup percentage (0-100)
 * @returns Cost with markup applied
 */
export function calculateWithMarkup(
  baseCost: number,
  markupPercent: number
): number {
  if (markupPercent < 0 || markupPercent > 100) {
    console.warn('Markup percent should be between 0 and 100');
    markupPercent = Math.max(0, Math.min(100, markupPercent));
  }

  return baseCost * (1 + markupPercent / 100);
}

/**
 * Get display-friendly unit name
 *
 * @param unit - Unit type
 * @returns Display name
 */
function getDisplayUnit(unit: string): string {
  switch (unit) {
    case 'count':
      return 'ea';
    case 'linear_meters':
      return 'm';
    case 'square_meters':
      return 'm²';
    case 'pixels':
      return 'px';
    case 'pixels²':
      return 'px²';
    default:
      return unit;
  }
}

/**
 * Export cost items to JSON format
 *
 * @param costItems - Cost items to export
 * @returns JSON string
 */
export function exportCostsToJSON(costItems: CostItem[]): string {
  return JSON.stringify(costItems, null, 2);
}

/**
 * Export cost items to CSV format
 *
 * @param costItems - Cost items to export
 * @returns CSV string
 */
export function exportCostsToCSV(costItems: CostItem[]): string {
  const headers = [
    'Description',
    'Quantity',
    'Unit',
    'Unit Cost',
    'Total Cost',
    'Category',
    'Page Number',
    'Notes'
  ];

  const rows = costItems.map(item => [
    item.description,
    item.quantity.toString(),
    item.unit,
    item.unitCost.toString(),
    item.totalCost.toString(),
    item.category || '',
    item.pageNumber.toString(),
    item.notes || ''
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  return csvContent;
}

/**
 * Validate cost calculation inputs
 *
 * @param calibrationData - Calibration data to validate
 * @returns Array of error messages, empty if valid
 */
export function validateCostCalculation(
  calibrationData: CalibrationData
): string[] {
  const errors: string[] = [];

  if (!calibrationData.isCalibrated) {
    errors.push('Calibration is required for accurate cost calculations');
  }

  if (calibrationData.metersPerPixel <= 0) {
    errors.push('Invalid calibration: meters per pixel must be greater than 0');
  }

  if (!Number.isFinite(calibrationData.metersPerPixel)) {
    errors.push('Invalid calibration: meters per pixel must be a valid number');
  }

  return errors;
}

/**
 * Round to specified decimal places
 *
 * @param value - Value to round
 * @param decimals - Number of decimal places
 * @returns Rounded value
 */
export function roundTo(value: number, decimals: number = 2): number {
  const multiplier = Math.pow(10, decimals);
  return Math.round(value * multiplier) / multiplier;
}
