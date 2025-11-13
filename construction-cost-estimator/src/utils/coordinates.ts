/**
 * Coordinate Normalization System
 *
 * This module provides utilities for converting between canvas pixel coordinates
 * and normalized coordinates (0-1 range). Normalized coordinates ensure annotations
 * render correctly at different zoom levels and canvas sizes.
 *
 * Coordinate Space:
 * - Normalized: x, y in range [0, 1] where (0,0) is top-left, (1,1) is bottom-right
 * - Canvas: x, y in pixels relative to canvas dimensions
 */

import type { AnnotationData } from '../types/store';

/**
 * Point interface for coordinate operations
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * Bounding box interface
 */
export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Convert absolute canvas coordinates to normalized coordinates (0-1 range)
 *
 * @param canvasX - X coordinate in canvas pixels
 * @param canvasY - Y coordinate in canvas pixels
 * @param canvasWidth - Canvas width in pixels
 * @param canvasHeight - Canvas height in pixels
 * @returns Normalized coordinates {x, y} in range [0, 1]
 *
 * @example
 * // Click at center of 800x600 canvas
 * const normalized = toNormalizedCoordinates(400, 300, 800, 600);
 * // Result: { x: 0.5, y: 0.5 }
 */
export function toNormalizedCoordinates(
  canvasX: number,
  canvasY: number,
  canvasWidth: number,
  canvasHeight: number
): Point {
  // Handle zero dimensions to prevent division by zero
  if (canvasWidth === 0 || canvasHeight === 0) {
    console.warn('Canvas dimensions are zero, returning (0, 0)');
    return { x: 0, y: 0 };
  }

  const x = canvasX / canvasWidth;
  const y = canvasY / canvasHeight;

  // Validate range [0, 1] with small tolerance for floating point
  if (x < -0.001 || x > 1.001 || y < -0.001 || y > 1.001) {
    console.warn(
      `Coordinates out of normalized range: (${x.toFixed(3)}, ${y.toFixed(3)}). ` +
      `Canvas: (${canvasX}, ${canvasY}), Dimensions: ${canvasWidth}x${canvasHeight}`
    );
  }

  // Clamp to valid range
  return {
    x: Math.max(0, Math.min(1, x)),
    y: Math.max(0, Math.min(1, y)),
  };
}

/**
 * Convert normalized coordinates (0-1 range) back to canvas pixel coordinates
 *
 * @param normalizedX - Normalized X coordinate [0, 1]
 * @param normalizedY - Normalized Y coordinate [0, 1]
 * @param canvasWidth - Canvas width in pixels
 * @param canvasHeight - Canvas height in pixels
 * @returns Canvas coordinates {x, y} in pixels
 *
 * @example
 * // Render marker at normalized center on 1200x900 canvas
 * const canvas = toCanvasCoordinates(0.5, 0.5, 1200, 900);
 * // Result: { x: 600, y: 450 }
 */
export function toCanvasCoordinates(
  normalizedX: number,
  normalizedY: number,
  canvasWidth: number,
  canvasHeight: number
): Point {
  // Handle zero dimensions
  if (canvasWidth === 0 || canvasHeight === 0) {
    console.warn('Canvas dimensions are zero, returning (0, 0)');
    return { x: 0, y: 0 };
  }

  // Validate normalized coordinates
  if (normalizedX < 0 || normalizedX > 1 || normalizedY < 0 || normalizedY > 1) {
    console.warn(
      `Normalized coordinates out of range [0, 1]: (${normalizedX.toFixed(3)}, ${normalizedY.toFixed(3)})`
    );
  }

  return {
    x: normalizedX * canvasWidth,
    y: normalizedY * canvasHeight,
  };
}

/**
 * Convert canvas pixel distance to normalized distance (0-1 range)
 *
 * Uses canvas width as the reference dimension for consistency.
 *
 * @param pixelDistance - Distance in canvas pixels
 * @param canvasWidth - Canvas width in pixels (reference dimension)
 * @returns Normalized distance in range [0, 1]
 *
 * @example
 * // Line measured at 100 pixels on 800px wide canvas
 * const normalized = normalizeDistance(100, 800);
 * // Result: 0.125
 */
