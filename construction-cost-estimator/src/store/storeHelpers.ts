import type { AnnotationData, LabelDefinition } from '../types/store';
import type { CostItem } from '../types';

/**
 * Calculate the quantity for an annotation based on its type and calibration
 *
 * @param annotation - The annotation to calculate quantity for
 * @param metersPerPixel - Calibration factor for pixel-to-meter conversion
 * @returns The calculated quantity in appropriate units
 */
export function calculateQuantity(
  annotation: AnnotationData,
  metersPerPixel: number
): number {
  // If already has a computed quantity, use it
  if (annotation.quantity !== undefined) {
    return annotation.quantity;
  }

  // Determine unit type from annotation or default
  const unit = annotation.unit || 'count';

  switch (unit) {
    case 'count':
      // For markers, rectangles, highlights - count as 1
      return 1;

    case 'linear_meters':
      // For line annotations, convert pixel length to meters
      if (annotation.lineLength) {
        return annotation.lineLength * metersPerPixel;
      }
      // For rectangles, use perimeter
      if (annotation.width && annotation.height) {
        const perimeterPixels = 2 * (annotation.width + annotation.height);
        return perimeterPixels * metersPerPixel;
      }
      return 0;

    case 'square_meters':
      // For polygon annotations, convert pixel area to square meters
      if (annotation.polygonArea) {
        return annotation.polygonArea * (metersPerPixel ** 2);
      }
      // For rectangles, convert area
      if (annotation.width && annotation.height) {
        const areaPixels = annotation.width * annotation.height;
        return areaPixels * (metersPerPixel ** 2);
      }
      return 0;

    default:
      return 1;
  }
}

/**
 * Calculate polygon area from points using the Shoelace formula
 *
 * @param points - Array of {x, y} coordinates
 * @returns Area in square pixels
 */
export function calculatePolygonArea(points: { x: number; y: number }[]): number {
  if (points.length < 3) return 0;

  let area = 0;
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    area += points[i].x * points[j].y;
    area -= points[j].x * points[i].y;
  }

  return Math.abs(area / 2);
}

/**
 * Calculate line length from points
 *
 * @param points - Array of {x, y} coordinates
 * @returns Total length in pixels
 */
export function calculateLineLength(points: { x: number; y: number }[]): number {
  if (points.length < 2) return 0;

  let length = 0;
  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i - 1].x;
    const dy = points[i].y - points[i - 1].y;
    length += Math.sqrt(dx * dx + dy * dy);
  }

  return length;
}

/**
 * Aggregate annotations into cost items
 *
 * @param annotations - All annotations across all pages
 * @param labels - Label definitions with cost information
 * @param metersPerPixel - Calibration factor
 * @returns Array of cost items
 */
export function aggregateCostItems(
  annotations: AnnotationData[],
  labels: LabelDefinition[],
  metersPerPixel: number
): CostItem[] {
  const costItems: CostItem[] = [];

  // Create a map of labels for quick lookup
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

  // Create cost items for each label group
  annotationsByLabel.forEach((annots, labelId) => {
    const label = labelMap.get(labelId);
    if (!label) return;

    // Calculate total quantity for this label
    const totalQuantity = annots.reduce((sum, annotation) => {
      return sum + calculateQuantity(annotation, metersPerPixel);
    }, 0);

    // Get unit cost (use label's cost or default to 0)
    const unitCost = label.costPerUnit || 0;

    // Create cost item
    const costItem: CostItem = {
      id: `cost-${labelId}`,
      description: label.name,
      quantity: Math.round(totalQuantity * 100) / 100, // Round to 2 decimals
      unit: getUnitDisplayName(label.unit),
      unitCost,
      totalCost: Math.round(totalQuantity * unitCost * 100) / 100,
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
 * Get display name for unit type
 */
function getUnitDisplayName(unit: 'count' | 'linear_meters' | 'square_meters'): string {
  switch (unit) {
    case 'count':
      return 'ea';
    case 'linear_meters':
      return 'm';
    case 'square_meters':
      return 'm²';
    default:
      return unit;
  }
}

/**
 * Calculate total cost from all cost items
 *
 * @param costItems - Array of cost items
 * @returns Total cost sum
 */
export function getTotalCost(costItems: CostItem[]): number {
  return costItems.reduce((sum, item) => sum + item.totalCost, 0);
}

/**
 * Group cost by category
 *
 * @param costItems - Array of cost items
 * @returns Object with category names as keys and total costs as values
 */
export function getCostByCategory(costItems: CostItem[]): Record<string, number> {
  const categoryTotals: Record<string, number> = {};

  costItems.forEach(item => {
    const category = item.category || 'Uncategorized';
    categoryTotals[category] = (categoryTotals[category] || 0) + item.totalCost;
  });

  return categoryTotals;
}

/**
 * Validate calibration data
 *
 * @param referenceLength - Reference length in meters
 * @param pixelDistance - Pixel distance
 * @returns Error message if invalid, null if valid
 */
export function validateCalibration(
  referenceLength: number,
  pixelDistance: number
): string | null {
  if (referenceLength <= 0) {
    return 'Reference length must be greater than 0';
  }

  if (pixelDistance <= 0) {
    return 'Pixel distance must be greater than 0';
  }

  if (!Number.isFinite(referenceLength)) {
    return 'Reference length must be a valid number';
  }

  if (!Number.isFinite(pixelDistance)) {
    return 'Pixel distance must be a valid number';
  }

  return null;
}

/**
 * Generate a unique annotation ID
 */
export function generateAnnotationId(): string {
  return `annotation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Generate a unique label ID
 */
export function generateLabelId(): string {
  return `label-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Generate a unique cost item ID
 */
export function generateCostItemId(): string {
  return `cost-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