export function normalizeDistance(
  pixelDistance: number,
  canvasWidth: number
): number {
  if (canvasWidth === 0) {
    console.warn('Canvas width is zero, returning 0');
    return 0;
  }

  return pixelDistance / canvasWidth;
}

/**
 * Convert normalized distance back to canvas pixel distance
 *
 * @param normalizedDistance - Normalized distance [0, 1]
 * @param canvasWidth - Canvas width in pixels (reference dimension)
 * @returns Distance in canvas pixels
 *
 * @example
 * // Render line of 0.125 normalized length on 1200px wide canvas
 * const pixels = denormalizeDistance(0.125, 1200);
 * // Result: 150
 */
export function denormalizeDistance(
  normalizedDistance: number,
  canvasWidth: number
): number {
  if (canvasWidth === 0) {
    console.warn('Canvas width is zero, returning 0');
    return 0;
  }

  return normalizedDistance * canvasWidth;
}

/**
 * Scale annotation for rendering at different zoom level
 *
 * Note: This creates a display copy with adjusted visual properties.
 * The original annotation data remains in normalized coordinates.
 *
 * @param annotation - Annotation in normalized coordinates
 * @param zoom - Zoom level (1.0 = 100%, 2.0 = 200%, etc.)
 * @returns Scaled annotation for rendering
 *
 * @example
 * // Zoom to 150%
 * const scaled = scaleAnnotationForZoom(annotation, 1.5);
 * // Coordinates stay same, visual scale increases
 */
export function scaleAnnotationForZoom(
  annotation: AnnotationData,
  zoom: number
): AnnotationData {
  // Normalized coordinates don't change with zoom
  // Only visual properties might scale (like stroke width, font size)
  // This is handled by CSS transforms on the canvas/stage level

  return {
    ...annotation,
    // Could add zoom-specific rendering hints here if needed
    // For now, the Konva stage handles zoom via CSS transform
  };
}

/**
 * Normalize an array of points (for lines, polygons)
 *
 * @param points - Array of points in canvas pixel coordinates
 * @param canvasWidth - Canvas width in pixels
 * @param canvasHeight - Canvas height in pixels
 * @returns Array of normalized points
 *
 * @example
 * // Triangle vertices in pixels
 * const pixels = [
 *   { x: 400, y: 100 },
 *   { x: 200, y: 500 },
 *   { x: 600, y: 500 }
 * ];
 * const normalized = normalizePoints(pixels, 800, 600);
 * // Result: [{ x: 0.5, y: 0.167 }, { x: 0.25, y: 0.833 }, { x: 0.75, y: 0.833 }]
 */
export function normalizePoints(
  points: Point[],
  canvasWidth: number,
  canvasHeight: number
): Point[] {
  if (canvasWidth === 0 || canvasHeight === 0) {
    console.warn('Canvas dimensions are zero, returning empty array');
    return [];
  }

  return points.map((point) =>
    toNormalizedCoordinates(point.x, point.y, canvasWidth, canvasHeight)
  );
}

/**
 * Denormalize an array of points (for rendering lines, polygons)
 *
 * @param points - Array of normalized points [0, 1]
 * @param canvasWidth - Canvas width in pixels
 * @param canvasHeight - Canvas height in pixels
 * @returns Array of canvas pixel points
 *
 * @example
 * // Render normalized triangle on 1200x900 canvas
 * const normalized = [{ x: 0.5, y: 0.167 }, { x: 0.25, y: 0.833 }, { x: 0.75, y: 0.833 }];
 * const pixels = denormalizePoints(normalized, 1200, 900);
 * // Result: [{ x: 600, y: 150 }, { x: 300, y: 750 }, { x: 900, y: 750 }]
 */
export function denormalizePoints(
  points: Point[],
  canvasWidth: number,
  canvasHeight: number
): Point[] {
  if (canvasWidth === 0 || canvasHeight === 0) {
    console.warn('Canvas dimensions are zero, returning empty array');
    return [];
  }

  return points.map((point) =>
    toCanvasCoordinates(point.x, point.y, canvasWidth, canvasHeight)
  );
}

/**
 * Calculate bounding box for an annotation
 *
 * Returns the smallest rectangle that contains all points of the annotation.
 * Bounding box is in normalized coordinates [0, 1].
 *
 * @param annotation - Annotation data
 * @returns Bounding box in normalized coordinates
 *
 * @example
 * // Get bounds of a line annotation
 * const bbox = getBoundingBox(lineAnnotation);
 * // Result: { x: 0.2, y: 0.1, width: 0.6, height: 0.4 }
 */
export function getBoundingBox(annotation: AnnotationData): BoundingBox {
  if (annotation.type === 'marker') {
    // Marker: single point with small radius
    const radius = 0.01; // ~1% of canvas width for hit testing
    return {
      x: annotation.x - radius,
      y: annotation.y - radius,
      width: radius * 2,
      height: radius * 2,
    };
  }

  if (annotation.type === 'label') {
    // Label: use approximate size (can be refined with actual text metrics)
    const width = annotation.width || 0.1; // Default ~10% of canvas width
    const height = annotation.height || 0.03; // Default ~3% of canvas height
    return {
      x: annotation.x,
      y: annotation.y,
      width,
      height,
    };
  }

  if ((annotation.type === 'line' || annotation.type === 'polygon') && annotation.points) {
    // Line/Polygon: bounding box of all points
    const points = annotation.points;

    if (points.length === 0) {
      return { x: annotation.x, y: annotation.y, width: 0, height: 0 };
    }

    const xs = points.map((p) => p.x);
    const ys = points.map((p) => p.y);

    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    };
  }

  // Fallback: single point
  return {
    x: annotation.x,
    y: annotation.y,
    width: 0,
    height: 0,
  };
}

/**
 * Calculate distance between two points in normalized space
 *
 * @param p1 - First point (normalized)
 * @param p2 - Second point (normalized)
 * @returns Distance in normalized units
 */
export function calculateNormalizedDistance(p1: Point, p2: Point): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate distance between two points in canvas space
 *
 * @param p1 - First point (canvas pixels)
 * @param p2 - Second point (canvas pixels)
 * @returns Distance in canvas pixels
 */
export function calculateCanvasDistance(p1: Point, p2: Point): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate area of a polygon in normalized space
 *
 * Uses the shoelace formula for polygon area.
 *
 * @param points - Array of polygon vertices (normalized)
 * @returns Area in normalized units squared
 */
export function calculateNormalizedArea(points: Point[]): number {
  if (points.length < 3) {
    return 0;
  }

  let area = 0;
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    area += points[i].x * points[j].y;
    area -= points[j].x * points[i].y;
  }

  return Math.abs(area / 2);
}

/**
 * Check if a point is inside a bounding box
 *
 * @param point - Point to test (normalized)
 * @param bbox - Bounding box (normalized)
 * @returns True if point is inside or on the boundary
 */
export function isPointInBoundingBox(point: Point, bbox: BoundingBox): boolean {
  return (
    point.x >= bbox.x &&
    point.x <= bbox.x + bbox.width &&
    point.y >= bbox.y &&
    point.y <= bbox.y + bbox.height
  );
}

/**
 * Expand bounding box by a margin
 *
 * @param bbox - Original bounding box (normalized)
 * @param margin - Margin to add (normalized)
 * @returns Expanded bounding box (clamped to [0, 1])
 */
export function expandBoundingBox(bbox: BoundingBox, margin: number): BoundingBox {
  return {
    x: Math.max(0, bbox.x - margin),
    y: Math.max(0, bbox.y - margin),
    width: Math.min(1, bbox.width + margin * 2),
    height: Math.min(1, bbox.height + margin * 2),
  };
}

/**
 * Check if two bounding boxes intersect
 *
 * @param bbox1 - First bounding box (normalized)
 * @param bbox2 - Second bounding box (normalized)
 * @returns True if bounding boxes overlap
 */
export function doBoundingBoxesIntersect(bbox1: BoundingBox, bbox2: BoundingBox): boolean {
  return !(
    bbox1.x + bbox1.width < bbox2.x ||
    bbox2.x + bbox2.width < bbox1.x ||
    bbox1.y + bbox1.height < bbox2.y ||
    bbox2.y + bbox2.height < bbox1.y
  );
}
